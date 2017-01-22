import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';

import { EventRow } from './events';


export default class Event extends React.Component {
    state = { user: user, ev: null }

    componentDidMount() {
        this.updateEvents();
        this.retitle();
    }

    updateEvents = () => {
        var self = this;
        // TODO change this to get only one event, not all
        API.allEvents(user.apikey)
            .then(function(events) {
                var ev = null;
                events.forEach(function(e) {
                    if (e.pk == self.props.params.pk) {
                        self.setState({ ev: e });
                    }
                });
            });
    }

    retitle = () => {
        var title = 'Event';
        if (this.state.ev) {
          title = title + ' - ' + this.state.name;
        }
        this.props.setAppState({ title: title });
    }

    renderEvent = () => {
        if (!this.state.ev) {
            return <span></span>;
        }

        return (
            <div className="event-desc">
                <EventRow ev={this.state.ev} expand={true} />
            </div>
        );
    }

    render() {
        return (
            <div id="events" className="container">
                { this.renderEvent() }
            </div>
        );
    }
}
