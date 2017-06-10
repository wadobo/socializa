import React from 'react';
import { withRouter } from 'react-router';
import { translate, Interpolate } from 'react-i18next';
import $ from 'jquery';

import API from './api';
import EmailLogin from './email-login';
import { login, logout } from './auth';
import Logo from './logo';


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

        logout();
    }

    state = {
        email_login: false,
        social: {}
    }

    activeEmail() {
        this.setState({ email_login: !this.state.email_login });
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

        function success(tk, email, converted) {
            if (converted) {
                login(email, tk, 'token');
                self.props.history.push('/map');
            } else {
                API.convert_token(self.state.social.google.id, 'google-oauth2', tk)
                    .then(function(resp) {
                        login(email, resp.access_token, 'token');
                        self.props.history.push('/map');
                    }).catch(function(error) {
                        alert(error);
                    });
            }
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
                <Logo />

                { this.state.email_login ? (
                        <EmailLogin social={ this.state.social } history={ this.props.history } />
                    ) : (<span></span>)
                }

                <hr/>

                <div className="social row text-center">
                    <div className="col-xs-4">
                        { this.state.social.facebook ? (
                            <a onClick={ this.facebookAuth.bind(this) } className="btn btn-primary btn-circle">
                                <i className="fa fa-facebook" aria-hidden="true"></i>
                            </a> )
                        : (<span></span>) }
                    </div>
                    <div className="col-xs-4">
                        <a onClick={ this.activeEmail.bind(this) } className="btn btn-default btn-circle">
                            <i className="fa fa-envelope-o" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="col-xs-4">
                        { this.state.social.google ? (
                            <a onClick={ this.googleAuth.bind(this) } className="btn btn-danger btn-circle">
                                <i className="fa fa-google-plus" aria-hidden="true"></i>
                            </a> )
                         : (<span></span>) }

                    </div>
                </div>
                <center><span>{t('login::Login using Facebook or Google')}</span></center>

                <nav className="navbar navbar-default navbar-fixed-bottom" role="navigation">
                    <a className="pull-right" href="https://wadobo.com" target="_blank">powered by Wadobo</a>
                </nav>
            </div>
        );
    }
}

export default translate(['login'], { wait: true })(withRouter(Login));
