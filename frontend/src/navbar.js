import React from 'react';
import { Link } from 'react-router'
import { user, logout } from './auth';

export default class NavBar extends React.Component {
    state = { user: user, open: false }

    logout = (e) => {
        logout();
        hashHistory.push('/login');
    }

    openmenu = (e) => {
        this.setState({ open: !this.state.open });
    }

    activeEvent = () => {
        var act = this.props.active;
        if (!user.activeEvent) {
            return (<span></span>);
        }
        var ev = user.activeEvent;
        var link = "/event/" + ev.pk;
        return (
            <li className={ act == 'event' ? "active" : "" }><Link to={ link }><i className="fa fa-fw fa-dot-circle-o"></i> { ev.name }</Link></li>
        );
    }

    render() {
        var act = this.props.active;
        return (
            <div id="main-menu">
                <div id="menu-bar">
                    <div id="menu-button" onClick={this.openmenu}>
                        <i className="fa fa-fw fa-bars"></i>
                    </div>
                    <span className="socializa-title">{this.props.title}</span>
                </div>
                <div id="menu" className={ this.state.open ? "open" : "" }>
                  <ul>
                      { this.activeEvent() }
                      <li className={ act == 'map' ? "active" : "" }><Link to="/map"> <i className="fa fa-fw fa-map-marker"></i> map</Link></li>
                      <li className={ act == 'events' ? "active" : "" }><Link to="/events"> <i className="fa fa-fw fa-gamepad"></i> events</Link></li>
                      <li className={ act == 'profile' ? "active" : "" }><Link to="/profile"> <i className="fa fa-fw fa-user"></i> profile</Link></li>
                      <li><a onClick={ this.logout }> <i className="fa fa-fw fa-close"></i> Logout</a></li>
                  </ul>
                </div>
            </div>
        );
    }
}
