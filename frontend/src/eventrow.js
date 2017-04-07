import React from 'react';
import { withRouter } from 'react-router';

import API from './api';
import moment from 'moment';

import { translate } from 'react-i18next';


class EventRow extends React.Component {
    state = { joined: false, expand: false, solved: false }

    componentWillMount() {
      this.setState({ joined: this.props.ev.joined, solved: this.props.ev.solved });
    }

    expand = (e) => {
        if (this.state.expand) {
            this.setState({ expand: false });
        } else {
            this.setState({ expand: true });
        }
    }

    join = (ev) => {
        var self = this;
        API.joinEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: true});
            }).catch(function(error) {
                alert(error);
            });
    }

    leave = (ev) => {
        var self = this;
        API.leaveEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: false});
            }).catch(function(error) {
                alert(error);
            });
    }

    play = (ev) => {
        this.props.history.push('/map/' + ev.pk);
    }

    admin = (ev) => {
        this.props.history.push('/admin/' + ev.pk);
    }

    price = (ev) => {
        if (this.props.hiddenbuttons) {
            return (<span></span>)
        }

        if (parseFloat(ev.price)) {
            return (
                <div className="badge price pull-right">
                    <i className="fa fa-money"></i> { parseFloat(ev.price) }
                </div>
            )
        }
        return (
            <div className="badge price free pull-right">
                free
            </div>
        )
    }

    maxp = (ev) => {
        if (parseInt(ev.max_players)) {
            return (
                <div className="max badge pull-right">
                    <i className="fa fa-users"></i> { ev.max_players }
                </div>
            )
        }
        return ''
    }

    buttons = (ev) => {
        const { t } = this.props;
        if (this.props.hiddenbuttons) {
            return null;
        }

        return (
            <div className="btn-group btn-group-justified" role="group" aria-label="...">
                { this.state.joined ?
                    [
                    <a onClick={ this.play.bind(this, ev) } className="btn btn-success">
                        <i className="fa fa-gamepad"></i> {t('events::Play')}
                    </a>,
                    <a onClick={ this.leave.bind(this, ev) } className="btn btn-danger">
                        <i className="fa fa-sign-out"></i> {t('events::Leave')}
                    </a>
                    ]
                 :
                    <a onClick={ this.join.bind(this, ev) } className="btn btn-success">
                        <i className="fa fa-sign-in"></i> {t('events::Join')}
                    </a>
                }

                { ev.admin &&
                    <a onClick={ this.admin.bind(this, ev) } className="btn btn-primary">
                        <i className="fa fa-sign-cog"></i> {t('events::Admin')}
                    </a>
                }
            </div>
        );
    }

    shortDesc() {
        if (!this.props.expand && !this.state.expand) {
            return (<p className="small">{ this.props.ev.game.name }</p>)
        }

        return (<div></div>);
    }


    renderDesc() {
        if (!this.props.expand && !this.state.expand) {
            return (<div></div>);
        }

        return (
            <div className="eventdesc">
                <div className="jumbotron">
                    <h2>{ this.props.ev.game.name }</h2>
                    <p>{ this.props.ev.game.desc }</p>
                </div>

                <div className="dates">
                    <div className="start label label-default">{ moment(this.props.ev.start_date).format('lll') }</div>
                    <div className="end pull-right label label-danger">{ moment(this.props.ev.end_date).format('lll') }</div>
                </div>
                <div className="clearfix"></div>

                { this.buttons(this.props.ev) }
            </div>
        );
    }

    render() {
        var classes = 'event';
        if (this.state.joined) {
            classes += ' joined';
        }
        if (this.state.solved) {
            classes += ' solved';
        }

        return (
            <div className={ classes } onClick={ this.expand.bind(this) }>
                { this.price(this.props.ev) }
                { this.maxp(this.props.ev) }

                <h2>{ this.props.ev.name }</h2>
                <p className="desc"> { this.shortDesc() } </p>

                { this.renderDesc() }
            </div>
        )
    }
}
export default EventRow = translate(['events'], { wait: true })(withRouter(EventRow));
