// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router'

import App from './app';
import Login from './login';
import Register from './register';
import Map from './map';
import Profile from './profile';

import { requireAuth } from './auth';


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/register" component={Register}/>
    <Route path="/" component={App} onEnter={requireAuth}>
        <Route path="map" component={Map}/>
        <Route path="profile" component={Profile}/>
    </Route>
  </Router>
), document.getElementById('content'))
