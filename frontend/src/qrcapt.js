import React from 'react';
import { hashHistory } from 'react-router';

import API from './api';
import { user } from './auth';

export default class QRCapt extends React.Component {
    componentDidMount() {
        var self = this;
        var id = this.props.params.user;
        var ev = this.props.params.ev;

        window.scanQR(function(resp) {
            self.capturedQR.bind(self)(id, ev, resp);
        }, function(err) { });

        $("#overlay .close").click(function() {
            hashHistory.push('/map');
        });
    }

    // TODO redirect to clue
    connected = (resp) => {
        if (user.activeEvent) {
            hashHistory.push('/event/' + user.activeEvent.pk);
        } else {
            alert("Connected!");
        }
    }

    capturedQR = (id, ev, resp) => {
        var self = this;
        API.captured(id, ev, resp.text)
            .then(function(resp) {
                self.connected(resp.clue);
            })
            .catch(function(error) {
                alert("Invalid code!");
            });
    }

    render() {
        return (
            <div id="qrcapt" className="container">
            </div>
        );
    }
}
