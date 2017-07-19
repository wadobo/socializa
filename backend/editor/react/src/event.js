import React, { Component } from 'react';
import Truncate from 'react-truncate-html';


class EventEditorForm extends Component {
    componentDidMount() {
        this.initDatePicker();
    }

    componentDidUpdate() {
        this.initDatePicker();
    }

    initDatePicker() {
        window.jQuery(".datetimepicker").datetimepicker({
            format: 'YYYY-MM-DD HH:mm ZZ',
            sideBySide: true
        });
        window.jQuery(".datetimepicker").on("dp.change", function(e) {
            let ev = new Event('input', { bubbles: true} );
            window.jQuery(this)[0].dispatchEvent(ev);
        });
    }

    changeField = (field, e) => {
        this.props.actions.setEvProp(field, e.target.value);
    }

    tinyChange = (field, e) => {
        var content = e.target.getContent();
        this.props.actions.setEvProp(field, content);
    }

    render() {
        const { ev, actions } = this.props;

        return (
            <div className="row">
                <div className="col-sm-6">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" className="form-control" name="ev_name"
                               onChange={this.changeField.bind(this, 'name')}
                               placeholder="Name" value={ev.name}/>
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <div className="input-group">
                            <input type="text" className="form-control" name="ev_price"
                                   onChange={this.changeField.bind(this, 'price')}
                                   placeholder="Price" value={ev.price}/>
                            <span className="input-group-addon">€</span>
                        </div>
                        <p className="help-block">Use 0 for free events</p>
                    </div>
                    <div className="form-group">
                        <label>Max Players</label>
                        <div className="input-group">
                            <input type="text" className="form-control" name="ev_max_players"
                                   onChange={this.changeField.bind(this, 'max_players')}
                                   placeholder="Max players" value={ev.max_players}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-user" aria-hidden="true"></span>
                            </span>
                        </div>
                        <p className="help-block">Use 0 for unlimited</p>
                    </div>
                </div>

                <div className="col-sm-6">
                    <div className="form-group">
                        <div className="input-group">
                            <input type="text" className="form-control" name="ev_vision_distance"
                                   onChange={this.changeField.bind(this, 'vision_distance')}
                                   placeholder="Vision distance" value={ev.vision_distance}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
                            </span>
                        </div>
                        <p className="help-block">Vision distance in meters</p>
                    </div>
                    <div className="form-group">
                        <div className="input-group">
                            <input type="text" className="form-control" name="ev_meeting_distance"
                                   onChange={this.changeField.bind(this, 'meeting_distance')}
                                   placeholder="Interaction distance" value={ev.meeting_distance}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-qrcode" aria-hidden="true"></span>
                            </span>
                        </div>
                        <p className="help-block">Interaction distance in meters</p>
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <input type="text" className="form-control datetimepicker" name="ev_start_date"
                                   onChange={this.changeField.bind(this, 'start_date')}
                                   placeholder="Start date" value={ev.start_date}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
                            </span>
                        </div>
                        <p className="help-block">Use the form: yyyy-mm-dd HH:MM</p>
                    </div>
                    <div className="form-group">
                        <div className="input-group">
                            <input type="text" className="form-control datetimepicker" name="ev_end_date"
                                   onChange={this.changeField.bind(this, 'end_date')}
                                   placeholder="End date" value={ev.end_date}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
                            </span>
                        </div>
                        <p className="help-block">Use the form: yyyy-mm-dd HH:MM</p>
                    </div>
                </div>
            </div>
        );
    }
}


export class EventGame extends Component {
    selectGame = (g) => {
        this.props.actions.setEvProp('game', g);
        this.props.actions.setEvProp('state', 'map');
    }

    render() {
        let classes = 'game';
        if (this.props.selected) {
            classes += ' bg-info';
        }

        return (
            <div className={classes} onClick={this.selectGame.bind(this, this.props.game)}>
                <div className="row">
                    <div className="col-sm-8">
                        <h3>{ this.props.game.name }</h3>
                    </div>
                    <div className="col-sm-4 text-right">
                        { this.props.game.challenges.length } Clues
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 text-muted">
                        <Truncate lines={2} dangerouslySetInnerHTML={{__html: this.props.game.desc}}/>
                    </div>
                </div>
            </div>
        );
    }
}


export class EventListGames extends Component {
    state = {
        games: [],
    }

    componentDidMount() {
        this.searchGames();
    }

    searchGames = (q) => {
        $.get(`/editor/api/games/`)
            .then((r) => this.setState({games: r}))
            .catch((e) => alert(e));
    }

    render() {
        const {ev, actions} = this.props;

        return (
            <div>
                <h2>Games</h2>

                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Search for..." />
                  <span className="input-group-btn">
                    <button className="btn btn-default" type="button">
                        <span className="glyphicon glyphicon-search"></span>
                    </button>
                  </span>
                </div>

                { this.state.games.map((g) => <EventGame key={g.pk} actions={actions} game={g} selected={ev.game && g.pk == ev.game.pk} />) }

            </div>
        );
    }
}


export class EventMap extends Component {
    idx = 0;

