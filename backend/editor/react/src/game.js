import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TinyMCE from 'react-tinymce';

import * as GameActions from './actions/index';


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
