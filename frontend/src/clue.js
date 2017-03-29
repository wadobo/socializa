import React from 'react';
import { hashHistory } from 'react-router';
import Purifier from 'html-purify';

import { user, getIcon } from './auth';
import Bucket from './bucket';
import Loading from './loading';

import { translate } from 'react-i18next';

class Clue extends React.Component {
    state = {
        clue: null
    }

    componentDidMount() {
        this.setState({ clue: Bucket.clue });
    }

    goBack = () => {
        hashHistory.push('/map');
    }

    viewEvent = () => {
        hashHistory.push('/event/' + user.activeEvent.pk);
    }

    render() {
        const { t } = this.props;
        var self = this;
        function createMarkup() {
            var purifier = new Purifier();
            var input = self.state.clue.desc;
            var result = purifier.purify(input);
            return {__html: result };
        }

        return (
            <div id="clue" className="container mbottom">
            { this.state.clue ?
                <div>
                <div className="clue">
                    <h1>{ this.state.clue.name }</h1>
                    <div dangerouslySetInnerHTML={ createMarkup() } />
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
export default Clue = translate(['clue'], { wait: true })(Clue);
