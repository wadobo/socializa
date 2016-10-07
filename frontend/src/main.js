// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

import App from './app';
import Login from './login';
import Map from './map';

import { requireAuth } from './auth';


// Declarative route configuration (could also load this config lazily
// instead, all you really need is a single root route, you don't need to
// colocate the entire config).
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/" component={App} onEnter={requireAuth}>
        <Route path="map" component={Map}/>
    </Route>
  </Router>
), document.getElementById('content'))
