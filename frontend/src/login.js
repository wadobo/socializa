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
                    self.setState({
                        gapp: resp.google,
                        fapp: resp.facebook,
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
        gapp: null, fapp: null
    }

    login = (e) => {
        var email = this.state.email;
        var password = this.state.password;
        var self = this;

        return API.login(email, password)
            .then(function(resp) {
                login(email, resp.token, 'token');
                self.props.history.push('/map');
            }).catch(function(error) {
                alert(error);
            });
    }

    socialAuth(backend) {
        var self = this;
        var redirect = encodeURIComponent('https://socializa.wadobo.com/oauth2callback');

        var app = '';
        var uri = '';
        switch (backend) {
            case 'google':
                uri = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=email&client_id=';
                app = this.state.gapp;
                break;
            case 'facebook':
                app = this.state.fapp;
                uri = 'https://www.facebook.com/v2.8/dialog/oauth?response_type=token&scope=email&client_id=';
                break;
        }

        uri += app;
        uri += '&redirect_uri='+redirect;
        uri += '&state='+btoa(JSON.stringify({app: backend, url: location.href}));

        if (window.HOST != '') {
            this.win = window.open(uri, '_blank', 'location=no');
        } else {
            location.href = uri;
        }

        function loadCallBack(ev) {
            var qs = ev.url;
            qs = qs.split('+').join(' ');
            if (!qs.includes('oauth2redirect')) {
                return;
            }

            var params = {},
                tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }
            if (params.token) {
                self.authWithToken(params.token, params.email);
            }
            self.win.close();
        }

        if (this.win) {
            this.win.addEventListener('loadstart', loadCallBack);
        }
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
                        { this.state.fapp ? (
                            <a onClick={ this.socialAuth.bind(this, 'facebook') } className="btn btn-primary btn-circle">
                                <i className="fa fa-facebook" aria-hidden="true"></i>
                            </a> )
                        : (<span></span>) }
                    </div>
                    <div className="col-xs-6">
                        { this.state.gapp ? (
                            <a onClick={ this.socialAuth.bind(this, 'google') } className="btn btn-danger btn-circle">
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
