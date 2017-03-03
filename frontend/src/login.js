import React from 'react';
import { hashHistory, Link } from 'react-router'
import $ from 'jquery';

import API from './api';
import { login } from './auth';

import { translate, Interpolate } from 'react-i18next';
import i18n from './i18n';


class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var self = this;
        API.oauth2apps()
            .then(function(resp) {
                self.setState({
                    gapp: resp.google,
                    fapp: resp.facebook,
                    tapp: resp.twitter
                });
            });
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

    googleAuth = (e) => {
        var redirect = encodeURIComponent('https://socializa.wadobo.com/oauth2callback/');
        var gapp = this.state.gapp;

        var guri = 'https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=token&client_id='+gapp;
        guri += '&redirect_uri='+redirect;
        guri += '&state='+location.href;

        var win = window.open(guri, '_blank', 'location=yes');

        function loadCallBack(ev) {
            var qs = ev.url || ev.target.location.href;
            qs = qs.split('+').join(' ');

            var params = {},
                tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }
            if (params.token) {
                this.authWithToken(params.token, params.email);
            }
            win.close();
        }

        win.addEventListener('load', loadCallBack.bind(this), false);
        win.addEventListener('loadstart', loadCallBack.bind(this));
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
                        <input className="form-control" type="email" id="email" name="email" placeholder={t('login:email')} value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder={t('login:password')} value={ this.state.password } onChange={ this.passChange }/>
                </form>

                <Link to="/register">{t('login:New account')}</Link>

                <hr/>

                <div className="social row text-center">
                    <div className="col-xs-4">
                        <a href="#" className="btn btn-primary btn-circle">
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

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.login }>{t('login:Login')}</button>
            </div>
        );
    }
}

export default translate(['login'], { wait: true })(Login);
