import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';


export class EventRow extends React.Component {
    state = { joined: false, expand: false }

    componentWillMount() {
      this.setState({ joined: this.props.ev.joined });
    }

    expand = (e) => {
        if (this.state.expand) {
            this.setState({ expand: false });
        } else {
            this.setState({ expand: true });
        }
    }

    join = (e) => {
        var self = this;
        API.joinEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: true});
            }).catch(function(error) {
                alert(error);
            });
    }

    leave = (e) => {
        var self = this;
        API.leaveEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: false});
            }).catch(function(error) {
                alert(error);
            });
    }

    price = (ev) => {
        if (parseFloat(ev.price)) {
            return (
                <div className="badge price">
                    <i className="fa fa-money"></i> { parseFloat(ev.price) }
                </div>
            )
        }
        return (
            <div className="badge price free">
                free
            </div>
        )
    }

    maxp = (ev) => {
        if (parseInt(ev.max_players)) {
            return (
                <div className="max badge">
                    <i className="fa fa-users"></i> { ev.max_players }
                </div>
            )
        }
        return ''
    }

    joinButton = (ev) => {
        if (this.state.joined) {
            return (
                <button onClick={ this.leave } className="btn btn-danger">
                    Leave
                </button>
            )
        }

        return (
            <button onClick={ this.join } className="btn btn-success">
                Join
            </button>
        )
    }

    playButton = (ev) => {
        if (this.props.active && this.props.active.pk == ev.pk) {
            return (
                <button onClick={ this.props.unplay } className="btn btn-primary">
                    <i className="fa fa-close"></i> <i className="fa fa-gamepad"></i>
                </button>
            )
        }

        return (
            <button onClick={ this.props.play } className="btn btn-default">
                <i className="fa fa-gamepad"></i>
            </button>
        )
    }

    renderDesc() {
        if (!this.props.expand && !this.state.expand) {
            return (<span></span>)
        }

        return (
            <div className="row"><div className="col-xs-12">
            <div className="jumbotron">
                <h2>{ this.props.ev.game.name }</h2>
                <p>{ this.props.ev.game.desc }</p>
            </div>
            </div></div>
        );
    }

    render() {
        return (
            <div className="event" onClick={ this.expand.bind(this) }>
                <div className="row">
                    <div className="col-xs-2">
                        { this.joinButton(this.props.ev) }
                    </div>

                    <div className="col-xs-6">
                        <h2>{ this.props.ev.name }</h2>
                        <div className="start label label-default">{ moment(this.props.ev.start_date).format('lll') }</div>
                        <div className="end label label-danger">{ moment(this.props.ev.end_date).format('lll') }</div>
                    </div>

                    <div className="col-xs-2">
                        { this.playButton(this.props.ev) }
                    </div>
                </div>

                { this.renderDesc() }

                { this.price(this.props.ev) }
                { this.maxp(this.props.ev) }
            </div>
        )
    }
}


export default class Events extends React.Component {
    state = { user: user, events: [], active: user.activeEvent }

    componentDidMount() {
        this.updateEvents();
        this.retitle();
    }

    updateEvents = () => {
        var self = this;
        API.allEvents(user.apikey)
            .then(function(events) {
                self.setState({ events: events });
            });
    }

    retitle = () => {
        var title = 'Events';
        if (user.activeEvent) {
          title = title + ' - ' + user.activeEvent.name;
        }
        this.props.setAppState({ title: title });
    }

    play = (e) => {
        user.activeEvent = e;
        storeUser();
        this.setState({ active: user.activeEvent });
        this.retitle();
    }

    unplay = () => {
        user.activeEvent = null;
        storeUser();
        this.setState({ active: user.activeEvent });
        this.retitle();
    }

    render() {
        var self = this;
        return (
            <div id="events" className="container">
                {this.state.events.map(function(ev, i){
                    function play() { self.play(ev); }
                    return <EventRow ev={ev} key={i}
                                     active={self.state.active}
                                     play={play.bind(self)}
                                     unplay={self.unplay.bind(self)} />;
                 })}
            </div>
        );
    }
}
