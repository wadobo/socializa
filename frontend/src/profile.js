import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { setUser, user, logout } from './auth';
import Loading from './loading';
import API from './api';

import { translate } from 'react-i18next';


class Profile extends React.Component {
    state = { user: user, player: null }

    componentDidMount() {
        this.props.setAppState({ title: this.props.t('profile::Profile'), active: 'profile' });
        this.updateProfile();
    }

    updateProfile = () => {
        var self = this;
        API.getProfile()
            .then(function(player) {
                self.setState({ player: player });
            });
    }

    save = (e) => {
        var p = this.state.player;
        API.setProfile(p)
            .then(function() {
                hashHistory.push('/map');
            });

        setUser(this.state.user);
        // this show loading
        this.setState({player: null});
    }

    aboutChange = (e) => {
        var p = this.state.player;
        p.about = e.target.value;
        this.setState({player: p});
    }

    addInterest = (e) => {
        var p = this.state.player;
        if (p.interests == undefined) {
            p.interests = [];
        }

        var v = document.querySelector('#interest');

        p.interests.push(v.value);
        v.value = '';
        this.setState({player: p});
    }

    removeInterest = (i, e) => {
        var p = this.state.player;
        p.interests.splice(i, 1);
        this.setState({player: p});
    }

    changePassword = (e) => {
        const { t } = this.props;
        var current = document.querySelector('#current').value;
        var newp = document.querySelector('#new').value;
        var repeat = document.querySelector('#repeat').value;

        // TODO, change the password
        if (newp != repeat) {
            alert(t("profile::Password doesn't match, try again"));
            return;
        }

        alert(t("profile::Done!"));
    }

    render() {
        const { t } = this.props;
        if (!this.state.player) {
            return <Loading />;
        }

        return (
            <div id="profile" className="container mbottom">
                <h3>{t('profile::About you')}</h3>
                <textarea className="form-control" placeholder={t('profile::about you')} onChange={ this.aboutChange } value={ this.state.player.about }/>

                {/* interest */}
                <h3>{t('profile::Interests')}</h3>

                <div className="input-group">
                    <input type="text" id="interest" className="form-control" placeholder={t('profile::interests')}/>
                    <span className="input-group-btn">
                        <button className="btn btn-success" type="button" onClick={ this.addInterest }>
                            <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                   </span>
                </div>

                {/* interest tags */}
                <div id="interests">
                { this.state.player.interests.map((obj, i) => (
                    <span key={ obj } className="label label-danger">
                        { obj }
                        <i className="fa fa-times" onClick={ this.removeInterest.bind(this, i) }></i>
                    </span>
                ))}
                <div className="clearfix"></div>
                </div>

                {/* password change */}
                <hr/>
                <a className="btn btn-primary btn-block" role="button" data-toggle="collapse" href="#passwordChange"
                   aria-expanded="false" aria-controls="passwordChange">
                    <i className="fa fa-lock"></i> {t('profile::Change password')}
                </a>
                <div className="collapse" id="passwordChange">
                    <div className="well">
                        <input type="password" id="current" className="form-control" placeholder={t('profile::current')}/>
                        <input type="password" id="new" className="form-control" placeholder={t('profile::new')}/>
                        <input type="password" id="repeat" className="form-control" placeholder={t('profile::repeat')}/>
                    </div>
                    <button className="btn btn-danger btn-block" onClick={ this.changePassword }>{t('profile::Change')}</button>
                </div>

                <hr/>

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.save }>{t('profile::Save')}</button>
            </div>
        );
    }
}

export default Profile = translate(['profile'], { wait: true })(Profile);
