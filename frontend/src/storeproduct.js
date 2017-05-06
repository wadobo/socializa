import React from 'react';
import Purifier from 'html-purify';
import { withRouter } from 'react-router';

import API from './api';
import moment from 'moment';

import { translate } from 'react-i18next';


class StoreProduct extends React.Component {
    //state = { joined: false, solved: false }

    //componentWillMount() {
    //  this.setState({ joined: this.props.ev.joined, solved: this.props.ev.solved });
    //}

    buy = (product) => {
        STORE.order(product.id);
        STORE.refresh();
    }

    render() {
        return (
            <div className={ 'event joined product' } onClick={ this.buy.bind(this, this.props.product) }>
                <div className="price pull-right">
                    <i className="fa fa-money"></i> { STORE.get_price(this.props.product.product_id) }
                </div>
                <h2>{ STORE.get_desc(this.props.product.product_id) }</h2>
            </div>
        )
    }
}
export default StoreProduct = translate(['store'], { wait: true })(withRouter(StoreProduct));

