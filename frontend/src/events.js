import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { storeUser, user, logout } from './auth';
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

        if (this.props.active && this.props.active.pk == this.props.ev.pk) {
            this.props.unplay();
        }
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

    joinButton = (ev) => {
        if (this.props.hiddenbuttons) {
            return (<span></span>)
        }

        if (this.state.joined) {
            return (
                <button onClick={ this.leave } className="btn btn-danger btn-circle">
                    <i className="fa fa-sign-in"></i>
                </button>
            )
        }

        return (
            <button onClick={ this.join } className="btn btn-success btn-circle">
                <i className="fa fa-sign-out"></i>
            </button>
        )
    }

    playButton = (ev) => {
        if (!this.state.joined || this.props.hiddenbuttons) {
            return (<span></span>);
        }

        if (this.props.active && this.props.active.pk == ev.pk) {
            return (
                <button onClick={ this.props.unplay } className="btn btn-primary btn-circle pull-right">
                    <i className="fa fa-gamepad"></i>
                </button>
            )
        }

        return (
            <button onClick={ this.props.play } className="btn btn-default btn-circle pull-right">
                <i className="fa fa-gamepad"></i>
            </button>
        )
    }

    shortDesc() {
        if (!this.props.expand && !this.state.expand) {
            return (<p className="text-muted small">{ this.props.ev.game.name }</p>)
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
            </div>
        );
    }

    render() {
        return (
            <div className="event" onClick={ this.expand.bind(this) }>
                <div className="row">
                    <div className="col-xs-1">
                        { this.joinButton(this.props.ev) }
                    </div>
                    <div className="col-xs-10">
                        <div className="eventname">
                            <h2>{ this.props.ev.name }</h2>
                            { this.shortDesc() }
                        </div>
                    </div>
                    <div className="col-xs-1">
                        { this.playButton(this.props.ev) }
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        { this.renderDesc() }
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="start label label-default">{ moment(this.props.ev.start_date).format('lll') }</div>
                        <div className="end label label-danger">{ moment(this.props.ev.end_date).format('lll') }</div>
                        { this.price(this.props.ev) }
                        { this.maxp(this.props.ev) }
                    </div>
                </div>


            </div>
        )
    }
}


export default class Events extends React.Component {
    state = {
        user: user,
        events: null,
        active: user.activeEvent,
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

    play = (e, ev) => {
        e.preventDefault();
        e.stopPropagation();

        var self = this;
        API.setPlayingEvent(ev)
            .then(function() {
                user.activeEvent = ev;
                storeUser();
                self.setState({ active: user.activeEvent });
                self.retitle();
            }).catch(function() {
                alert("Error joining the game");
            });
    }

    unplay = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var self = this;
        API.setPlayingEvent('')
            .then(function() {
                user.activeEvent = null;
                storeUser();
                self.setState({ active: user.activeEvent });
                self.retitle();
            }).catch(function() {
                alert("Error leaving the game");
            });
    }

    searchChange = (e) => {
        var q = this.state.q || {};
        q.q = e.target.value;
        this.setState({q: q});
    }

    renderEvents() {
        var self = this;
        return (
            <div>
            { this.state.events.map(function(ev, i) {
                function play(e) { self.play(e, ev); }
                return <EventRow ev={ev} key={i}
                                 active={self.state.active}
                                 play={play.bind(self)}
                                 unplay={self.unplay.bind(self)} />;
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

                { this.state.events ? this.renderEvents() : <Loading /> }
            </div>
        );
    }
}
