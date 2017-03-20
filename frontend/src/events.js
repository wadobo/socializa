import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { user, logout } from './auth';
import API from './api';
import Loading from './loading';
import moment from 'moment';


export class EventRow extends React.Component {
    state = { joined: false, expand: false }

    componentWillMount() {
      this.setState({ joined: this.props.ev.joined });
    }

    expand = (e) => {
        if (this.state.expand) {
            this.setState({ expand: false });
        } else {
            this.setState({ expand: true });
        }
    }

    join = (e) => {
        e.preventDefault();
        e.stopPropagation();

        var self = this;
        API.joinEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: true});
            }).catch(function(error) {
                alert(error);
            });
    }

    leave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        var self = this;
        API.leaveEvent(this.props.ev.pk)
            .then(function() {
                self.setState({joined: false});
            }).catch(function(error) {
                alert(error);
            });
    }

    play = (ev) => {
        var self = this;
        hashHistory.push('/map/' + ev.pk);
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
        if (this.props.hiddenbuttons) {
            return null;
        }

        return (
            <div className="btn-group btn-group-justified" role="group" aria-label="...">
                { this.state.joined ?
                    [
                    <a onClick={ this.play.bind(this, ev) } className="btn btn-success">
                        <i className="fa fa-gamepad"></i> Play
                    </a>,
                    <a onClick={ this.leave } className="btn btn-danger">
                        <i className="fa fa-sign-out"></i> Leave
                    </a>
                    ]
                 :
                    <a onClick={ this.join } className="btn btn-success">
                        <i className="fa fa-sign-in"></i> Join
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
        if (!this.props.hiddenbuttons && this.state.joined) {
            classes += ' joined';
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


export default class Events extends React.Component {
    state = {
        user: user,
        events: null,
        loadingMore: false,
        q: null,
        page: 0
    }

    componentDidMount() {
        this.updateEvents();
        this.retitle();
    }

    updateEvents = () => {
        var self = this;
        this.setState({ events: null });
        API.allEvents(this.state.q)
            .then(function(events) {
                self.setState({ events: events });
            });
    }

    loadMore = () => {
        var self = this;
        this.setState({loadingMore: true});
        this.state.page += 1;

        var q = {
            page: this.state.page
        };

        if (this.state.q) $.extend(q, this.state.q);

        API.allEvents(q)
            .then(function(events) {
                self.setState({ events: self.state.events.concat(events) });
                self.setState({loadingMore: false});
            });
    }

    retitle = () => {
        var title = 'Events';
        if (user.activeEvent) {
          title = title + ' - ' + user.activeEvent.name;
        }
        this.props.setAppState({ title: title, active: 'events' });
    }

    searchChange = (e) => {
        var q = this.state.q || {};
        q.q = e.target.value;
        this.setState({q: q});
    }

    filterEvents = (v) => {
        var q = this.state.q || {};
        q.filter = v;
        this.setState({q: q});
        this.updateEvents();
    }

    renderEvents() {
        var self = this;
        return (
            <div>
            { this.state.events.map(function(ev, i) {
                return <EventRow ev={ev} key={i} active={self.state.active} />
            }) }

            { this.state.events.length ? <span></span> : <div className="jumbotron">There's no events :(</div> }

            { this.state.loadingMore ?
                <button className="btn btn-block btn-primary btn-disabled"> <i className="fa fa-cog fa-spin fa-fw"></i> </button>
              :
                <button className="btn btn-block btn-primary" onClick={ this.loadMore }>Load More</button>
            }
            </div>
        )
    }

    render() {
        return (
            <div id="events" className="container-fluid container-fw">
                <div className="search input-group">
                    <input className="form-control search" id="search" placeholder="search" onChange={ this.searchChange }/>

                    <div className="input-group-btn">
                        <button type="button" onClick={ this.updateEvents } className="btn btn-success">
                          <i className="fa fa-sw fa-search"></i>
                        </button>
                    </div>
                </div>
                <div className="filters">
                    <div className="btn-group btn-group-justified" data-toggle="buttons">
                      <label className="btn btn-default active" onClick={ this.filterEvents.bind(this, 'all') }>
                        <input type="radio" name="options" autocomplete="off" checked/> All
                      </label>
                      <label className="btn btn-default" onClick={ this.filterEvents.bind(this, 'mine') }>
                        <input type="radio" name="options" autocomplete="off"/> Mine
                      </label>
                      <label className="btn btn-default" onClick={ this.filterEvents.bind(this, 'admin') }>
                        <input type="radio" name="options" autocomplete="off"/> Admin
                      </label>
                    </div>
                </div>

                { this.state.events ? this.renderEvents() : <Loading /> }
            </div>
        );
    }
}
