import React from 'react';
import Purifier from 'html-purify';

import { translate } from 'react-i18next';

class ClueRow extends React.Component {
    render() {
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
            </div>
        )
    }
}
export default ClueRow = translate(['clue'], { wait: true })(ClueRow);
