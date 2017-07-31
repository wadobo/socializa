import React from 'react';
import { withRouter } from 'react-router';

import { storeUser, user, logout, getIcon } from './auth';
import API from './api';
import GEO from './geo';
import Bucket from './bucket';

import { translate } from 'react-i18next';


import L from 'leaflet';

// Patching leaflet to allow marker rotation
// based on: https://github.com/bbecquet/Leaflet.RotatedMarker
function patchL() {
    var proto_initIcon = L.Marker.prototype._initIcon;
    var proto_setPos = L.Marker.prototype._setPos;

    var oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

    L.Marker.addInitHook(function () {
        var iconOptions = this.options.icon && this.options.icon.options;
        var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
        if (iconAnchor) {
            iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
        }
        this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom' ;
        this.options.rotationAngle = this.options.rotationAngle || 0;

        // Ensure marker keeps rotated during dragging
        this.on('drag', function(e) { e.target._applyRotation(); });
    });

    L.Marker.include({
        _initIcon: function() {
            proto_initIcon.call(this);
        },

        _setPos: function (pos) {
            proto_setPos.call(this, pos);
            this._applyRotation();
        },

        _applyRotation: function () {
            if(this.options.rotationAngle) {
                this._icon.style[L.DomUtil.TRANSFORM+'Origin'] = this.options.rotationOrigin;

                if(oldIE) {
                    // for IE 9, use the 2D rotation
                    this._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
                } else {
                    // for modern browsers, prefer the 3D accelerated version
                    this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
                }
            }
        },

        setRotationAngle: function(angle) {
            this.options.rotationAngle = angle;
            this.update();
            return this;
        },

        setRotationOrigin: function(origin) {
            this.options.rotationOrigin = origin;
            this.update();
            return this;
        }
    });
}
patchL();


class Player {
    constructor(map, p, icon) {
        let deficon = L.icon({
            iconUrl: 'app/images/geo1.svg',
            iconSize: [28, 28],
        });

        this.map = map;
        this.marker = L.marker([0, 0], {
            zIndexOffset: -1000,
        });
        this.marker.setIcon(icon || deficon);
        this.marker.customData = {name: 'me'};

        this.layers = L.layerGroup([this.marker]);
        this.layers.addTo(this.map);
    }

    showCircle(radius, color) {
        let l = L.circle(this.marker.getLatLng(), radius, {
            color: color,
            weight: 1,
            fillOpacity: 0.1,
        });
        this.layers.addLayer(l);
    }

    showDirection() {
        let icon = L.icon({
            iconUrl: 'app/images/heading.svg',
            iconAnchor: [16, 26],
            iconSize: [32, 42],
        });

        this.direction = L.marker(this.marker.getLatLng(), {
            zIndexOffset: -1001,
            rotationOrigin: 'center center',
            rotationAngle: 0
        });

        this.direction.setIcon(icon);
        this.layers.addLayer(this.direction);
    }

    rotate(deg) {
        this.direction.setRotationAngle(deg);
    }

    moveTo([lat, lng]) {
        this.layers.eachLayer(l => l.setLatLng([lat, lng]));
    }

