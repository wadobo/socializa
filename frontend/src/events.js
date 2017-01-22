import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { setUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';


class EventRow extends React.Component {
    state = { joined: false }

    componentWillMount() {
      this.setState({ joined: this.props.ev.joined });
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
        if (this.props.active == ev) {
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

    render() {
        return (
            <div className="event">
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
        this.props.setAppState({ title: 'Events' });
    }

    updateEvents = () => {
        var self = this;
        API.allEvents(user.apikey)
            .then(function(events) {
                self.setState({ events: events });
            });
    }

    play = (e) => {
        console.log("play", e);
        user.activeEvent = e;
        this.setState({ active: user.activeEvent });
    }

    unplay = () => {
        console.log("unplay");
        user.activeEvent = null;
        this.setState({ active: user.activeEvent });
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
