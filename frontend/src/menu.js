import React from 'react';
import { withRouter } from 'react-router';
import { translate } from 'react-i18next';

import Logo from './logo';


class Menu extends React.Component {

    btnConfig() {
        this.props.history.push('/profile');
    }

    btnPlay() {
        this.props.history.push('/map');
    }

    render() {
        const { t } = this.props;

        return (
            <div>
                <Logo />
                <nav className="navbar navbar-default navbar-fixed-bottom" role="navigation">
                    <div className="col-xs-4 text-center">
                        <a onClick={ this.btnConfig.bind(this) }>
                            <span className="text-warning fa-stack fa-2x">
                                <i className="fa fa-circle fa-stack-2x"></i>
                                <i className="fa fa-cogs fa-stack-1x fa-inverse" aria-hidden="true"></i>
                            </span>
                        </a>
                        <br/>
                        { t('menu::config') }
                    </div>
                    <div className="col-xs-4 text-center">
                        <a onClick={ this.btnPlay.bind(this) }>
                            <i className="text-success fa fa-play-circle-o fa-4x" aria-hidden="true"></i>
                        </a>
                        <br/>
                        { t('menu::play') }
                    </div>
                    <div className="col-xs-4 text-center">
                        <a href="/editor/" target="_blank">
                            <i className="text-primary fa fa-plus-circle fa-4x" aria-hidden="true"></i>
                        </a>
                        <br/>
                        { t('menu::new') }
                    </div>
                </nav>
            </div>
        );
    }
}

export default Menu = translate(['menu'], { wait: true })(withRouter(Menu));
