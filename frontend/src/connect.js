import React from 'react';
import { hashHistory } from 'react-router';

import { user, getIcon } from './auth';
import API from './api';
import Purifier from 'html-purify';

import { EventRow } from './events';

import Loading from './loading';

export default class Connect extends React.Component {
    state = {
        user: user,
        other: null
    }

    componentDidMount() {
        this.getProfile();
    }

    getProfile = () => {
        var self = this;
        API.getProfile(self.props.params.pk)
            .then(function(profile) {
                if (!profile.username) {
                    alert("Too far!");
                    hashHistory.push('/map');
                }
                self.setState({ other: profile });
            });
    }

    goBack = () => {
        hashHistory.push('/map');
    }

    render() {
        var self = this;
        function createMarkup() {
            var purifier = new Purifier();
            var input = self.state.other.about;
            var result = purifier.purify(input);
            return {__html: result };
        }

        var icon = this.state.other ? getIcon(this.state.other) : '';

        return (
            <div id="connect" className="container">
            { this.state.other ?
                <div>
                    <div className="closebtn" onClick={ this.goBack }><i className="fa fa-close"></i></div>
                    <h2 className="text-center">{ this.state.other.username }</h2>

                    <div className="text-center">
                        <img src={ icon } />
                    </div>
                    <div className="text-center" dangerouslySetInnerHTML={ createMarkup() } />
                    <button className="btn btn-fixed-bottom btn-primary" onClick={ this.stop }>Interactuar</button>
                </div>
             :
                <Loading />
            }
            </div>
        );
    }
}
