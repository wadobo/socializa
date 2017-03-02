import React from 'react';
import QRCode from 'qrcode.react'
import { hashHistory } from 'react-router'
import { Link } from 'react-router'
import ol from 'openlayers'

import { user, logout } from './auth';
import API from './api';


export default class Map extends React.Component {
    state = { user: user, state: 'stopped' }

    componentDidMount() {
      let title = 'Map';
      if (user.activeEvent) {
        title = title + ' - ' + user.activeEvent.name;
      }
      this.props.setAppState({ 'title': title, 'active': 'map' });

      window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentDidUpdate() {
      this.view = new ol.View({
        center: ol.proj.fromLonLat([-5.9866369, 37.3580539]),
        zoom: 12
      });

      if (this.map) {
        this.map.setTarget(null);
      }

      this.map = new ol.Map({
        target: 'socializa-map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: this.view
      });

      this.startGeolocation();
      this.updateDimensions();
    }

    updateDimensions() {
        if (this.state.state != 'qrcode') {
            $('canvas').height($(window).height() - 120);
            this.map.updateSize();
        }
    }

    componentWillUnmount() {
        this.setState({ state: 'stopped' });

        if (this.watchID) {
            navigator.geolocation.clearWatch(this.watchID);
        }

        clearTimeout(this.updateTimer);
        clearTimeout(this.qrcodeTimer);

        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    onPosSuccess(position) {
        var view = this.view;
        var map = this.map;
        var positionFeature = this.positionFeature;

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var coords = [parseFloat(lon), parseFloat(lat)];

        API.setPos(lat, lon);

        var coordinates = new ol.geom.Point(ol.proj.fromLonLat(coords));
        var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        map.getView().animate({
          center: center,
          duration: 1000
        });
        positionFeature.setGeometry(coordinates);
    }

    onPosError(error) { }

    startGeolocation() {
      var view = this.view;
      var map = this.map;

      var positionFeature = new ol.Feature();
      this.positionFeature = positionFeature;
      positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({ src: 'app/images/geo1.svg' }),
        zIndex: 10
      }));
      positionFeature.customData = {name: 'me'};

      // my position layer
      new ol.layer.Vector({
        map: map,
        source: new ol.source.Vector({
          //features: [accuracyFeature, positionFeature]
          features: [positionFeature]
        })
      });

      this.playerList = new ol.source.Vector();

      var playersLayer = new ol.layer.Vector({
        map: map,
        source: this.playerList
      });

      if (!document.getElementById('popup')) {
        $("body").append('<div id="popup"></div>');
      }
      // starting tracking
      if (this.state.state == 'started') {
        var options = { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
        this.watchID = navigator.geolocation.watchPosition(this.onPosSuccess.bind(this), this.onPosError.bind(this), options);

        this.view.setZoom(18);

        this.popup = new ol.Overlay({
            element: document.getElementById('popup'),
            positining: 'bottom-center',
            stopEvent: false
        });
        this.map.addOverlay(this.popup);
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(this.updatePlayers.bind(this), 500);
      }

      var select = new ol.interaction.Select();
      var self = this;
      map.addInteraction(select);
      select.on('select', function(e) {
          var f = e.target.getFeatures();

          var element = document.getElementById('popup');

          if (f.getLength()) {
              var i = 0;
              var feature = f.getArray()[i];
              while (feature.customData.name == 'me') {
                i += 1;
                feature = f.getArray()[i];
              }

              self.popup.setPosition(feature.customData.coords);
              var id = feature.customData.id;
              var content = $('<center>' + feature.customData.name + '<center><br/><button class="btn btn-primary">Connect</button>');
              content.click(function() {
                  self.connectPlayer(id, user.activeEvent);
              });

              try { $(element).popover('destroy'); } catch (err) { }

              setTimeout(function() {
                $(element).popover({
                    'placement': 'top',
                    'html': true,
                    'content': content
                });
                $(element).popover("show");
              }, 200);
          }
      });
    }

