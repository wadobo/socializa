import React, { Component } from 'react';
import TinyMCE from 'react-tinymce';

import { GameSolModal } from './common';
import { tinyMCEConfig } from './common';

import { GameChallenge } from './challenge';



class GameEditorForm extends Component {
    changeField = (field, e) => {
        this.props.actions.setGameProp(field, e.target.value);
    }

    tinyChange = (field, e) => {
        var content = e.target.getContent();
        this.props.actions.setGameProp(field, content);
    }

    toggleVisiblePlayers = (e) => {
        var v = this.props.game.visible_players;
        this.props.actions.setGameProp('visible_players', !v);
    }

    render() {
        const { game, actions } = this.props;

        return (
            <div className="editor-form well">
                <div className="form-group">
                    <label htmlFor="game-name">Name</label>
                    <input id="game-name" type="text" className="form-control" placeholder="Game Name"
                           onChange={this.changeField.bind(this, 'name')} value={game.name} />
                </div>
                <div className="form-group">
                    <label htmlFor="game-desc">Description</label>
                    <TinyMCE content={game.desc}
                        config={tinyMCEConfig}
                        id="game-desc" placeholder="Game Description"
                        onChange={this.tinyChange.bind(this, 'desc')}
                    />
                </div>
                <div className="form-group">
                    { game.visible_players ?
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
                    { game.solution && <span className="text-success"> { game.solution } </span> }
                </div>

                <GameSolModal field={game}
                    save={actions.setGameProp.bind(this, "options")}
                    setsol={actions.setGameProp.bind(this, "solution")}
                    id="game-sol-modal" />
            </div>
        );
    }
}


export default class GameEditor extends Component {
    state = {
        name: 'New Game',
        desc: '',
        visible_players: false,
        options: [],
        solution: '',
        challenges: [],
        idx: 1,
    }

    componentDidMount() {
        this.initDepGraph();
    }

    componentDidUpdate() {
        this.initDepGraph();
    }

    addChallenge = (e) => {
        var chs = this.state.challenges;
        var idx = this.state.idx;
        chs.push({
            id: -idx,
            name: 'New Challenge',
            desc: '',
            options: [],
            solution: '',
        });

        setTimeout(this.expandChallenge.bind(this, chs.length - 1), 500);
        this.setState({challenges: chs, idx: idx+1});
    }

    setGameProp = (k, v) => {
        var newst = this.state;
        newst[k] = v;
        this.setState(newst);
    }

    removeChallenge = (idx) => {
        var newcs = this.state.challenges;
        newcs.splice(idx, 1);
        this.setState({challenges: newcs});
    }

    updateChallenge = (idx, newc) => {
        var newcs = this.state.challenges;
        newcs[idx] = newc;
        this.setState({challenges: newcs});
    }

    setChallengeProp = (idx, k, v) => {
        var newcs = this.state.challenges;
        newcs[idx][k] = v;
        this.setState({challenges: newcs});
    }

    expandChallenge = (idx, e) => {
        window.$(".collapse").collapse("hide");
        var id = `#challenge_${idx}`;
        window.$(id).collapse("show");
    }

    initDepGraph = () => {
        var game = this.state;

        var opts = {
          container: document.getElementById('cy'),
          elements: [],

          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#666',
                'content': 'data(id)',
                'text-valign': 'center',
                'text-halign': 'center',
                'color': 'white',
              }
            },

            {
              selector: 'edge',
              style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'width': 4,
                'line-color': 'red',
                'target-arrow-color': 'red'
              }
            }
          ],

          layout: {
            name: 'breadthfirst',
            directed: true,
          }

        };

        // drawing nodes
        game.challenges.map((ch) => {
            opts.elements.push({data: {id: ch.id}});
        });

        // drawing edges
        game.challenges.map((ch) => {
            var deps = ch.depends || [];
            deps.map((d) => {
                var e = {
                    id: `${ch.id}.${d.id}`,
                    target: ch.id,
                    source: d.id,
                };
                opts.elements.push({data: e});
            });
        });
        var cy = cytoscape(opts);
    }

    render() {
        var game = this.state;
        var actions = {
            setGameProp: this.setGameProp.bind(this),
            removeChallenge: this.removeChallenge.bind(this),
            updateChallenge: this.updateChallenge.bind(this),
            setChallengeProp: this.setChallengeProp.bind(this),
            expandChallenge: this.expandChallenge.bind(this),
        };
        console.log(this.state);

        return (
            <div id="game-editor">
                <h1>Game Editor</h1>

                <GameEditorForm actions={actions} game={game} />

                <h2> Challenges </h2>

                <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

                  <div className="row">
                      <div className="col-md-7">
                          {game.challenges.map((c, i) =>
                              <GameChallenge key={c.id} idx={i} challenge={c} actions={actions} game={game} />
                          )}
                      </div>
                      <div className="col-md-5">
                          <button onClick={this.addChallenge} className="btn btn-primary btn-block">
                              <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                              Add new challenge
                          </button>

                          <div id="cy">
                          </div>
                      </div>
                  </div>
                </div>

                <hr/>
            </div>
        );
    }
}
