import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TinyMCE from 'react-tinymce';

import * as GameActions from './actions/index';


class GameSolQuestion extends Component {
    changeField = (field, e) => {
        this.props.edit(field, e.target.value);
    }

    changeField2 = (field, v) => {
        this.props.edit(field, v);
    }

    editAnswer = (i, e) => {
        var as = this.props.q.answers;
        as[i] = e.target.value;
        this.props.edit('answers', as);
    }

    rmOpt = (e) => {
        var as = this.props.q.answers || [];
        as.pop();
        this.props.edit('answers', as);
    }

    addOpt = (e) => {
        var as = this.props.q.answers || [];
        as.push("");
        this.props.edit('answers', as);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.addOpt();
        }
    }

    render() {
        const {q} = this.props;
        var radioname = "radio_" + q.id;

        return (
            <div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-7">
                            <input type="text" className="form-control"
                                placeholder="Question text"
                                onChange={this.changeField.bind(this, 'question')}
                                value={q.question} />
                        </div>
                        <div className="col-sm-3">
                            <select className="form-control"
                                    value={q.type}
                                    onChange={this.changeField.bind(this, 'type')}>
                                <option value="text">text</option>
                                <option value="option">option</option>
                            </select>
                        </div>
                        <div className="col-sm-2">
                            <button className="btn btn-default" onClick={this.props.remove}>&times;</button>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    { q.type == 'text' &&
                        <input type="text" className="form-control"
                            placeholder="Solution"
                            onChange={this.changeField.bind(this, 'solution')}
                            value={q.solution}/>
                    }
                    { q.type == 'option' &&
                        <div>
                            { q.answers && q.answers.map((a, i) =>
                                <div key={i} className="row">
                                    <div className="col-xs-1">
                                        <input type="radio" name={radioname}
                                            onChange={this.changeField2.bind(this, 'solution', a)}
                                            checked={q.solution == a}
                                            className="form-control" />
                                    </div>
                                    <div className="col-xs-11">
                                        <input type="text" className="form-control"
                                            placeholder="Answer"
                                            onKeyPress={this.handleKeyPress}
                                            onChange={this.editAnswer.bind(this, i)}
                                            value={a}/>
                                    </div>
                                </div>
                            )}
                            <div className="btn-group" role="group" aria-label="...">
                              <button type="button" className="btn btn-success" onClick={this.addOpt}>
                                <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                              </button>
                              <button type="button" className="btn btn-danger" onClick={this.rmOpt}>
                                <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
                              </button>
                            </div>
                        </div>
                    }
                </div>
                <hr />
            </div>
        );
    }
}


class GameSolModal extends Component {
    state = {
        qid: 1,
        questions: [],
    }

    componentDidMount() {
        var q = [];
        var nqid = this.state.qid;
        var s = this.props.field.solution || "";
        var opts = this.props.field.options;
        var solutions = s.split(' | ');
        if (opts) {
            // parsin options to compound solution inside questions
            opts.forEach((opt, i) => {
                var no = {
                    id: nqid++,
                    question: opt.question,
                    type: opt.type,
                    solution: solution[i]
                };
                if (opt.type == 'option') {
                    no.answers = opt.answers;
                }
                q.push(no);
            });
        } else {
            q.push({id: 0, question: "", type:"text", solution: ""});
        }
        this.setState({questions: q, qid: nqid});
    }

    newQ = (e) => {
        var q = this.state.questions;
        q.push({
            id: this.state.qid,
            question: "",
            type: "text",
            solution: "",
        });
        this.setState({questions: q, qid: this.state.qid+1});
    }

    edit = (i, field, value) => {
        var q = this.state.questions;
        q[i][field] = value;
        this.setState({questions: q});
    }

    remove = (i) => {
        var q = this.state.questions;
        q.splice(i, 1);
        this.setState({questions: q});
    }

    save = (e) => {
        window.jQuery('#'+this.props.id).modal("hide");
        var options = [];
        var solution = "";
        this.state.questions.forEach((q) => {
            var nq = {};
            if (q.type == 'text') {
                nq = {
                    id: q.id, type: 'text',
                    question: q.question,
                };
            } else {
                nq = {
                    id: q.id, type: 'option',
                    question: q.question,
                    answers: q.answers,
                };
            }
            solution += solution ? ' | ' + q.solution : q.solution;
            options.push(nq);
        });
        this.props.setsol(solution);
        this.props.save(options);
    }

