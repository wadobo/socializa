import React, { Component } from 'react';
import TinyMCE from 'react-tinymce';

import { GameSolModal } from './common';
import { tinyMCEConfig } from './common';


export class GameChallenge extends Component {
    render() {
        const { game, challenge, idx, actions } = this.props;

        var id = 'challenge_' + idx;

        var depends = '';
        if (challenge.depends) {
            challenge.depends.map((ch) => {
                if (depends) {
                    depends += ' | ';
                }
                depends += ch.name;
            });
        }

        return (
            <div className="panel panel-default">
              <div className="panel-heading" onClick={actions.expandChallenge.bind(this, idx)}>
                <h4 className="panel-title">
                  {challenge.pk} - {challenge.name}
                  { depends && <span className="text-muted"> ({ depends }) </span> }
                  <button onClick={actions.removeChallenge.bind(this, idx)} className="btn btn-link">remove</button>
                </h4>
              </div>
              <div className="collapse" id={id}>
                <div className="panel-body">
                  <ChallengeForm game={game} challenge={challenge} idx={idx} actions={actions} />
                </div>
              </div>
            </div>
        );
    }
}


class ChallengeForm extends Component {
    changeField = (field, e) => {
        var idx = this.props.idx;
        this.props.actions.setChallengeProp(idx, field, e.target.value);
    }

    tinyChange = (field, e) => {
        var content = e.target.getContent();
        var idx = this.props.idx;
        this.props.actions.setChallengeProp(idx, field, content);
    }

    addDep = (ch, e) => {
        e.preventDefault();
        e.stopPropagation();
        var idx = this.props.idx;
        var deps = this.props.challenge.depends || [];
        deps.push(ch);
        this.props.actions.setChallengeProp(idx, "depends", deps);
    }

    rmDep = (i, e) => {
        e.preventDefault();
        e.stopPropagation();
        var idx = this.props.idx;
        var deps = this.props.challenge.depends || [];
        deps.splice(i, 1);
        this.props.actions.setChallengeProp(idx, "depends", deps);
    }

    render() {
        const { game, challenge, idx, actions } = this.props;

        var id = `challenge-${challenge.pk}`
        var modalid = `${id}-sol-modal`;
        var modaltarget = `#${modalid}`;

        var depends = '';
        if (challenge.depends) {
            challenge.depends.map((ch) => {
                if (depends) {
                    depends += ' | ';
                }
                depends += ch.name;
            });
        }

        return (
            <div className="challenge-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="form-control" placeholder="Challenge Name"
                           onChange={this.changeField.bind(this, 'name')} value={challenge.name} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <TinyMCE content={challenge.desc}
                        config={tinyMCEConfig}
                        placeholder="Challenge Description"
                        onChange={this.tinyChange.bind(this, 'desc')}
                    />
                </div>
                <div className="form-group">
                    <button className="btn btn-success" data-toggle="modal" data-target={modaltarget}>Define solution</button>
                    &nbsp;
                    { challenge.solution && <span className="text-success"> { challenge.solution } </span> }
                </div>

                <GameSolModal field={challenge}
                    save={actions.setChallengeProp.bind(this, idx, "options")}
                    setsol={actions.setChallengeProp.bind(this, idx, "solution")}
                    id={modalid} />


                <div className="input-group">
                    <div className="input-group-btn">
                        <button type="button" className="btn btn-default">Dependencies</button>
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="caret"></span>
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            { game.challenges.map((c, i) =>
                                <li key={i}>
                                    <a href="#" onClick={this.addDep.bind(this, c)}>{c.pk} - {c.name}</a>
                                </li>
                            )}
                        </ul>
                    </div>

                    { challenge.depends &&
                        <div className="depends">
                        { challenge.depends.map((ch, i) =>
                            <span key={i} className="label label-default" onClick={this.rmDep.bind(this, i)}> {ch.name} &times; </span>
                        ) }
                        </div>
                    }

                </div>

            </div>
        );
    }
}
