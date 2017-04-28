import React from 'react';
import { withRouter } from 'react-router';

import { setUser, user, logout } from './auth';
import Loading from './loading';
import API from './api';

import Bucket from './bucket';
import { translate } from 'react-i18next';


class Profile extends React.Component {
    state = {
        user: user,
        player: null,
        pwd1: '',
        pwd2: '',
        pwd3: '',
        state: 'normal',
    }

    componentDidMount() {
        Bucket.setAppState({ title: this.props.t('profile::Profile'), active: 'profile' });
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
        var self = this;
        API.setProfile(p)
            .then(function() {
                self.props.history.push('/map');
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

    changeField = (field, e) => {
        var newst = {};
        newst[field] = e.target.value;
        this.setState(newst);
    }

    changePassword = (e) => {
        const { t } = this.props;
        var self = this;

        e.preventDefault();
        e.stopPropagation();

        if (this.state.pwd2 != this.state.pwd3) {
            alert(t("profile::Passwords didn't match"));
            return false;
        }

        this.setState({state: 'loading'});
        API.changePassword(this.state.pwd1, this.state.pwd2)
            .then(function(resp) {
                alert(t("profile::Password changed correctly"));
                self.props.history.push('/login');
            }).catch(function(error) {
                alert(t("profile::Error changing the password, try again"));
                self.setState({state: 'normal'});
            });
    }

    render() {
        const { t } = this.props;
        if (!this.state.player || this.state.state == 'loading') {
            return <Loading />;
        }

        return (
            <div id="profile" className="container mbottom">
                <h2>{user.username}</h2>
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
                        <input className="form-control" type="password" id="current" name="pwd1" value={ this.state.pwd1 } onChange={ this.changeField.bind(this, 'pwd1') } placeholder={t('profile::current')}/>
                        <input className="form-control" type="password" id="new" name="pwd2" value={ this.state.pwd2 } onChange={ this.changeField.bind(this, 'pwd2') } placeholder={t('profile::new')}/>
                        <input className="form-control" type="password" id="repeat" name="pwd3" value={ this.state.pwd3 } onChange={ this.changeField.bind(this, 'pwd3') } placeholder={t('profile::repeat')}/>

                    </div>
                    <button className="btn btn-danger btn-block" onClick={ this.changePassword }>{t('profile::Change')}</button>
                </div>

                <hr/>

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.save }>{t('profile::Save')}</button>
            </div>
        );
    }
}

export default Profile = translate(['profile'], { wait: true })(withRouter(Profile));
