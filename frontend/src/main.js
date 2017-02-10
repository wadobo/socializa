// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router';
import { I18nextProvider } from 'react-i18next';

import App from './app';
import Login from './login';
import Register from './register';
import Map from './map';
import Profile from './profile';
import Events from './events';
import Event from './event';

import { requireAuth } from './auth';

import i18n from './i18n';


ReactDOM.render((
  <I18nextProvider i18n={ i18n }>
  <Router history={hashHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/register" component={Register}/>
    <Route path="/" component={App} onEnter={requireAuth}>
        <Route path="map" component={Map}/>
        <Route path="profile" component={Profile}/>
        <Route path="events" component={Events}/>
        <Route path="event/:pk" component={Event}/>
    </Route>
  </Router>
  </I18nextProvider>
), document.getElementById('content'))
