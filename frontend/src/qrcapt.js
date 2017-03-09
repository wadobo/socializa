import React from 'react';
import { hashHistory } from 'react-router';

import API from './api';
import { user } from './auth';
import { connected } from './connect';

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

    capturedQR = (id, ev, resp) => {
        var self = this;
        API.captured(id, ev, resp.text)
            .then(function(resp) {
                connected(resp.clue);
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
