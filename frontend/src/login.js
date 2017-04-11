import React from 'react';
import { hashHistory, Link } from 'react-router'
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
                    self.setState({
                        gapp: resp.google,
                        fapp: resp.facebook,
                        tapp: resp.twitter
                    });
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
        hashHistory.push('/map');
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
        gapp: null, tapp: null, fapp: null
    }

    login = (e) => {
        var email = this.state.email;
        var password = this.state.password;

        return API.login(email, password)
            .then(function(resp) {
                login(email, resp.token, 'token');
                hashHistory.push('/map');
            }).catch(function(error) {
                alert(error);
            });
    }

    facebookAuth = (e) => {
        var self = this;

        var fbLoginSuccess = function (userData) {
            var token = userData.authResponse.accessToken;
            facebookConnectPlugin.api("/me?fields=email", null,
                function (data) {
                    alert("TOKEN: " + token);
                    var email = data.email;
                    self.authWithToken(token, email);
                },
                function (error) {
                    console.log("ERROR", error);
                }
            );
        }

        var fbError = function(error) {
            alert(error);
        }

        facebookConnectPlugin.login(["public_profile"], fbLoginSuccess, fbError);
    }

    googleAuth = (e) => {
        var self = this;

        var config = {'offline': true};
        window.plugins.googleplus.login(
            config,
            function(obj) {
                alert(JSON.stringify(obj));
                token = obj.idToken;
                email = obj.email;
                self.authWithToken(token, email);
            },
            function(msg) {
                alert("ERROR" + msg);
            }
        );
    }

    render() {
        const { t } = this.props;

        return (
            <div id="login" className="container">
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo"/><br/>
                    <h1>Socializa</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" name="email" placeholder={t('login::email')} value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder={t('login::password')} value={ this.state.password } onChange={ this.passChange }/>
                </form>

                <Link to="/register">{t('login::New account')}</Link>

                <hr/>

                <div className="social row text-center">
                    <div className="col-xs-4">
                        <a onClick={ this.facebookAuth } className="btn btn-primary btn-circle">
                            <i className="fa fa-facebook" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="col-xs-4">
                        <a href="#" className="btn btn-info btn-circle">
                            <i className="fa fa-twitter" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="col-xs-4">
                        { this.state.gapp ? (
                            <a onClick={ this.googleAuth } className="btn btn-danger btn-circle">
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

export default translate(['login'], { wait: true })(Login);
