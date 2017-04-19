import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom'
import $ from 'jquery';

import API from './api';
import { login } from './auth';

import { translate, Interpolate } from 'react-i18next';


class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var self = this;

        var q = this.getQueryParams();

        if (q.token) {
            self.authWithToken(q.token, q.email);
        } else {
            API.oauth2apps()
                .then(function(resp) {
                    self.setState({ social: resp });
                });
        }
    }

    getQueryParams = () => {
        var qs = document.location.search;
        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    authWithToken(token, email) {
        login(email, token, 'token');
        this.props.history.push('/map');
        document.location.search = '';
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

        var fbLoginSuccess = function (userData) {
            var token = userData.authResponse.accessToken;
            facebookConnectPlugin.api("/me?fields=email", null,
                function (data) {
                    var email = data.email;
                    API.convert_token(self.state.social.facebook.id, 'facebook', token)
                        .then(function(resp) {
                            login(email, resp.access_token, 'token');
                            self.props.history.push('/map');
                        }).catch(function(error) {
                            alert(error);
                        });
                },
                function (error) {
                    alert(t("login::Unauthorized"));
                }
            );
        }

        var fbError = function(error) {
            alert(error);
        }

        facebookConnectPlugin.login(["public_profile"], fbLoginSuccess, fbError);

    }

    googleAuth() {
        const { t } = this.props;
        var self = this;

        var config = {'webClientId': '521528522962-569ibib9fih3lo11r3tkr55si8gmsdsg.apps.googleusercontent.com', 'offline': true};
        window.plugins.googleplus.login(
            config,
            function(obj) {
                var token = obj.idToken;
                var email = obj.email;
                API.convert_token(self.state.social.google.id, 'google-oauth2', token)
                    .then(function(resp) {
                        login(email, resp.access_token, 'token');
                        self.props.history.push('/map');
                    }).catch(function(error) {
                        alert(error);
                    });
            },
            function(msg) {
                alert("ERROR" + msg);
            }
        );
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
