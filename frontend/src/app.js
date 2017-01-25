import React from 'react';
import { hashHistory } from 'react-router';

import NavBar from './navbar';

import $ from 'jquery';
window.$ = window.jQuery = $;
var Bootstrap = require('bootstrap');
Bootstrap.$ = $;


export default class App extends React.Component {
    state = { title: 'Socializa', active: null }

    setAppState = (newst) => {
        this.setState(newst);
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
        return (
            <div id="socializa-app">
                <NavBar title={this.state.title} active={this.state.active}/>

                <div>{childrenWithProps}</div>

                <div id="overlay"></div>
            </div>
        );
    }
}
