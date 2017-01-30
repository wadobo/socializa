import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';

import { EventRow } from './events';

import Loading from './loading';

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
    state = {
        user: user,
        ev: null,
        clues: null,
        solution: null,
        state: 'loading' // loading | event | solving | solving-loading | solved
    }

    componentDidMount() {
        this.updateEvents();
        this.retitle();
    }

    updateClues = () => {
        var self = this;
        API.clues(self.state.ev.game.pk)
            .then(function(clues) {
                self.setState({ clues: clues });
                self.setState({ state: 'event' });
            });
    }

    updateEvents = () => {
        var self = this;
        API.EventDetail(self.props.params.pk)
            .then(function(ev) {
                self.setState({ ev: ev });
                // TODO update solution state if event is solved
                self.updateClues();
            });
    }

    retitle = () => {
        var title = 'Event';
        if (this.state.ev) {
          title = title + ' - ' + this.state.name;
        }
        this.props.setAppState({ title: title, active: 'event' });
    }

    tryToSolve = () => {
        this.setState({ state: 'solving' });
    }

    sendSolution = () => {
        var self = this;
        var solution = document.querySelector(".solve-input").value;
        this.setState({ state: 'solving-loading' });
        API.solve(this.state.ev.game.pk, solution)
            .then(function(resp) {
                self.setState({ state: 'solved', solution: solution });
                alert(resp.message);
            }).catch(function(err) {
                self.setState({ state: 'solving' });
                alert(err.message);
            });
    }

    renderSolveButton = () => {
        var button = (
            <button onClick={ this.tryToSolve } className="btn btn-primary btn-fixed-bottom">
                Solve
            </button>
        );

        if (this.state.state == 'solved') {
            button = (
                <button className="btn btn-success btn-fixed-bottom">
                    { this.state.solution }
                </button>
            );
        }
        return button;
    }

    renderSolving = () => {
        var solving = this.state.state == 'solving-loading';
        var button = (
            <button onClick={ this.sendSolution } className="btn btn-primary" type="button">Go!</button>
        );
        if (this.state.state == 'solving-loading') {
            button = (
                <button className="btn btn-primary disabled" type="button">
                    <i className="fa fa-cog fa-spin fa-fw"></i>
                    <span className="sr-only">Loading...</span>
                </button>
            );
        }
        return (
            <div className="event-solving">
                <h2>{this.state.ev.game.name}</h2>
                <p>{this.state.ev.game.desc}</p>
                <div className="input-group">
                  <input type="text" className="solve-input form-control" placeholder="The solution!"/>
                  <span className="input-group-btn">
                    { button }
                  </span>
                </div>
            </div>
        );
    }

    renderEvent = () => {
        switch (this.state.state) {
            case 'loading': return <Loading />;
            case 'solving-loading':
            case 'solving': return this.renderSolving();
            case 'solved':
            case 'event': {
                var ev = this.state.ev;

                return (
                    <div className="event-desc">
                        <EventRow ev={ev} expand={true} />

                        <h2>Clues</h2>

                        {this.state.clues && this.state.clues.map(function(clue, i) {
                            return <ClueRow ev={ev} clue={clue}/>;
                         })}

                         { this.renderSolveButton() }
                    </div>
                );
            }
        }
    }

    render() {
        return (
            <div id="events" className="container">
                { this.renderEvent() }
            </div>
        );
    }
}