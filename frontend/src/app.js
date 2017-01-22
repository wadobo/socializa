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

    componentDidUpdate() {
        this.bindMenuButton();
    }

    bindMenuButton = () => {
        $("#menu-button").click(function() {
            var open = $("#main-menu").hasClass("open");
            if (open) {
                $("#main-menu").removeClass("open");
            } else {
                $("#main-menu").addClass("open");
            }
        });
    }

    render() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                setAppState: this.setAppState
            })
        );
        if (!childrenWithProps) {
            hashHistory.push('/map');
        }

        $('.nav a').on('click', function(){
            // hidding the navbar
            $('.navbar-toggle').click();
        });

        return (
            <div id="socializa-app">
                <nav id="main-menu" className="navbar navbar-default navbar-fixed-top">
                  <div className="container-fluid">
                    <div className="navbar-header">
                      <button id="menu-button" type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#collapse" aria-expanded="false">
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

                    <div className="width collapse navbar-collapse" id="collapse">
                      <ul className="nav navbar-nav" id="menu">
                          <li><Link to="/map"> <i className="fa fa-fw fa-map-marker"></i> map</Link></li>
                          <li><Link to="/events"> <i className="fa fa-fw fa-gamepad"></i> events</Link></li>
                          <li><Link to="/profile"> <i className="fa fa-fw fa-user"></i> profile</Link></li>
                      </ul>
                      <ul className="nav navbar-nav navbar-right">
                        <li><a href="#" onClick={ this.logout }> <i className="fa fa-fw fa-close"></i> Logout</a></li>
                      </ul>
                    </div>
                  </div>
                </nav>


                <div>{childrenWithProps}</div>

                <div id="overlay"></div>
            </div>
        );
    }
}
