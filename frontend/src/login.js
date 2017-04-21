import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import $ from 'jquery';

import API from './api';
import { login } from './auth';

import { translate, Interpolate } from 'react-i18next';


class Login extends React.Component {
    componentDidMount() {
        var self = this;

        API.oauth2apps()
            .then(function(resp) {
                self.setState({ social: resp });

                if (resp.google) {
                    GPLUS.init(resp.google.apikey, resp.google.oauth);
                }
            });
    }

    emailChange = (e) => {
        this.setState({email: e.target.value});
    }

    passChange = (e) => {
        this.setState({password: e.target.value});
    }

    state = {
        email: '', password: '',
        social: {}
    }

    login = (e) => {
        var email = this.state.email;
        var password = this.state.password;
        var self = this;

        return API.login(self.state.social.local.id, email, password)
            .then(function(resp) {
                login(email, resp.access_token, 'token');
                self.props.history.push('/map');
            }).catch(function(error) {
                alert(error);
            });
    }

    facebookAuth() {
        const { t } = this.props;
        var self = this;
        var appid = self.state.social.facebook.oauth;

        function success(tk, email) {
            API.convert_token(self.state.social.facebook.id, 'facebook', tk)
                .then(function(resp) {
                    login(email, resp.access_token, 'token');
                    self.props.history.push('/map');
                }).catch(function(error) {
                    alert(error);
                });
        }

        function error(error) {
            alert(t("login::Unauthorized"));
        }

        FACEBOOK.login(appid, success, error);
    }

    googleAuth() {
        const { t } = this.props;
        var self = this;
        var appid = self.state.social.google.oauth;

        function success(tk, email) {
            API.convert_token(self.state.social.google.id, 'google-oauth2', tk)
                .then(function(resp) {
                    login(email, resp.access_token, 'token');
                    self.props.history.push('/map');
                }).catch(function(error) {
                    alert(error);
                });
        }

        function error(error) {
            alert(t("login::Unauthorized"));
        }

        GPLUS.login(appid, success, error);
    }

    render() {
        const { t } = this.props;

        return (
            <div id="login" className="container mbottom">
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo"/><br/>
                    <h1>Socializa</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" name="email" placeholder={t('login::email')} value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder={t('login::password')} value={ this.state.password } onChange={ this.passChange }/>
                </form>

                <br/>
                <Link to="/register" className="pull-right btn btn-primary">{t('login::New account')}</Link>
                <div className="clearfix"></div>

                <hr/>

                <center><h3>{t('login::Login using Facebook or Google')}</h3></center>
                <div className="social row text-center">
                    <div className="col-xs-6">
                        { this.state.social.facebook ? (
                            <a onClick={ this.facebookAuth.bind(this) } className="btn btn-primary btn-circle">
                                <i className="fa fa-facebook" aria-hidden="true"></i>
                            </a> )
                        : (<span></span>) }
                    </div>
                    <div className="col-xs-6">
                        { this.state.social.google ? (
                            <a onClick={ this.googleAuth.bind(this) } className="btn btn-danger btn-circle">
                                <i className="fa fa-google-plus" aria-hidden="true"></i>
                            </a> )
                         : (<span></span>) }

                    </div>
                </div>

                <hr/>

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.login }>{t('login::Login')}</button>
            </div>
        );
    }
}

export default translate(['login'], { wait: true })(withRouter(Login));
