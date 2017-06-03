import React, { Component } from 'react';


export const tinyMCEConfig = {
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table contextmenu paste code'
    ],
    toolbar: 'undo redo | link image | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | insert | code',
};


export class GameSolQuestion extends Component {
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


export class GameSolModal extends Component {
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
