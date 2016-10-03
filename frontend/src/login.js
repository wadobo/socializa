var React = require('react');
var ReactDOM = require('react-dom');

var $ = require('jquery');
require('jquery.cookie');

module.exports = React.createClass({
    getInitialState: function() {
        return {email: '', password: ''};
    },

    emailChange: function(e) { this.setState({email: e.target.value}); },
    passChange: function(e) { this.setState({password: e.target.value}); },

    render: function() {
        var that = this;
        return (
            <div id="login" className="container">
                <div className="header text-center">
                    <img src="app/images/icon.png" className="logo" alt="logo"/><br/>
                    <h1>Socializa</h1>
                </div>

                <form className="form">
                        <input className="form-control" type="email" id="email" placeholder="email" value={ this.state.email } onChange={ this.emailChange }/>
                        <input className="form-control" type="password" id="password" placeholder="password" value={ this.state.password } onChange={ this.passChange }/>
                </form>

                <a href="#">New account</a>

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
                        <a href="#" className="btn btn-default">
                            <i className="fa fa-google-plus" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>

                <hr/>

                <button className="btn btn-block btn-success" onClick={ this.login }>Login</button>
            </div>
        );
    },

    login: function(e) {
        // TODO: make the real login
        console.log("auth: " + this.state.email + ', ' + this.state.password);
        this.props.user.isAuthenticated = true;
        this.props.user.username = this.state.email;
        this.props.user.apikey = 'FAKEAPIKEY';

        $.cookie('socializa-user', JSON.stringify(this.props.user));
        this.props.updateUser(this.props.user);
    }
});
