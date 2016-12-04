import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { setUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';


class EventRow extends React.Component {
    render() {
        let maxp, price;
        if (parseInt(this.props.ev.max_players)) {
            maxp = (
                <div className="max badge">
                    <i className="fa fa-users"></i> { this.props.ev.max_players }
                </div>
            )
        } else {
            maxp = ''
        }

        if (parseFloat(this.props.ev.price)) {
            price = (
                <div className="badge price">
                    <i className="fa fa-money"></i> { parseFloat(this.props.ev.price) }
                </div>
            )
        } else {
            price = (
                <div className="badge price free">
                    free
                </div>
            )
        }

        return (
            <div className="event bg-info">
                <h2>{ this.props.ev.name }</h2>
                { price }
                <div className="start label label-default">{ moment(this.props.ev.start_date).format('lll') }</div>
                <div className="end label label-danger">{ moment(this.props.ev.end_date).format('lll') }</div>
                { maxp }
            </div>
        )
    }
}


export default class Events extends React.Component {
    state = { user: user, events: [] }

    componentDidMount() {
        this.updateEvents();
    }

    updateEvents = () => {
        var self = this;
        API.allEvents(user.apikey)
            .then(function(events) {
                self.setState({ events: events });
            });
    }

    render() {
        return (
            <div id="events" className="container">
                {this.state.events.map(function(ev, i){ return <EventRow ev={ev} key={i} />; })}
            </div>
        );
    }
}
