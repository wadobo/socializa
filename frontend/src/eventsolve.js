import React from 'react';
import Purifier from 'html-purify';

import API from './api';
import Loading from './loading';

import Bucket from './bucket';
import { translate } from 'react-i18next';


class TextSolveB extends React.Component {
    state = {
        solution: '',
    }

    solutionChange = (e) => {
        this.setState({solution: e.target.value});
    }

    finish = (e) => {
        this.props.finish(this.state.solution);
        this.setState({solution: ''});
    }

    render() {
        const { t } = this.props;

        var q = '';
        if (this.props.opt && this.props.opt.question) {
            q = this.props.opt.question;
        }

        return (
            <div className="event-solve">
                <h3>{q}</h3>
                <div className="input-group">
                  <input type="text" onChange={this.solutionChange}  value={ this.state.solution } className="solve-input form-control" placeholder={t('events::The solution!')}/>
                  <span className="input-group-btn">
                    <button onClick={ this.finish } className="btn btn-primary" type="button">{t('events::Go!')}</button>
                  </span>
                </div>
            </div>
        );
    }
}
export let TextSolve = translate(['events', 'common'], { wait: true })(TextSolveB);


export class OptSolve extends React.Component {
    state = { answers: [] }

    finish = (txt) => {
        this.props.finish(txt);
    }

    render() {
        var self = this;

        // randomizing options
        var answers = this.props.opt.answers;
        answers = answers.sort(function(x, y) {
            return (Math.random() - Math.random())
        });

        return (
            <div className="event-solve">
                <h3>{this.props.opt.question}</h3>
                <div>
                  {answers.map(function(a, i) {
                      return (
                        <button key={a} className="btn btn-default btn-block" onClick={self.finish.bind(self, a)}>
                            {a}
                        </button>
                      );
                   })}
                </div>
            </div>
        );
    }
}


export class EventSolveOpt extends React.Component {
    render() {
        return (
            <div>
                { this.props.opt ?
                    <span>
                        { this.props.opt.type == 'text' && <TextSolve finish={this.props.finish} opt={this.props.opt} /> }
                        { this.props.opt.type == 'option' && <OptSolve finish={this.props.finish} opt={this.props.opt} /> }
                    </span>
                 :
                    <TextSolve finish={this.props.finish} opt={this.props.opt} />
                }
            </div>
        );
    }
}


export class ResolvableComponent extends React.Component {
    state = {
        solution: '',
        step: 0,
    }

    concatSolution = (txt) => {
        var s = this.state.solution;
        if (s) {
            s += ' | ' + txt;
        } else {
            s = txt;
        }
        return s;
    }

    setSolutionAndNext = (txt) => {
        var s = this.concatSolution(txt);
        this.setState({solution: s, step: this.state.step + 1});
    }

    setSolutionAndSend = (txt) => {
        var s = this.concatSolution(txt);
        this.setState({solution: '', step: 0});
        this.solve(s);
    }

    renderState = () => {
        var options = [];
        var fn = this.setSolutionAndSend;
        var opt = null;
        var field = this.getField();
        if (field) {
            options = field.solution;
            if (options && options.length > this.state.step) {
                opt = options[this.state.step];
            }

            if (options && options.length > this.state.step + 1) {
                fn = this.setSolutionAndNext;
            }
        }

        return <EventSolveOpt opt={opt} finish={fn} />;
    }
}


class EventSolve extends ResolvableComponent {
    state = {
        state: 'solving',
        solution: null,
        ev: null,
        step: 0,
    }

    componentDidMount() {
        var ev = this.props.ev;

        this.setState({
            'ev': ev,
            'state': this.props.state,
        });
    }

    goBack = () => {
        this.props.finish();
    }

    solve = (solution) => {
        const { t } = this.props;
        var self = this;

        this.setState({ state: 'solving-loading' });
        API.solve(this.state.ev.pk, solution)
            .then(function(resp) {
                if (resp.status == 'correct') {
                    self.setState({ state: 'solved', solution: solution });
                    alert(t('events::Conglatulations!'));
                    self.goBack();
                } else {
                    self.setState({ state: 'solving' });
                    alert(t('events::Wrong answer. Try again'));
                }
            }).catch(function(err) {
                self.setState({ state: 'solving' });
                alert(t('common::Unknown error'));
            });
    }

    getField = () => {
        return this.state.ev;
    }

    render() {
        const { t } = this.props;
        var self = this;

        function createMarkup() {
            var purifier = new Purifier();
            var input = self.state.ev.game.desc;
            var result = purifier.purify(input);
            return {__html: result };
        }

        return (
            <div className="event-solving">
            { this.state.ev ?
                <div>
                    <h2>{this.state.ev.game.name}</h2>
                    <div dangerouslySetInnerHTML={ createMarkup() } />

                    { this.state.state == 'solving-loading' ?
                        <Loading />
                     :
                        this.renderState()
                    }

                    <div className="closebtn" onClick={ this.goBack }><i className="fa fa-close"></i></div>
                </div>
             : <Loading /> }
            </div>
        );
    }
}

export default EventSolve = translate(['events', 'common'], { wait: true })(EventSolve);
