// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router'

import App from './app';
import Login from './login';
import Map from './map';

import { requireAuth } from './auth';


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/" component={App} onEnter={requireAuth}>
        <Route path="map" component={Map}/>
    </Route>
  </Router>
), document.getElementById('content'))
