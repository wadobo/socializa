import React from 'react';

import { storeUser, user, logout } from './auth';
import API from './api';

import Loading from './loading';

import { translate } from 'react-i18next';

class Challenge extends React.Component {
    render() {
        var c = this.props.c;

        return (
            <div className="challenge">
                <div>
                    <strong>{ c.name }</strong>
                    { c.player &&
                        [
                        <span className="text-muted"> / { c.player.ptype }</span>,
                        <span className="text-primary"> / { c.player.username }</span>
                        ]
                    }
                </div>
            </div>
        )
    }
}

class Admin extends React.Component {
    state = {
        ev: null,
        cs: null,
        vd: 0,
        md: 0,
    }

    componentDidMount() {
        this.updateEvents();
    }

    updateEvents = () => {
        var self = this;
        API.EventDetail(self.props.params.pk)
            .then(function(ev) {
                self.setState({ ev: ev, vd: ev.vision_distance, md: ev.meeting_distance });
                self.retitle();
                self.updateChallenges();
            });
    }

    updateChallenges = () => {
        var self = this;
        API.getEventChallenges(self.props.params.pk)
            .then(function(cs) {
                self.setState({ cs: cs });
            });
    }

    retitle = () => {
        var title = 'Admin';
        if (this.state.ev) {
          title = title + ' - ' + this.state.ev.name;
        }
        this.props.setAppState({ title: title, active: 'event' });
    }

    save = () => {
        const { t } = this.props;

        API.setEventProperties(this.state.ev.pk, {
            vision_distance: this.state.vd,
            meeting_distance: this.state.md
        }).then(function() {
            alert(t('common::Saved!'));
        });
    }

    mdChange = (e) => {
        this.setState({md: e.target.value});
    }

    vdChange = (e) => {
        this.setState({vd: e.target.value});
    }

    render() {
        const { t } = this.props;
        var self = this;

        return (
            <div id="admin" className="container mbottom">
            { this.state.ev ?
                <div>
                    <h3 className="text-center">{ this.state.ev.name }</h3>

                    <table className="table table-responsive">
                        <tbody>
                        <tr>
                            <th>{t('admin::Game')}</th><td>{ this.state.ev.game.name }</td>
                        </tr>

                        <tr>
                            <th>{t('admin::Vision distance (m)')}</th>
                            <td>
                                <input type="number" className="form-control" placeholder={t('admin::vision distance')}
                                       onChange={ this.vdChange }
                                       value={ this.state.vd }/>
                            </td>
                        </tr>
                        <tr>
                            <th>{t('admin::Interact distance (m)')}</th>
                            <td>
                                <input type="number" className="form-control" placeholder={t('admin::interact distance')}
                                       onChange={ this.mdChange }
                                       value={ this.state.md }/>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <h3>{t('admin::Challenges')}</h3>
                    { this.state.cs ?
                        <div>
                        {self.state.cs.map(function(c, i) {
                            return <Challenge c={c} />
                        })}
                        </div>
                      :
                        <Loading />
                    }

                    <button className="btn btn-fixed-bottom btn-success" onClick={ this.save }>{t('common::Save')}</button>
                </div>

             :
                <Loading />
            }
            </div>
        );
    }
}

export default Admin = translate(['admin', 'common'], { wait: true })(Admin);
