import React from 'react';
import { withRouter } from 'react-router';
import Purifier from 'html-purify';

import { user, getIcon } from './auth';
import API from './api';
import Bucket from './bucket';

import Loading from './loading';

import { translate } from 'react-i18next';
import i18n from './i18n';

export function connected(self, clues) {
    if (clues.length) {
        Bucket.clues = clues;
        self.props.history.push('/clue');
    } else {
        Bucket.clues = null;
        alert(i18n.t("connect::I've nothing to say"));
        self.props.history.push('/map');
    }
}


class Connect extends React.Component {
    state = {
        user: user,
        other: null
    }

    componentDidMount() {
        this.getProfile();
    }

    getProfile = () => {
        const { t } = this.props;

        var self = this;
        API.getProfile(self.props.match.params.pk)
            .then(function(profile) {
                if (!profile.username) {
                    alert(t('connect::Too far!'));
                    self.props.history.push('/map');
                }
                self.setState({ other: profile });
            });
    }

    goBack = () => {
        this.props.history.push('/map');
    }

    connect = () => {
        this.connectPlayer(this.state.other.pk, user.activeEvent);
    }

    connectPlayer = (id, ev=null) => {
        const { t } = this.props;
        var self = this;
        ev = ev ? ev.pk : ev;
        API.connectPlayer(id, ev)
            .then(function(resp) {
                switch (resp.status) {
                    case 'connected':
                        connected(self, resp.clues);
                        break;
                    case 'step1':
                        self.props.history.push('/qrcapt/' + id + '/' + ev);
                        break;
                    case 'step2':
                        self.props.history.push('/qrcode/' + id + '/' + ev + '/' + resp.secret);
                        break;
                    default:
                        alert(t('connect::too far, get near'));
                        break;
                }
            });
    }

    render() {
        const { t } = this.props;
        var self = this;
        function createMarkup() {
            var purifier = new Purifier();
            var input = self.state.other.about || "";
            var result = purifier.purify(input);
            return {__html: result };
        }

        var icon = this.state.other ? getIcon(this.state.other) : '';

        return (
            <div id="connect" className="container mbottom">
            { this.state.other ?
                <div>
                    <div className="closebtn" onClick={ this.goBack }><i className="fa fa-close"></i></div>
                    <h2 className="text-center">{ this.state.other.username }</h2>

                    <div className="text-center">
                        <img src={ icon } />
                    </div>
                    <div className="text-center" dangerouslySetInnerHTML={ createMarkup() } />
                    <button className="btn btn-fixed-bottom btn-primary" onClick={ this.connect }>{t('connect::Interact')}</button>
                </div>
             :
                <Loading />
            }
            </div>
        );
    }
}

export default translate(['connect'], { wait: true })(withRouter(Connect));
