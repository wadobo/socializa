import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';
import Purifier from 'html-purify';

import EventRow from './eventrow';
import ClueRow from './cluerow';

import Loading from './loading';

import { translate } from 'react-i18next';

// TODO, solve a clue. Clues can also be solved, but for now we don't
// support this.

class Event extends React.Component {
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
                var ev = self.state.ev;
                if (ev.solved) {
                    self.setState({ clues: clues, state: 'solved', solution: ev.solved});
                } else {
                    self.setState({ clues: clues, state: 'event'});
                }
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
        var title = this.props.t('events::Event');
        if (this.state.ev) {
          title = title + ' - ' + this.state.name;
        }
        this.props.setAppState({ title: title, active: 'event' });
    }

    tryToSolve = () => {
        this.setState({ state: 'solving' });
    }

    sendSolution = () => {
        const { t } = this.props;
        var self = this;
        var solution = document.querySelector(".solve-input").value;
        this.setState({ state: 'solving-loading' });
        API.solve(this.state.ev.pk, solution)
            .then(function(resp) {
                if (resp.status == 'correct') {
                    self.setState({ state: 'solved', solution: solution });
                    alert(t('events::Conglatulations!'));
                } else {
                    self.setState({ state: 'solving' });
                    alert(t('events::Wrong answer. Try again'));
                }
            }).catch(function(err) {
                self.setState({ state: 'solving' });
                alert(t('common::Unknown error'));
            });
    }

    renderSolveButton = () => {
        const { t } = this.props;
        var button = (
            <button onClick={ this.tryToSolve } className="btn btn-primary btn-fixed-bottom">
                {t('events::Solve')}
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
        const { t } = this.props;
        var solving = this.state.state == 'solving-loading';
        var button = (
            <button onClick={ this.sendSolution } className="btn btn-primary" type="button">{t('events::Go!')}</button>
        );
        if (this.state.state == 'solving-loading') {
            button = (
                <button className="btn btn-primary disabled" type="button">
                    <i className="fa fa-cog fa-spin fa-fw"></i>
                    <span className="sr-only">{t('events::Loading...')}</span>
                </button>
            );
        }
        return (
            <div className="event-solving">
                <h2>{this.state.ev.game.name}</h2>
                <p>{this.state.ev.game.desc}</p>
                <div className="input-group">
                  <input type="text" className="solve-input form-control" placeholder={t('events::The solution!')}/>
                  <span className="input-group-btn">
                    { button }
                  </span>
                </div>
            </div>
        );
    }

    renderEvent = () => {
        const { t } = this.props;
        switch (this.state.state) {
            case 'loading': return <Loading />;
            case 'solving-loading':
            case 'solving': return this.renderSolving();
            case 'solved':
            case 'event': {
                var ev = this.state.ev;

                return (
                    <div className="event-desc">
                        <EventRow ev={ev} expand={true} hiddenbuttons={true}/>

                        { this.state.clues && this.state.clues.length ?
                            <h2>{t('events::Clues')}</h2>
                         : (<p className="text-center">{t('events::No Clues yet')},
                                <Link to="/map"> <i className="fa fa-fw fa-map-marker"></i>
                                    {t('events::go to find someone')}
                                </Link>
                            </p>)
                        }

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
            <div id="events" className="container mbottom">
                { this.renderEvent() }
            </div>
        );
    }
}

export default Event = translate(['events', 'common'], { wait: true })(Event);
