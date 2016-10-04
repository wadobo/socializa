import React from 'react';
import { browserHistory } from 'react-router'
import { Link } from 'react-router'

import { user, logout } from './auth';


export default class App extends React.Component {
    state = { user: user }

    logout = (e) => {
        logout();
        browserHistory.push('/login');
    }

    render() {
        return (
            <div id="socializa-app">
                <div>
                  <h1>Hello { this.state.user.username }</h1>
                  <button className="btn btn-default" onClick={ this.logout }>Logout</button>
                </div>
            </div>
        );
    }
}
