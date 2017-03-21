import React from 'react';
import { hashHistory } from 'react-router';
import Purifier from 'html-purify';

import { user, getIcon } from './auth';
import API from './api';
import Bucket from './bucket';

import Loading from './loading';

import { translate } from 'react-i18next';
import i18n from './i18n';

export function connected(resp) {
    if (resp.pk) {
        Bucket.clue = resp;
        hashHistory.push('/clue');
    } else {
        Bucket.clue = null;
        alert(i18n.t("connect::Connected!"));
        hashHistory.push('/map');
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
        API.getProfile(self.props.params.pk)
            .then(function(profile) {
                if (!profile.username) {
                    alert(t('connect::Too far!'));
                    hashHistory.push('/map');
                }
                self.setState({ other: profile });
            });
    }

    goBack = () => {
        hashHistory.push('/map');
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
                        connected(resp.clue);
                        break;
                    case 'step1':
                        hashHistory.push('/qrcapt/' + id + '/' + ev);
                        break;
                    case 'step2':
                        hashHistory.push('/qrcode/' + id + '/' + ev + '/' + resp.secret);
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
        console.log("connect", this.state.other);

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

export default translate(['connect'], { wait: true })(Connect);
