import React from 'react';
import { hashHistory } from 'react-router'
import $ from 'jquery';

import { register } from './auth';


export default class Register extends React.Component {
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
        login(this.state.email, this.state.password);
        hashHistory.push('/map');
    }

    render() {
        return (
            <div id="register" className="container">
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo" height="50px"/><br/>
                    <h1>Register</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" name="email" placeholder="email" value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" name="password" placeholder="password" value={ this.state.password } onChange={ this.passChange }/>
                        <input className="form-control" type="password" id="password2" name="password2" placeholder="repeat the password" value={ this.state.password2 } onChange={ this.passChange2 }/>
                </form>

                <hr/>

                <button className="btn btn-fixed-bottom btn-success" onClick={ this.register }>Register</button>
            </div>
        );
    }
}