    playersUpdated = (data) => {
        this.playerList.clear();
        var pl = this;
        data.forEach(function(p) {
            var playerFeature = new ol.Feature();
            playerFeature.setStyle(new ol.style.Style({
              image: new ol.style.Icon({ src: 'app/images/geo2.svg' }),
              zIndex: 100
            }));
            var coords = [parseFloat(p.pos.longitude), parseFloat(p.pos.latitude)];
            var point = new ol.proj.transform([coords[0], coords[1]], 'EPSG:4326', 'EPSG:3857');
            playerFeature.customData = {id: p.pk, coords: point, name: p.username};
            playerFeature.setGeometry(
                new ol.geom.Point(ol.proj.fromLonLat(coords))
            );

            pl.playerList.addFeature(playerFeature);
        });
    }

    updatePlayers = () => {
        var ev = user.activeEvent ? user.activeEvent.pk : user.activeEvent;
        API.nearPlayers(ev).
            then(this.playersUpdated.bind(this));
        if (this.state.state == 'started') {
            clearTimeout(this.updateTimer);
            this.updateTimer = setTimeout(this.updatePlayers.bind(this), 2000);
        }
    }

    connected = (resp) => {
        alert("Connected: " + resp);
        //TODO redirect to event if you are in an event
    }

    capturedQR = (id, ev, resp) => {
        var self = this;
        API.captured(id, ev, resp.text)
            .then(function(resp) {
                self.connected(resp.clue);
            })
            .catch(function(error) {
                alert("Invalid code!");
            });
    }

    qrcodePolling = (id, ev) => {
        var self = this;
        API.qrclue(id, ev)
            .then(function(resp) {
                if (resp.status == 'waiting') {
                    clearTimeout(self.qrcodeTimer);
                    self.qrcodeTimer = setTimeout(function() {
                        self.qrcodePolling.bind(self)(id, ev);
                    }, 1000);
                } else if (resp.status == 'contected') {
                    self.connected(resp.clue);
                }
            })
            .catch(function(err) {
                alert("error polling!");
            });
    }

    showQRCode = (id, ev, code) => {
        var self = this;
        var qrsize = $(document).width() - 80;
        this.setState({ state: 'qrcode', code: code, qrsize: qrsize });

        clearTimeout(this.qrcodeTimer);
        this.qrcodeTimer = setTimeout(function() {
            self.qrcodePolling.bind(self)(id, ev);
        }, 500);
    }

    startState = (e) => {
        this.setState({ state: 'started' });
    }

    showCamera = (id, ev) => {
        var self = this;
        window.scanQR(function(resp) {
            self.capturedQR.bind(self)(id, ev, resp);
        }, function(err) { });
    }

    connectPlayer = (id, ev=null) => {
        var self = this;
        ev = ev ? ev.pk : ev;
        API.connectPlayer(id, ev)
            .then(function(resp) {
                switch (resp.status) {
                    case 'connected':
                        self.connected(resp.clue);
                        break;
                    case 'step1':
                        self.showCamera(id, ev);
                        break;
                    case 'step2':
                        self.showQRCode(id, ev, resp.secret);
                        break;
                    default:
                        alert("too far, get near");
                        break;
                }
            });
    }

    start = (e) => {
        this.setState({ state: 'started' });
    }

    stop = (e) => {
        if (this.watchID) {
            navigator.geolocation.clearWatch(this.watchID);
        }
        this.setState({ state: 'stopped' });
    }

    mapRender = () => {
        return (
            <div>
                <div id="socializa-map">
                </div>

                {(
                    () => {
                        switch (this.state.state) {
                            case 'started':
                                return <button className="btn btn-fixed-bottom btn-danger" onClick={ this.stop }>Stop</button>
                            default:
                                return <button className="btn btn-fixed-bottom btn-success" onClick={ this.start }>Start</button>
                        }
                    }
                )()}
            </div>
        );
    }

    mapQR = () => {
        return (
            <div id="qrcode">
                <QRCode value={ this.state.code } size={ this.state.qrsize } />
                <div className="closebtn" onClick={ this.startState }><i className="fa fa-close"></i></div>
            </div>
        )
    }

    render() {
        if (this.state.state == 'qrcode') {
            return this.mapQR();
        }
        return this.mapRender();
    }
}