    upPlayer = (i, e) => {
        let val = e.target.value;
        this.props.actions.upPlayer(i, 'username', val);

        const { ev } = this.props;
        let layer = ev.players[i].layer;
        if (layer) {
            layer.unbindTooltip().bindTooltip(val, { permanent: true, direction: 'top', });
        }
    }

    rmPlayer = (i, e) => {
        this.props.actions.rmPlayer(i);
    }

    changeType = (i, e) => {
        let val = e.target.value;
        this.props.actions.upPlayer(i, 'ptype', val);
    }

    componentDidMount() {
        this.initDrag();
        this.initMap();
    }

    componentDidUpdate() {
        this.initDrag();
        this.initMap();
    }

    dragStart = (e) => {
        let target = e.target;
        let idx = target.getAttribute('data-index');
        target.style.opacity = '0.9';

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text', idx);
        this.idx = idx;
    }

    dragEnd = (e) => {
        let target = e.target;
        target.style.opacity = '1';
    }

    dragOver = (e) => {
        if (e.stopPropagation) { e.stopPropagation(); }
        if(e.preventDefault) { e.preventDefault(); }

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    dragEnter = (e) => {
        let target = $(e.target).hasClass("drops") ? $(e.target) : $(e.target).parent(".drops");
        target.addClass("over");
    }

    dragLeave = (e) => {
        let target = $(e.target).hasClass("drops") ? $(e.target) : $(e.target).parent(".drops");
        target.removeClass("over");
    }

    drop = (e, el) => {
        let target = $(e.target).hasClass("drops") ? $(e.target) : $(e.target).parent(".drops");
        let player = target.data('index');
        let challenge = this.idx;
        target.removeClass("over");

        if (e.stopPropagation) { e.stopPropagation(); }
        if(e.preventDefault) { e.preventDefault(); }

        this.props.actions.addPlayerChallenge(player, challenge);

        return false;
    }

    initDrag = () => {
        let drags = document.querySelectorAll('.challenge');
        let drops = document.querySelectorAll('.drops');

        drags.forEach((c) => {
            c.removeEventListener('dragstart', this.dragStart);
            c.removeEventListener('dragend', this.dragEnd);
            c.addEventListener('dragstart', this.dragStart, false);
            c.addEventListener('dragend', this.dragEnd, false);
        });

        drops.forEach((c) => {
            c.removeEventListener('dragenter', this.dragEnter);
            c.removeEventListener('dragover', this.dragOver);
            c.removeEventListener('dragleave', this.dragLeave);
            c.removeEventListener('drop', this.drop);
            c.addEventListener('dragenter', this.dragEnter, false);
            c.addEventListener('dragover', this.dragOver, false);
            c.addEventListener('dragleave', this.dragLeave, false);
            c.addEventListener('drop', this.drop, false);
        });
    }

    rmPlayerChallenge = (p, c) => {
        this.props.actions.rmPlayerChallenge(p, c);
    }

    initMap = () => {
        if (this.map) {
            return;
        }

        let self = this;

        const { actions, ev } = this.props;

        this.map = L.map('map').setView([37.3580539, -5.9866369], 13);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // search with openstreetmap
        this.map.addControl( new L.Control.Search({
            url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat','lon'],
            marker: L.circleMarker([0,0], {radius:10}),
            autoCollapse: true,
            autoType: false,
            minLength: 2
        }) );

        // Adding drawing tools
        // TODO: load current players and zone
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        // Set the title to show on the polygon button
        L.drawLocal.draw.toolbar.buttons.polygon = 'Draw the event zone';

        let drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: { shapeOptions: { color: '#880000' } },
                polyline: false,
                circle: false,
                rectangle: false,
                marker: true
            },
            edit: {
                featureGroup: self.drawnItems,
                remove: false
            }
        });
        this.map.addControl(drawControl);

        this.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                layer.bindTooltip("newplayer", { permanent: true, direction: 'top', });
                layer.idx = ev.players.length;

                let { lat, lng } = layer.getLatLng();
                actions.newPlayer([lng, lat], layer);
            } else {
                if (self.zone) {
                    self.zone.remove();
                }
                self.zone = layer;
                actions.setEvProp('place', self.zone.toGeoJSON());
            }

            self.drawnItems.addLayer(layer);
        });

        this.map.on(L.Draw.Event.EDITED, function (e) {
            e.layers.eachLayer(function(l) {
                if (l.idx !== undefined) {
                    let { lat, lng } = l.getLatLng();
                    actions.upPlayer(l.idx, 'pos', [lng, lat]);
                }
            });
        });

        this.drawPlace();
        this.drawPlayers();
    }

    drawPlace = () => {
        const { ev } = this.props;

        if (!ev.place) {
            return;
        }

        this.zone = L.geoJson(JSON.parse(ev.place), { style: {color: "#880000"} });
        this.drawnItems.addLayer(this.zone);
        this.map.fitBounds(this.zone.getBounds());
    }

    drawPlayers = () => {
    }

    render() {
        const {ev, actions} = this.props;
        return (
            <div>
                <h2>Map</h2>
                <div id="map"></div>

                <h2>Assign Clues / Players</h2>
                <div className="well row">
                    <div className="col-sm-6">
                        <h3 className="text-center">Clues</h3>
                        <ul className="list-group">
                            { ev.game.challenges.map((ch, i) =>
                                <li draggable="true" key={ch.pk} className="challenge list-group-item" data-index={i}>{ch.name}</li>
                            )}
                        </ul>
                    </div>
                    <div className="col-sm-6">
                        <h3 className="text-center">Players</h3>
                        <ul className="list-group">
                            { ev.players.map((p, i) =>
                                <li key={p.pk} className="list-group-item">
                                    <div className="row">
                                        <div className="col-xs-6">
                                            <input type="text" className="form-control" value={p.username} onChange={this.upPlayer.bind(this, i)} />
                                        </div>
                                        <div className="col-xs-4">
                                            <select onChange={this.changeType.bind(this, i)} value={p.ptype}>
                                                <option value="pos">Position</option>
                                                <option value="ai">AI</option>
                                                <option value="actor">Actor</option>
                                            </select>
                                        </div>
                                        <div className="col-xs-2 text-right">
                                            <button className="btn btn-danger" onClick={this.rmPlayer.bind(this, i)}>
                                                <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <ul className="list-group well drops" data-index={i}>
                                        { p.challenges && p.challenges.map((c, j) =>
                                            <li key={c.pk} className="list-group-item">
                                                <span className="badge pointer" onClick={this.rmPlayerChallenge.bind(this, i, j)}>&times;</span>
                                                {c.name}
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}


export default class EventEditor extends Component {
    state = {
        name: 'New Event',
        price: 0,
        start_date: '',
        end_date: '',
        max_players: 10,
        vision_distance: 50,
        meeting_distance: 100,
        players: [],
        game: null,
        init: false,
        state: 'select', // states: select, map
        idx: 1,
    }

    componentDidMount() {
        $.ajaxSetup({
             headers: { 'X-CSRFToken': $('meta[name="csrf-token"]').attr('content') }
        });

        if (evid) {
            $.get(`/editor/api/ev/${evid}/`)
                .then((r) => this.setState(Object.assign({}, {init: true}, r)))
                .catch((e) => alert(e));
        }
    }

    setEvProp = (k, v) => {
        var newst = this.state;
        newst[k] = v;
        this.setState(newst);
    }

    newPlayer = (pos, layer) => {
        var ps = this.state.players;
        ps.push({
            pk: -this.state.idx,
            pos: pos || (0, 0),
            ptype: 'pos',
            about: '',
            username: 'newplayer',
            layer: layer,
        });
        this.setState({players: ps, idx: this.state.idx + 1});
    }

    rmPlayer = (i) => {
        var ps = this.state.players;
        ps[i].layer && ps[i].layer.remove();
        ps.splice(i, 1);
        this.setState({players: ps});
    }

    upPlayer = (i, k, v) => {
        var ps = this.state.players;
        ps[i][k] = v;
        this.setState({players: ps});
    }

    addPlayerChallenge = (p, c) => {
        let ps = this.state.players;
        let chs = this.state.game.challenges;
        if (ps[p] && ps[p].challenges) {
            if (!ps[p].challenges.find((i) => i.pk == chs[c].pk))
                ps[p].challenges.push(chs[c]);
        } else {
            ps[p].challenges = [chs[c]];
        }
        this.setState({players: ps});
    }

    rmPlayerChallenge = (p, c) => {
        let ps = this.state.players;
        if (ps[p] && ps[p].challenges) {
            ps[p].challenges.splice(c, 1);
        }
        this.setState({players: ps});
    }

    saveEv = (e) => {
        var url = '/editor/api/ev/';
        if (evid) {
            url = `${url}${evid}/`;
        }

        var data = this.state;
        $.ajax({
          type: "POST",
          url: url,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: (r) => alert("Saved!"),
          dataType: "json"
        });
    }

    render() {
        var ev = this.state;

        console.log(ev);

        var actions = {
            setEvProp: this.setEvProp.bind(this),
            newPlayer: this.newPlayer.bind(this),
            rmPlayer: this.rmPlayer.bind(this),
            upPlayer: this.upPlayer.bind(this),
            addPlayerChallenge: this.addPlayerChallenge.bind(this),
            rmPlayerChallenge: this.rmPlayerChallenge.bind(this),
        };

        if (evid && !this.state.init) {
            return <h2 className="text-center">Loading...</h2>
        }

        return (
            <div id="ev-editor">
                <h1>Event Editor</h1>

                <EventEditorForm actions={actions} ev={ev} />

                { ev.state == 'select' && ev.game && <button className="btn btn-primary" onClick={() => this.setEvProp('state', 'map')}>Assign clues / players</button> }
                { ev.state == 'map' && <button className="btn btn-primary" onClick={() => this.setEvProp('state', 'select')}>Change Game</button> }

                { ev.state == 'select' && <EventListGames ev={ev} actions={actions} /> }
                { ev.state == 'map' && <EventMap ev={ev} actions={actions} /> }

                <button onClick={this.saveEv} className="btn btn-primary btn-block btn-lg">Save</button>
                <hr/>
            </div>
        );
    }
}
