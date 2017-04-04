import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'
import ol from 'openlayers'

import { storeUser, user, logout, getIcon } from './auth';
import API from './api';
import GEO from './geo';
import Bucket from './bucket';

import { translate } from 'react-i18next';


class Map extends React.Component {
    state = {
        user: user,
        state: 'stopped',
        eventMenu: false,
        events: []
    }

    firstCentre = false;

    componentDidMount() {
      this.retitle();
      window.addEventListener("resize", this.updateDimensions.bind(this));

      if (this.props.params.ev) {
        var self = this;
        self.toggleEventMenu();
        API.EventDetail(self.props.params.ev)
            .then(function(ev) {
                self.play(null, ev);
            });
      }

      if (GEO.status == 'started') {
        this.start();
      }
    }

    componentDidUpdate() {
      var svq = ol.proj.fromLonLat([-5.9866369, 37.3580539]);
      var c = Bucket.lastPost ? Bucket.lastPost : svq;
      this.view = new ol.View({
        center: c,
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
        $('canvas').height($(window).height() - 120);
        this.map.updateSize();
    }

    componentWillUnmount() {
        clearTimeout(this.updateTimer);

        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    updateEvents() {
        var self = this;
        API.allEvents({filter: 'mine'})
            .then(function(events) {
                self.setState({ events: events });
            });
    }

    centre = (e) => {
        this.map.getView().animate({
          center: Bucket.lastPost,
          duration: 1000
        });
    }

    onPosSuccess(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var coords = [parseFloat(lon), parseFloat(lat)];

        API.setPos(lat, lon);

        var coordinates = new ol.geom.Point(ol.proj.fromLonLat(coords));
        var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        Bucket.lastPost = center;

        if (this.firstCentre) {
            this.centre();
            this.firstCentre = false;
        }
        this.positionFeature.setGeometry(coordinates);

        var vd = user.activeEvent ? user.activeEvent.vision_distance : 0;
        var md = user.activeEvent ? user.activeEvent.meeting_distance : 0;
        var circle = new ol.geom.Circle(center, vd);
        this.visionFeature.setGeometry(circle);
        circle = new ol.geom.Circle(center, md);
        this.meetingFeature.setGeometry(circle);
    }

    onPosError(error) { }

    startGeolocation() {
      var map = this.map;

      this.positionFeature = new ol.Feature();
      this.positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({ src: 'app/images/geo1.svg' }),
        zIndex: 10
      }));
      this.positionFeature.customData = {name: 'me'};

      this.visionFeature = new ol.Feature();
      this.meetingFeature = new ol.Feature();

      // vision layer
      new ol.layer.Vector({
        map: map,

        source: new ol.source.Vector({
          features: [this.visionFeature]
        }),

        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
            stroke: new ol.style.Stroke({ width: 1, color: '#286090' })
        })

      });

      // meeting distance layer
      new ol.layer.Vector({
        map: map,

        source: new ol.source.Vector({
          features: [this.meetingFeature]
        }),

        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(92, 184, 92, 0.1)' }),
            stroke: new ol.style.Stroke({ width: 0.5, color: '#5cb85c' })
        })
      });

      // my position layer
      new ol.layer.Vector({
        map: map,

        source: new ol.source.Vector({
          features: [this.positionFeature]
        })
      });

      this.playerList = new ol.source.Vector();

      var playersLayer = new ol.layer.Vector({
        map: map,
        source: this.playerList
      });

      // starting tracking
      if (this.state.state == 'started') {
        GEO.successCB = this.onPosSuccess.bind(this);
        GEO.errorCB = this.onPosError.bind(this);
        GEO.start();

        this.view.setZoom(18);
        this.setUpdateTimer(500);
      }

      var self = this;
      var select = new ol.interaction.Select({
        filter: function (f, l) {
            if (f == self.visionFeature) {
                return false;
            }
            if (f == self.meetingFeature) {
                return false;
            }
            if (f == self.positionFeature) {
                return false;
            }
            return true;
        }
      });
      map.addInteraction(select);
      select.on('select', function(e) {
          var f = e.target.getFeatures();

          if (f.getLength()) {
              var i = 0;
              var feature = f.getArray()[i];
              hashHistory.push('/connect/' + feature.customData.id);
          }
      });
    }

    getIcon(p) {
        return new ol.style.Icon({ src: getIcon(p) });
    }

    playersUpdated = (data) => {
        var self = this;
        var fs = this.playerList.getFeatures();

        var noremove = {};

        data.forEach(function(p) {
            noremove[p.pk] = true;
            var playerFeature = null;

            var i = 0;
            while (i < fs.length) {
                var f = fs[i];
                if (f.customData.id == p.pk) {
                    playerFeature = f;
                    break;
                }
                i++;
            }

            if (playerFeature == null) {
                // adding not found features
                playerFeature = new ol.Feature();
                playerFeature.setStyle(new ol.style.Style({
                  image: self.getIcon(p),
                  zIndex: 100
                }));
                self.playerList.addFeature(playerFeature);
            }

            // moving the features
            var coords = [parseFloat(p.pos.longitude), parseFloat(p.pos.latitude)];
            var point = new ol.proj.transform([coords[0], coords[1]], 'EPSG:4326', 'EPSG:3857');
            playerFeature.customData = {id: p.pk, coords: point, name: p.username};
            playerFeature.setGeometry(
                new ol.geom.Point(ol.proj.fromLonLat(coords))
            );
        });

        // removing removed featured
        var i = 0;
        var l = fs.length;
        while (i < l) {
            var f = fs[i];
            if (noremove[f.customData.id]) {
                i++;
                continue;
            }

            this.playerList.removeFeature(f);
            l--;
        }
    }

    setUpdateTimer = (timeout) => {
        if (this.state.state == 'started') {
            clearTimeout(this.updateTimer);
            this.updateTimer = setTimeout(this.updatePlayers.bind(this), timeout);
        }
    }

    updatePlayers = () => {
        var ev = user.activeEvent ? user.activeEvent.pk : user.activeEvent;
        var self = this;

        API.nearPlayers(ev).
            then((data) => {
                self.playersUpdated(data);
                self.setUpdateTimer(2000);
            })
            .catch(() => { self.setUpdateTimer(5000); });
    }

    startState = (e) => {
        this.start();
    }

    start = (e) => {
        this.firstCentre = true;
        this.setState({ state: 'started' });
    }

    stop = (e) => {
        this.setState({ state: 'stopped' });
        GEO.stop();
        this.unplay();
    }

    toggleEventMenu = () => {
        if (this.state.eventMenu) {
            this.setState({ eventMenu: false });
        } else {
            this.updateEvents();
            this.setState({ eventMenu: true });
        }
    }

    retitle = () => {
        var title = this.props.t('map::Map');
        if (user.activeEvent) {
          title = title + ' - ' + user.activeEvent.name;
        }
        this.props.setAppState({ title: title, active: 'map' });
    }

    play = (e, ev) => {
        const { t } = this.props;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var self = this;
        API.setPlayingEvent(ev.pk)
            .then(function() {
                user.activeEvent = ev;
                storeUser();
                self.setState({ active: user.activeEvent });
                self.retitle();
                self.start();
                self.toggleEventMenu();
            }).catch(function() {
                alert(t("map::Error joining the game"));
            });
    }

    unplay = (e) => {
        const { t } = this.props;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var self = this;
        API.setPlayingEvent(null)
            .then(function() {
                user.activeEvent = null;
                storeUser();
                self.setState({ active: user.activeEvent });
                self.retitle();
            }).catch(function() {
                alert(t("map::Error leaving the game"));
            });
    }

    playGlobal = (e) => {
        const { t } = this.props;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var self = this;
        API.setPlayingEvent(null)
            .then(function() {
                user.activeEvent = null;
                storeUser();
                self.setState({ active: user.activeEvent });
                self.retitle();
                self.start();
                self.toggleEventMenu();
            }).catch(function() {
                alert(t("map::Error starting the game"));
            });
    }

    renderEventMenu = () => {
        const { t } = this.props;
        var self = this;
        if (this.state.eventMenu) {
            return (
                <div className="eventMenu">
                    <div className="ev" onClick={ (e) => self.playGlobal(e) }>{t('map::Global event')}</div>
                    { this.state.events.map(function(ev, i) {
                        return <div className="ev" onClick={ (e) => self.play(e, ev) }> { ev.name } </div>
                      })}
                </div>
            )
        } else {
            return <button className="btn btn-fixed-bottom btn-success" onClick={ this.toggleEventMenu }>{t('map::Start')}</button>
        }
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                <div id="socializa-map">
                </div>

                <div id="center-button" onClick={ this.centre } className="btn btn-circle btn-primary">
                    <i className="fa fa-street-view"></i>
                </div>

                {(
                    () => {
                        switch (this.state.state) {
                            case 'started':
                                return <button className="btn btn-fixed-bottom btn-danger" onClick={ this.stop }>{t('map::Stop')}</button>
                            default:
                                return this.renderEventMenu();
                        }
                    }
                )()}
            </div>
        );
    }
}

export default Map = translate(['map'], { wait: true })(Map);
