import React from 'react';
import QRCode from 'qrcode.react';
import { hashHistory } from 'react-router';

import API from './api';

import { user } from './auth';
import { connected } from './connect';

import { translate } from 'react-i18next';

class QRView extends React.Component {
    qrcodeTimer = null;

    componentDidMount() {
        var self = this;
        clearTimeout(this.qrcodeTimer);
        this.qrcodeTimer = setTimeout(function() {
            self.qrcodePolling.bind(self)(self.props.params.user, self.props.params.ev);
        }, 500);
    }

    componentWillUnmount() {
        clearTimeout(this.qrcodeTimer);
    }

    qrcodePolling = (id, ev) => {
        const { t } = this.props;
        var self = this;

        API.qrclue(id, ev)
            .then(function(resp) {
                if (resp.status == 'waiting') {
                    clearTimeout(self.qrcodeTimer);
                    self.qrcodeTimer = setTimeout(function() {
                        self.qrcodePolling.bind(self)(id, ev);
                    }, 1000);
                } else if (resp.status == 'contected') {
                    connected(resp.clue);
                }
            })
            .catch(function(err) {
                alert(t("qr::error polling!"));
            });
    }

    goBack = () => {
        hashHistory.push('/map');
    }

    render() {
        var qrsize = $(document).width() - 80;

        return (
            <div id="qrcode">
                <QRCode value={ this.props.params.secret } size={ qrsize } />
                <div className="closebtn" onClick={ this.goBack }><i className="fa fa-close"></i></div>
            </div>
        );
    }
}

export default QRView = translate(['qr'], { wait: true })(QRView);
