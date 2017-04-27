import React from 'react';
import { withRouter } from 'react-router';
import Purifier from 'html-purify';

import { user, getIcon } from './auth';
import Bucket from './bucket';
import Loading from './loading';
import API from './api';

import { translate } from 'react-i18next';

class Clue extends React.Component {
    state = {
        clue: null,
        state: 'normal',
        solution: '',
    }

    clueChange = (e) => {
        this.setState({solution: e.target.value});
    }

    componentDidMount() {
        this.setState({ clue: Bucket.clue });
    }

    goBack = () => {
        this.props.history.push('/map');
    }

    viewEvent = () => {
        this.props.history.push('/event/' + user.activeEvent.pk);
    }

    solveClue = () => {
        const { t } = this.props;
        var self = this;
        this.setState({ state: 'solving' });
        API.solve_clue(this.state.clue.pk, this.state.solution)
            .then(function(resp) {
                if (resp.status == 'correct') {
                    var c = self.state.clue;
                    alert(t('events::Conglatulations!'));
                    if (resp.clue) {
                        c = resp.clue;
                    } else {
                        c.status = 'solved';
                        c.solution = self.state.solution;
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
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder={t('clue::solution')} onChange={ this.clueChange }/>

                                <div className="input-group-btn">
                                    <button type="button" onClick={ this.solveClue } className="btn btn-success">
                                      <i className="fa fa-sw fa-check"></i>
                                    </button>
                                </div>
                            </div>
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
