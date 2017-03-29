import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { user, logout } from './auth';
import API from './api';
import Loading from './loading';
import moment from 'moment';
import EventRow from './eventrow';

import { translate } from 'react-i18next';


class Events extends React.Component {
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
        var title = this.props.t('events::Events');
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
        this.state.q = q;
        this.updateEvents();
    }

    renderEvents() {
        var self = this;
        const { t } = this.props;
        return (
            <div>
            { this.state.events.map(function(ev, i) {
                return <EventRow ev={ev} key={i} active={self.state.active} />
            }) }

            { this.state.events.length ? <span></span> : <div className="jumbotron">{t("events::There's no events :(")}</div> }

            { this.state.loadingMore ?
                <button className="btn btn-block btn-primary btn-disabled"> <i className="fa fa-cog fa-spin fa-fw"></i> </button>
              :
                <button className="btn btn-block btn-primary" onClick={ this.loadMore }>{t('events::Load More')}</button>
            }
            </div>
        )
    }

    render() {
        const { t } = this.props;
        return (
            <div id="events" className="container-fluid container-fw">
                <div className="search input-group">
                    <input className="form-control search" id="search" placeholder={t('events::search')} onChange={ this.searchChange }/>

                    <div className="input-group-btn">
                        <button type="button" onClick={ this.updateEvents } className="btn btn-success">
                          <i className="fa fa-sw fa-search"></i>
                        </button>
                    </div>
                </div>
                <div className="filters">
                    <div className="btn-group btn-group-justified" data-toggle="buttons">
                      <label className="btn btn-default active" onClick={ this.filterEvents.bind(this, 'all') }>
                        <input type="radio" name="options" autocomplete="off" checked/> {t('events::All')}
                      </label>
                      <label className="btn btn-default" onClick={ this.filterEvents.bind(this, 'mine') }>
                        <input type="radio" name="options" autocomplete="off"/> {t('events::Mine')}
                      </label>
                      <label className="btn btn-default" onClick={ this.filterEvents.bind(this, 'admin') }>
                        <input type="radio" name="options" autocomplete="off"/> {t('events::Admin')}
                      </label>
                    </div>
                </div>

                { this.state.events ? this.renderEvents() : <Loading /> }
            </div>
        );
    }
}
export default Events = translate(['events'], { wait: true })(Events);