    remove() {
        this.layers.remove();
    }
}


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

      if (this.props.match.params.ev) {
        var self = this;
        self.toggleEventMenu();
        API.EventDetail(self.props.match.params.ev)
            .then(function(ev) {
                self.play(null, ev);
            });
      }

      if (GEO.status == 'started') {
        this.start();
      }
    }

    componentDidUpdate() {
        this.initMap();
        this.startGeolocation();
        this.updateDimensions();
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

    initMap() {
        if (this.map) {
            return;
        }

        let svq = [37.3580539, -5.9866369];
        let c = Bucket.lastPost ? Bucket.lastPost : svq;
        this.map = L.map('socializa-map').setView(c, 12);

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    //  this.view.on('change:rotation', function() {
    //    self.rotationChanged();
    //  });
    }

    updateDimensions() {
        $('#socializa-map').height($(window).height() - 120);
        this.map.invalidateSize();
    }

    centre = (e) => {
        this.map.panTo(Bucket.lastPost, {
            animate: true,
            duration: 1,
        });
    }

    rotationChanged() {
        //var viewRot = this.map.getView().getRotation();
        //var newrot = (this.heading || 0) + viewRot;
        //this.direction.setRotation(newrot);
        this.player.rotate(this.heading);
    }

    onCompass(heading) {
        // degress to radians
        var h = heading * Math.PI / 180;
        this.heading = h;
        this.rotationChanged();
    }

    onPosSuccess(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var coords = [parseFloat(lat), parseFloat(lon)];
        API.setPos(lat, lon);

        Bucket.lastPost = coords;

        if (this.firstCentre) {
            this.centre();
            this.firstCentre = false;
        }

        this.player.moveTo(coords);
    }

    onPosError(error) { }

    startGeolocation() {
        if (this.player || this.state.state == 'stopped') {
            return;
        }

        let vd = user.activeEvent ? user.activeEvent.vision_distance : 0;
        let md = user.activeEvent ? user.activeEvent.meeting_distance : 0;

        this.player = new Player(this.map, [0, 0]);
        this.player.showCircle(vd, '#286090');
        this.player.showCircle(md, '#5cb85c');
        this.player.showDirection();

        if (this.state.state == 'started') {
          GEO.successCB = this.onPosSuccess.bind(this);
          GEO.errorCB = this.onPosError.bind(this);
          GEO.compassCB = this.onCompass.bind(this);
          GEO.start();

          this.map.setZoom(18);
          this.setUpdateTimer(500);
        }

        this.playerList = L.layerGroup();
        this.playerList.addTo(this.map);
    }

    getIcon(p) {
        return L.icon({
            iconUrl: getIcon(p),
            iconSize: [28, 28],
        });
    }

    playersUpdated = (data) => {
        let pl = this.playerList.getLayers();
        let noremove = {};

        data.map((p) => {
            noremove[p.pk] = true;
            let layer = null;

            let i = 0;
            while (i < pl.length) {
                let f = pl[i];
                if (f.customData.id == p.pk) {
                    layer = f;
                    break;
                }
                i++;
            }

            let point = [p.pos.latitude, p.pos.longitude];

            if (layer == null) {
                // adding not found layers
                layer = L.marker(point);
                layer.setIcon(this.getIcon(p));

                layer.on("click", (e) => {
                    this.props.history.push('/connect/' + e.target.customData.id);
                });

                this.playerList.addLayer(layer);
            }
            layer.customData = {id: p.pk, coords: point, name: p.username};
            layer.setLatLng(point);
        });

        // removing removed layers
        let i = 0;
        let l = pl.length;
        while (i < l) {
            var f = pl[i];
            if (noremove[f.customData.id]) {
                i++;
                continue;
            }

            this.playerList.removeLayer(f);
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

        if (this.player) {
            this.player.remove();
            this.player = null;
        }

        if (this.playerList) {
            this.playerList.eachLayer(l => l.remove());
            this.playerList.remove();
            this.playerList = null;
        }
    }

    viewEvent = (e) => {
        this.props.history.push('/event/' + user.activeEvent.pk);
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
        Bucket.setAppState({ title: title, active: 'map' });
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
                        return <div className="ev" key={ev.pk} onClick={ (e) => self.play(e, ev) }> { ev.name } </div>
                      })}
                </div>
            )
        } else {
            return <button className="btn btn-fixed-bottom btn-success" onClick={ this.toggleEventMenu }>{t('map::Start')}</button>
        }
    }

    render() {
        const { t } = this.props;

        var stopbtn = <button key={1} className="btn btn-danger btn-fixed-bottom" onClick={ this.stop }>{t('map::Stop')}</button>;
        if (user.activeEvent) {
            stopbtn = [
                <button key={0} className="btn btn-success btn-fixed-bottom-left" onClick={ this.viewEvent }>{t('map::Clues')}</button>,
                <button key={1} className="btn btn-danger btn-fixed-bottom-right" onClick={ this.stop }>{t('map::Stop')}</button>
            ];
        }

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
                                return stopbtn;
                            default:
                                return this.renderEventMenu();
                        }
                    }
                )()}
            </div>
        );
    }
}

export default Map = translate(['map'], { wait: true })(withRouter(Map));
