import React from 'react';
import Purifier from 'html-purify';
import { withRouter } from 'react-router';

import { translate } from 'react-i18next';

import Bucket from './bucket';

class ClueRow extends React.Component {
    goToSolve = (e) => {
        Bucket.clues = [this.props.clue];
        this.props.history.push('/clue');
    }

    render() {
        const { t } = this.props;
        var self = this;
        function createMarkup() {
            var purifier = new Purifier();
            var input = self.props.clue.challenge.desc;
            var result = purifier.purify(input);
            return {__html: result };
        }
        return (
            <div className="clue">
                <strong>{ this.props.clue.challenge.name }</strong>:<br/>
                <div dangerouslySetInnerHTML={ createMarkup() } />

                <br/>
                { this.props.clue.status == 'solved' ?
                    <p className="text-success">{ this.props.clue.solution }</p>
                 :
                    <div>
                    { this.props.clue.solution ?
                        <button className="btn btn-primary btn-block" onClick={ this.goToSolve }>{t('clue::solve')}</button>
                     :
                     <span></span> }
                    </div>
                }
            </div>
        )
    }
}
export default ClueRow = translate(['clue'], { wait: true })(withRouter(ClueRow));
