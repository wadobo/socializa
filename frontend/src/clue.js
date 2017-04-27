import React from 'react';
import { withRouter } from 'react-router';
import Purifier from 'html-purify';

import { user, getIcon } from './auth';
import Bucket from './bucket';
import Loading from './loading';
import API from './api';
import { EventSolveOpt } from './eventsolve';
import { ResolvableComponent } from './eventsolve';

import { translate } from 'react-i18next';

class Clue extends ResolvableComponent {
    state = {
        clue: null,
        state: 'normal',
        solution: '',
        step: 0,
    }

    clueChange = (e) => {
        this.setState({solution: e.target.value});
    }

    componentDidMount() {
        var clue = Bucket.clue;

        this.setState({ clue: clue });
    }

    goBack = () => {
        this.props.history.push('/map');
    }

    viewEvent = () => {
        this.props.history.push('/event/' + user.activeEvent.pk);
    }

    solve = (solution) => {
        const { t } = this.props;
        var self = this;
        this.setState({ state: 'solving' });
        API.solve_clue(this.state.clue.pk, solution)
            .then(function(resp) {
                if (resp.status == 'correct') {
                    var c = self.state.clue;
                    alert(t('events::Conglatulations!'));
                    if (resp.clue) {
                        c = resp.clue;
                    } else {
                        c.status = 'solved';
                        c.solution = solution;
                    }
                    self.setState({ clue: c, state: 'normal' });
                } else {
                    self.setState({ state: 'normal' });
                    alert(t('events::Wrong answer. Try again'));
                }
            }).catch(function(err) {
                self.setState({ state: 'normal' });
                alert(t('common::Unknown error'));
            });
    }

    getField = () => {
        return this.state.clue;
    }

    render() {
        const { t } = this.props;
        var self = this;
        function createMarkup() {
            var purifier = new Purifier();
            var input = self.state.clue.challenge.desc;
            var result = purifier.purify(input);
            return {__html: result };
        }

        return (
            <div id="clue" className="container mbottom">
            { this.state.clue ?
                <div>
                <div className="clue">
                    <h1>{ this.state.clue.challenge.name }</h1>
                    <div dangerouslySetInnerHTML={ createMarkup() } />

                    { this.state.clue.status == 'solved' ?
                        <p className="text-success">{ this.state.clue.solution }</p>
                     :
                        <div>
                        { this.state.clue.solution ?
                         this.renderState()
                         :
                         <span></span> }
                        { this.state.state == 'solving' ? <Loading /> : <span></span> }
                        </div>
                    }
                </div>

                <button className="btn btn-primary btn-fixed-bottom-left" onClick={ this.goBack }>{t('clue::Map')}</button>
                <button className="btn btn-success btn-fixed-bottom-right" onClick={ this.viewEvent }>{t('clue::Event')}</button>
                </div>
              :
                <Loading />
            }
            </div>
        );
    }
}
export default Clue = translate(['event', 'clue'], { wait: true })(withRouter(Clue));
