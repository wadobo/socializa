import React from 'react';
import { translate, Interpolate } from 'react-i18next';


class Logo extends React.Component {

    render() {
        const { t } = this.props;

        return (
            <div className="header text-center">
                <img src="app/images/icon.png" className="logo" alt="logo"/><br/>
                <h1>Socializa</h1>
            </div>
        );
    }
}

export default translate(['logo'], { wait: true })(Logo);
