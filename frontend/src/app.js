import React from 'react';
import $ from 'jquery'
import 'jquery.cookie';

import Login from './login';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.defuser = {
            user: {
                username: '',
                apikey: '',
                isAuthenticated: false
            }
        }
        var u = $.cookie('socializa-user');
        if (u) {
            u = JSON.parse(u);
            this.state = { user: u };
        } else {
            // cloning the object
            this.state = $.extend({}, this.defuser);
        }
    }

    updateUser = (newuser) => {
        this.setState({user: newuser});
    }

    logout = () => {
        $.cookie('socializa-user', '');
        this.setState({user: $.extend({}, this.defuser)});
    }

    render() {
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
}
