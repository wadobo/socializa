// main.js
var React = require('react');
var ReactDOM = require('react-dom');

var $ = require('jquery');
require('jquery.cookie');

var Login = require('./login.js');

var App = React.createClass({
    defuser: {
        user: {
            username: '',
            apikey: '',
            isAuthenticated: false
        }
    },

    getInitialState: function() {
        var u = $.cookie('socializa-user');
        if (u) {
            u = JSON.parse(u);
            return { user: u };
        }

        // cloning the object
        return $.extend({}, this.defuser);
    },

    updateUser: function(newuser) {
        this.setState({user: newuser});
    },

    logout: function() {
        $.cookie('socializa-user', '');
        this.setState({user: $.extend({}, this.defuser)});
        return false;
    },

    render: function() {
        return (
            <div id="socializa-app">
            {(() => {
                if (!this.state.user.isAuthenticated) {
                    return <Login updateUser={ this.updateUser } user={ this.state.user } />;
                } else {
                    return (
                        <div>
                          <h1>Hello { this.state.user.username }</h1>
                          <a href="#" onClick={ this.logout }>Logout</a>
                        </div>
                    );
                }
            })()}
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('content')
);
