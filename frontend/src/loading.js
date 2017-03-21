import React from 'react';
import { translate } from 'react-i18next';

class Loading extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <div className="loadingIcon">
                <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                <span className="sr-only">{t('common::Loading...')}</span>
            </div>
        );
    }
}
export default Loading = translate(['common'], { wait: true })(Loading);
