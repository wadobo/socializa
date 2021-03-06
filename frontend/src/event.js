import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { storeUser, user, logout } from './auth';
import API from './api';
import moment from 'moment';
import Purifier from 'html-purify';

import EventRow from './eventrow';
import ClueRow from './cluerow';

import EventSolve from './eventsolve';

import Loading from './loading';

import Bucket from './bucket';
import { translate } from 'react-i18next';

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
                    self.setState({ clues: clues, state: 'solved', solved: ev.solved});
                } else {
                    self.setState({ clues: clues, state: 'event'});
                }
            }).catch(function(error) {
                alert(error);
            });
    }

    goMap = () => {
        this.props.history.push('/map');
    }


    updateEvents = () => {
        var self = this;
        API.EventDetail(self.props.match.params.pk)
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
        Bucket.setAppState({ title: title, active: 'event' });
    }

    tryToSolve = () => {
        this.setState({ state: 'solving' });
    }

    renderSolveButton = () => {
        const { t } = this.props;

        if (this.state.state == 'solved') {
            return [
                <button key={0} className="btn btn-primary btn-fixed-bottom-left" onClick={this.goMap}> {t('events::Map')} </button>,
                <button key={1} className="btn btn-success btn-fixed-bottom-right"> { this.state.ev.solution } </button>
            ];
        }


        return [
            <button key={0} className="btn btn-success btn-fixed-bottom-left" onClick={this.goMap}> {t('events::Map')} </button>,
            <button key={1} className="btn btn-primary btn-fixed-bottom-right" onClick={ this.tryToSolve }> {t('events::Solve')} </button>
        ];
    }

    solved = () => {
        this.setState({'state': 'loading'});
        this.updateEvents();
    }

    renderEvent = () => {
        const { t } = this.props;
        switch (this.state.state) {
            case 'loading': return <Loading />;
            case 'solving-loading':
            case 'solving': return <EventSolve state={this.state.state} ev={this.state.ev} finish={this.solved} />;
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
                            return <ClueRow key={clue.pk} ev={ev} clue={clue}/>;
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

export default Event = translate(['events', 'common'], { wait: true })(withRouter(Event));
