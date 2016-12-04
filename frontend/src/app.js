import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { user, logout } from './auth';

import $ from 'jquery';
window.$ = window.jQuery = $;
var Bootstrap = require('bootstrap');
Bootstrap.$ = $;


export default class App extends React.Component {
    state = { user: user, title: 'Socializa' }

    logout = (e) => {
        logout();
        hashHistory.push('/login');
    }

    setAppState = (newst) => {
        this.setState(newst);
    }

    render() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                setAppState: this.setAppState
            })
        );

        return (
            <div id="socializa-app">
                <nav className="navbar navbar-default navbar-fixed-top">
                  <div className="container-fluid">
                    <div className="navbar-header">
                      <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#collapse" aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                      </button>
                      <Link className="navbar-brand" to="/">
                        <img alt="Brand" src="app/images/icon.png" height="20px"/>
                      </Link>
                      <span className="socializa-title">{this.state.title}</span>

                    </div>

                    <div className="collapse navbar-collapse" id="collapse">
                      <ul className="nav navbar-nav" id="menu">
                          <li><Link to="/map">map</Link></li>
                          <li><Link to="/events">events</Link></li>
                          <li><Link to="/profile">profile</Link></li>
                      </ul>
                      <ul className="nav navbar-nav navbar-right">
                        <li><a href="#" onClick={ this.logout }>Logout</a></li>
                      </ul>
                    </div>
                  </div>
                </nav>


                <div>{childrenWithProps}</div>
            </div>
        );
    }
}
