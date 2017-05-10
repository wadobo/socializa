// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import App from './app';
import Login from './login';
import Register from './register';
import i18n from './i18n';


//override defaults
alertify.defaults.theme.ok = "btn btn-success";
alertify.defaults.theme.cancel = "btn btn-danger";
alertify.defaults.theme.input = "form-control";
alertify.defaults.movable = false;
alertify.defaults.closable = false;
alertify.defaults.glossary.title = 'Socializa';

window.alert = alertify.alert;
window.confirm = alertify.confirm;

ReactDOM.render((
  <I18nextProvider i18n={ i18n }>
  <Router>
    <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/register" component={Register}/>
        <App />
    </Switch>
  </Router>
  </I18nextProvider>
), document.getElementById('content'))
