import React from 'react';
import { hashHistory, Link } from 'react-router'
import $ from 'jquery';

import API from './api';
import { login } from './auth';


export default class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var q = this.getQueryParams();
        var self = this;
        if (q.token) {
            login(q.email, q.token, 'token');
            hashHistory.push('/map');
            document.location.search = '';
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

    emailChange = (e) => {
        this.setState({email: e.target.value});
    }

    passChange = (e) => {
        this.setState({password: e.target.value});
    }

    state = {
        email: '', password: '',
        gapp: '', tapp: '', fapp: ''
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

    render() {
        let redirect = encodeURIComponent('https://socializa.wadobo.com/oauth2callback/');
        let gapp = this.state.gapp;

        let guri = 'https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=token&client_id='+gapp;
        guri += '&redirect_uri='+redirect;
        guri += '&state='+location.href;

        return (
            <div id="login" className="container">
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo"/><br/>
                    <h1>Socializa</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" name="email" placeholder="email" value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder="password" value={ this.state.password } onChange={ this.passChange }/>
                </form>

                <Link to="/register">New account</Link>

                <hr/>

                <div className="social row text-center">
                    <div className="col-xs-4">
                        <a href="#" className="btn btn-default">
                            <i className="fa fa-facebook" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="col-xs-4">
                        <a href="#" className="btn btn-default">
                            <i className="fa fa-twitter" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="col-xs-4">
                        <a href={ guri } className="btn btn-default">
                            <i className="fa fa-google-plus" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>

                <hr/>

                <button className="btn btn-block btn-success" onClick={ this.login }>Login</button>
            </div>
        );
    }
}