    render() {
        const {field, id} = this.props;

        return (
            <div className="modal fade" id={id} tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">
                        Define Solution: "{field.name}"
                    </h4>
                  </div>
                  <div className="modal-body">
                    { this.state.questions.map((q, i) =>
                        <GameSolQuestion key={q.id} q={q}
                            edit={this.edit.bind(this, i)}
                            remove={this.remove.bind(this, i)}
                            />) }
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-success" onClick={this.newQ}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        Add question
                    </button>
                    <button type="button" className="btn btn-primary" onClick={this.save}>Ok</button>
                  </div>
                </div>
              </div>
            </div>
        );
    }
}


class GameChallenge extends Component {
    render() {
        const { challenge, actions } = this.props;

        var id = 'challenge_' + challenge.id;
        var href = '#' + id;

        return (
            <div className="panel panel-default">
              <div className="panel-heading" role="tab">
                <h4 className="panel-title">
                  <a role="button" data-toggle="collapse" data-parent="#accordion" href={href} aria-expanded="true" aria-controls={id}>
                    {challenge.id} - {challenge.name}
                  </a>
                  <button onClick={actions.removeChallenge.bind(this, challenge.id)} className="btn btn-link">remove</button>
                </h4>
              </div>
              <div id={id} className="panel-collapse collapse in" role="tabpanel">
                <div className="panel-body">
                    {challenge.name}
                </div>
              </div>
            </div>
        );
    }
}


class GameEditorForm extends Component {
    changeField = (field, e) => {
        this.props.actions.setGameProp(field, e.target.value);
    }

    tinyChange = (field, e) => {
        var content = e.target.getContent();
        this.props.actions.setGameProp(field, content);
    }

    toggleVisiblePlayers = (e) => {
        var v = this.props.game.game.visible_players;
        this.props.actions.setGameProp('visible_players', !v);
    }

    render() {
        const { game, actions } = this.props;

        return (
            <div className="editor-form well">
                <div className="form-group">
                    <label htmlFor="game-name">Name</label>
                    <input id="game-name" type="text" className="form-control" placeholder="Game Name"
                           onChange={this.changeField.bind(this, 'name')} value={game.game.name} />
                </div>
                <div className="form-group">
                    <label htmlFor="game-desc">Description</label>
                    <TinyMCE content={game.game.desc}
                        config={{
                            menubar: false,
                            plugins: [
                              'advlist autolink lists link image charmap print preview anchor',
                              'searchreplace visualblocks code fullscreen',
                              'insertdatetime media table contextmenu paste code'
                            ],
                            toolbar: 'undo redo | link image | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | insert | code',
                        }}
                        id="game-desc" placeholder="Game Description"
                        onChange={this.tinyChange.bind(this, 'description')}
                    />
                </div>
                <div className="form-group">
                    { game.game.visible_players ?
                        <div className="btn-group" role="group" aria-label="...">
                          <button type="button" className="btn btn-success">ON</button>
                          <button onClick={this.toggleVisiblePlayers} type="button" className="btn btn-default">OFF</button>
                        </div>
                     :
                        <div className="btn-group" role="group" aria-label="...">
                          <button onClick={this.toggleVisiblePlayers} type="button" className="btn btn-default">ON</button>
                          <button type="button" className="btn btn-danger">OFF</button>
                        </div>
                    }
                    &nbsp; Players view other players
                </div>
                <div className="form-group">
                    <button className="btn btn-success" data-toggle="modal" data-target="#game-sol-modal">Define solution</button>
                    &nbsp;
                    { game.game.solution && <span className="text-success"> { game.game.solution } </span> }
                </div>

                <GameSolModal field={game.game}
                    save={actions.setGameProp.bind(this, "options")}
                    setsol={actions.setGameProp.bind(this, "solution")}
                    id="game-sol-modal" />
            </div>
        );
    }
}


class GameEditor extends Component {
    addChallenge = (e) => {
        this.props.actions.addChallenge("NEW CHALLENGE");
    }

    render() {
        const { game, actions } = this.props;
        return (
            <div id="game-editor">
                <h1>Game Editor</h1>

                <GameEditorForm actions={actions} game={game} />

                <h2> Challenges </h2>

                <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

                  {game.challenges.map((c) =>
                      <GameChallenge key={c.id} challenge={c} actions={actions} />
                  )}

                </div>

                <button onClick={this.addChallenge} className="btn btn-primary btn-block">
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    Add new challenge
                </button>


            </div>
        );
    }
}

function mapStateToProps(state) {
  return { game: state }
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(GameActions, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameEditor);
