import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';

import { EventRow } from './events';

export class ClueRow extends React.Component {
    render() {
        return (
            <div className="clue">
                <strong>{ this.props.clue.challenge.name }</strong>:<br/>
                { this.props.clue.challenge.desc }
            </div>
        )
    }
}


export default class Event extends React.Component {
    state = { user: user, ev: null, clues: null }

    componentDidMount() {
        this.updateEvents();
        this.retitle();
    }

    updateClues = () => {
        var self = this;
        API.clues(self.state.ev.game.pk)
            .then(function(clues) {
                console.log(clues);
                self.setState({ clues: clues });
            });
    }

    updateEvents = () => {
        var self = this;
        API.EventDetail(self.props.params.pk)
            .then(function(ev) {
                self.setState({ ev: ev });
                self.updateClues();
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
        var ev = this.state.ev;

        return (
            <div className="event-desc">
                <EventRow ev={ev} expand={true} />

                <h2>Clues</h2>

                {this.state.clues && this.state.clues.map(function(clue, i) {
                    return <ClueRow ev={ev} clue={clue}/>;
                 })}

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
