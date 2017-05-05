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
    }

    render() {
        return (
            <div className={ 'store product' } onClick={ this.buy.bind(this, product) }>
                <div className="price pull-right">
                    <i className="fa fa-money"></i> { STORE.get_price(product.product_id) }
                </div>
                <h2>{ STORE.get_desc(product.product_id) }</h2>
            </div>
        )
    }
}
export default StoreProduct = translate(['store'], { wait: true })(withRouter(StoreProduct));

