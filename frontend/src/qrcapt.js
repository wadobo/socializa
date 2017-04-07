import React from 'react';
import { withRouter } from 'react-router';

import API from './api';
import { user } from './auth';
import { connected } from './connect';

import { translate } from 'react-i18next';

class QRCapt extends React.Component {
    componentDidMount() {
        var self = this;
        var id = this.props.match.params.user;
        var ev = this.props.match.params.ev;

        window.scanQR(function(resp) {
            self.capturedQR.bind(self)(id, ev, resp);
        }, function(err) { });

        $("#overlay .close").click(function() {
            self.props.history.push('/map');
        });
    }

    capturedQR = (id, ev, resp) => {
        const { t } = this.props;
        var self = this;
        API.captured(id, ev, resp.text)
            .then(function(resp) {
                connected(resp.clue);
            })
            .catch(function(error) {
                alert(t("qr::Invalid code!"));
            });
    }

    render() {
        return (
            <div id="qrcapt" className="container">
            </div>
        );
    }
}
export default QRCapt = translate(['qr'], { wait: true })(withRouter(QRCapt));
