import React from 'react';
import { withRouter } from 'react-router';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Menu from './menu';
import Map from './map';
import Profile from './profile';
import Events from './events';
import Event from './event';
import Connect from './connect';
import QRView from './qrview';
import QRCapt from './qrcapt';
import Clue from './clue';
import Store from './store';
import Admin from './admin';

import Bucket from './bucket';
import { isAuthenticated } from './auth';

import $ from 'jquery';
window.$ = window.jQuery = $;


class App extends React.Component {
    state = { title: 'Socializa', active: null }

    componentWillMount() {
        if (!isAuthenticated()) {
            if (this.props.history.location.pathname != '/login') {
                this.props.history.push('/login');
            }
        } else if (!this.props.children) {
            this.props.history.push('/menu');
        }
        Bucket.setAppState = this.setAppState;
    }

    setAppState = (newst) => {
        this.setState(newst);
    }

    render() {
        return (
            <Router>
                <div id="socializa-app">
                    <div>{this.props.children}</div>
                    <div id="overlay"></div>

                    <Switch>
                        <Route exact path="/menu" component={Menu} />
                        <Route exact path="/map" component={Map} />
                        <Route exact path="/map/:ev" component={Map} />
                        <Route exact path="/profile" component={Profile} />
                        <Route exact path="/events" component={Events} />
                        <Route exact path="/event/:pk" component={Event} />
                        <Route exact path="/admin/:pk" component={Admin} />
                        <Route exact path="/connect/:pk" component={Connect} />
                        <Route exact path="/qrcode/:user/:ev/:secret" component={QRView} />
                        <Route exact path="/qrcapt/:user/:ev" component={QRCapt} />
                        <Route exact path="/clue" component={Clue} />
                        <Route exact path="/store" component={Store} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default withRouter(App);
