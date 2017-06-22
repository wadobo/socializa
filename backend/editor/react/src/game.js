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
                        placeholder="Game Description"
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
        init: false,
        idx: 1,
    }

    componentDidMount() {
        $.ajaxSetup({
             headers: { 'X-CSRFToken': $('meta[name="csrf-token"]').attr('content') }
        });

        if (gameid) {
            $.get(`/editor/api/game/${gameid}/`)
                .then((r) => this.setState(Object.assign({}, {init: true}, r)))
                .catch((e) => alert(e));
        }
        this.initDepGraph();
    }

    componentDidUpdate() {
        this.initDepGraph();
    }

    addChallenge = (e) => {
        var chs = this.state.challenges;
        var idx = this.state.idx;
        chs.push({
            pk: -idx,
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

    drawEdge = (ch1, ch2, classes="") => {
        var e = {
            data: {
                id: `${ch1.pk}.${ch2.pk}`,
                target: ch1.pk,
                source: ch2.pk,
            },
            grabbable: false,
            classes: classes,
        };
        this.opts.elements.push(e);
    }

    drawNode = (ch, i) => {
        var n = {
            data: {
                id: ch.pk,
                text: i+1,
                'ch': ch,
                idx: i,
            },
            grabbable: false,
        };
        this.opts.elements.push(n);
    }

    initDepGraph = () => {
        var game = this.state;

        this.opts = {
          container: document.getElementById('cy'),
          elements: [],

          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#666',
                'content': 'data(text)',
                'text-valign': 'center',
                'text-halign': 'center',
                'border-color': 'black',
                'border-width': '2',
                'color': 'white',
              }
            },
            {
              selector: 'node:selected',
              style: {
                'background-color': '#f66',
              }
            },
            {
              selector: 'node.s2:selected',
              style: {
                'background-color': '#66f',
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
            },
            {
              selector: '.childs',
              style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'width': 4,
                'line-color': 'blue',
                'target-arrow-color': 'blue'
              }
            }
          ],

          layout: {
            name: 'breadthfirst',
            directed: true,
          },

           userZoomingEnabled: false,
           userPanningEnabled: false,

        };

        // drawing nodes
        game.challenges.map(this.drawNode);

        // drawing edges
        game.challenges.map((ch) => {
            // drawing deps
            var deps = ch.depends || [];
            deps.map((d) => this.drawEdge(ch, d) );

            // drawing child challenges
            var childs = ch.child_challenges || [];
            childs.map((d) => this.drawEdge(d, ch, 'childs') );
        });

        var cy = cytoscape(this.opts);

        var self = this;
        cy.on('tap', 'node', function(evt) {
          var node = evt.target;
          var prev = cy.$('node:selected');
          var ch = node.data().ch;

          $(".ch").removeClass("selected");
          $(".ch").removeClass("selected2");
          $("#ch_"+ch.pk).addClass("selected");
          if (prev.length) {
            var prevch = prev.data().ch;

            if (prev.hasClass("s2")) {
                // adding the node as child
                var idx = prev.data().idx;
                var childs = prevch.child_challenges || [];
                childs.push(ch);
                self.setChallengeProp(idx, "child_challenges", childs);
            } else {
                // new dependency between prev and selected node
                var idx = node.data().idx;
                var deps = ch.depends || [];
                deps.push(prevch);
                self.setChallengeProp(idx, "depends", deps);
            }
            prev.removeClass("s2");
          }

          node.select();
        });

        cy.on('cxttap', 'node', function(evt) {
          var node = evt.target;
          var ch = node.data().ch;
          var prev = cy.$('node:selected');
          prev.removeClass("s2");

          $(".ch").removeClass("selected2");
          $(".ch").removeClass("selected");
          $("#ch_"+ch.pk).addClass("selected2");

          node.select();
          node.addClass('s2');
        });

        cy.on('tap', 'edge', function(evt) {
          var e = evt.target;
          var ch = e.target().data().ch;
          var idx = e.target().data().idx;
          var dep = e.source().data().ch;

          // removing dependency
          var deps = ch.depends || [];
          deps.splice(deps.indexOf(dep), 1);
          self.setChallengeProp(idx, "depends", deps);

          // removing child
          idx = e.source().data().idx;
          var childs = dep.child_challenges || [];
          childs.splice(childs.indexOf(ch), 1);
          self.setChallengeProp(idx, "child_challenges", childs);
        });
    }

    saveGame = (e) => {
        console.log(this.state);
        var url = '/editor/api/game/';
        if (gameid) {
            url = `${url}${gameid}/`;
        }

        var data = this.state;
        $.ajax({
          type: "POST",
          url: url,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: (r) => alert("Saved!"),
          dataType: "json"
        });
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

        if (gameid && !this.state.init) {
            return <h2 className="text-center">Loading...</h2>
        }

        return (
            <div id="game-editor">
                <h1>Game Editor</h1>

                <GameEditorForm actions={actions} game={game} />

                <h2> Challenges </h2>

                <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

                  <div className="row">
                      <div className="col-md-5">
                          {game.challenges.map((c, i) =>
                              <GameChallenge key={c.pk} idx={i} challenge={c} actions={actions} game={game} />
                          )}
                      </div>
                      <div className="col-md-7">
                          <button onClick={this.addChallenge} className="btn btn-primary btn-block">
                              <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                              Add new challenge
                          </button>

                          <div id="cy">
                          </div>

                          <div className="text-muted">
                              <p>
                                Each node is a clue.<br/>
                                You can remove edges by clicking on it.<br/>
                                Red edges are dependencies, to get a clue the player should have all clues that points to it.<br/>
                                Blue edges are child clues, if a clue has a solution, when the player solve this clue, he'll get all the child clues.
                              </p>
                              <h4>Dependencies:</h4>
                               <ol>
                                   <li>Click on a node to select it</li>
                                   <li>Click on a second node to create a dependency</li>
                               </ol>
                              <h4>Childs:</h4>
                               <ol>
                                   <li>Right click on a node to select it</li>
                                   <li>Click on a second node to create a dependency</li>
                               </ol>
                           </div>
                      </div>
                  </div>
                </div>

                <button onClick={this.saveGame} className="btn btn-primary btn-block btn-lg">Save</button>
                <hr/>
            </div>
        );
    }
}
