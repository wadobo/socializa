import React from 'react';

export default class Loading extends React.Component {
    render() {
        return (
            <div className="loadingIcon">
                <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
}
