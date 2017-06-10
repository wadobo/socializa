import React from 'react';
import API from './api';
import { translate, Interpolate } from 'react-i18next';

import { login } from './auth';


class EmailLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            password2: "",
            new_account: false
        }
    }

    emailChange = (e) => {
        this.setState({email: e.target.value});
    }

    passChange = (e) => {
        this.setState({password: e.target.value});
    }

    pass2Change = (e) => {
        this.setState({password2: e.target.value});
    }

    newAccountChange = (e) => {
        this.setState({ new_account: !this.state.new_account });
    }

    submitForm = (e) => {
        var email = this.state.email;
        var pwd = this.state.password;
        const { t } = this.props;
        var self = this;

        if (this.state.new_account) {  // New account
            e.preventDefault();
            e.stopPropagation();

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
                        self.setState({ new_account: !self.state.new_account });
                    }
                }).catch(function(e) {
                    alert("Error: " + e);
                });
        } else {  // Login
            return API.login(self.props.social.local.id, email, pwd)
                .then(function(resp) {
                    login(email, resp.access_token, 'token');
                    self.props.history.push('/map');
                }).catch(function(error) {
                    alert(t("login::Invalid credentials, try again"));
                });
        }
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                <hr/>
                <form className="form">
                    <input className="form-control" type="email" id="email" name="email"
                            placeholder={t('login::email')}
                            value={ this.state.email }
                            onChange={ this.emailChange }/>
                    <input className="form-control" type="password" id="password" name="password"
                            placeholder={t('login::password')}
                            value={ this.state.password }
                            onChange={ this.passChange }/>
                    { this.state.new_account ? (
                        <input className="form-control" type="password" id="password" name="password"
                                placeholder={t('login::password')}
                                value={ this.state.password2 }
                                onChange={ this.pass2Change }/>
                        ) : (
                        <span></span>
                        )
                    }
                    <br/>
                    <a onClick={ this.newAccountChange } className="pull-left">
                        { this.state.new_account ? t('login::Login') : t('login::New account') }
                    </a>
                    <a onClick={ this.submitForm.bind(this) } className="pull-right btn btn-primary">
                        { this.state.new_account ? t('login::New account') : t('login::Login') }
                    </a>
                </form>
            </div>
        );
    }
}

export default translate(['email-login'], { wait: true })(EmailLogin);
