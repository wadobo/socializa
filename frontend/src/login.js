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

        FB.init({
          appId      : self.state.social.facebook.oauth,
          xfbml      : true,
          version    : 'v2.8'
        });
        FB.AppEvents.logPageView();

        // Using facebook auth SDK
        window.FB.login(function(response) {
            if (response.status === 'connected') {
                // we've the token, we can auth with this
                var tk = response.authResponse.accessToken;

                // getting the email
                FB.api('/me?fields=email', function(response) {
                    // converting the token to our AccessToken. This will
                    // create the user if it doesn't exists
                    API.convert_token(self.state.social.facebook.id, 'facebook', tk)
                        .then(function(resp) {
                            login(response.email, resp.access_token, 'token');
                            self.props.history.push('/map');
                        }).catch(function(error) {
                            alert(error);
                        });
                });
            } else {
                alert(t("login::Unauthorized"));
            }
        }, {scope: 'public_profile,email'});
    }

    googleAuth() {
        const { t } = this.props;
        var self = this;

        function start() {
          gapi.client.init({
            'apiKey': self.state.social.google.apikey,
            'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
            // clientId and scope are optional if auth is not required.
            'clientId': self.state.social.google.oauth,
            'scope': 'profile email',
          }).then(function() {
            var auth = gapi.auth2.getAuthInstance();
            auth.signIn()
                .then(function(response) {
                    var tk = response.getAuthResponse().access_token;
                    var email = response.getBasicProfile().getEmail();

                    API.convert_token(self.state.social.google.id, 'google-oauth2', tk)
                        .then(function(resp) {
                            login(email, resp.access_token, 'token');
                            self.props.history.push('/map');
                        }).catch(function(error) {
                            alert(error);
                        });
                });
          });
        };
        // 1. Load the JavaScript client library.
        gapi.load('client', start);

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
