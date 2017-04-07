import React from 'react';
import { withRouter } from 'react-router';
import $ from 'jquery';

import API from './api';
import { login } from './auth';

import { translate } from 'react-i18next';


class Register extends React.Component {
    state = {
        email: '', password: '', password2: ''
    }

    emailChange = (e) => {
        this.setState({email: e.target.value});
    }

    passChange = (e) => {
        this.setState({password: e.target.value});
    }

    passChange2 = (e) => {
        this.setState({password2: e.target.value});
    }

    register = (e) => {
        const { t } = this.props;
        var self = this;

        var email = this.state.email;
        var pwd = this.state.password;
        var pwd2 = this.state.password2;
        if (pwd != pwd2) {
            alert(t("login::Passwords didn't match"));
            return;
        }
        API.register(email, pwd)
            .then(function(resp) {
                if (resp.status == 'nok') {
                    alert(t('login::Invalid or used email'));
                } else {
                    alert(t('login::Check your email and confirm your account'));
                    self.props.history.push('/login');
                }
            }).catch(function(e) {
                alert(e);
            });
    }

    goBack = () => {
        this.props.history.push('/login');
    }

    render() {
        const { t } = this.props;

        return (
            <div id="register" className="container mbottom">
                <div className="goback" onClick={ this.goBack }><i className="fa fa-chevron-left"></i></div>
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo" height="50px"/><br/>
                    <h1>{t('login::Register')}</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" name="email" placeholder={t('login::email')} value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder={t('login::password')} value={ this.state.password } onChange={ this.passChange }/>
                        <input className="form-control" type="password" id="password2" name="password2" placeholder={t('login::repeat the password')} value={ this.state.password2 } onChange={ this.passChange2 }/>
                </form>

                <hr/>

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.register }>{t('login::Register')}</button>
            </div>
        );
    }
}

export default Register = translate(['login'], { wait: true })(withRouter(Register));
