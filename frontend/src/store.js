import React from 'react';
import { withRouter } from 'react-router';

import Loading from './loading';
import API from './api';
import StoreProduct from './storeproduct';

import Bucket from './bucket';
import { translate } from 'react-i18next';


class Store extends React.Component {
    state = {
        products: null,
    }

    componentDidMount() {
        Bucket.setAppState({ title: this.props.t('store::Store'), active: 'store' });
        this.updateStore();
    }

    updateStore = () => {
        var self = this;
        this.setState({ products: null });
        API.getStoreProducts()
            .then(function(products) {
                self.setState({ products: products });
            });
    }

    renderStoreProducts() {
        var self = this;
        const { t } = this.props;
        return (
            <div>
            { this.state.products.map(function(product, i) {
                return <StoreProduct key={i} product={product} />
            }) }

            { this.state.products.length ? <span></span> : <div className="jumbotron">{t("store::There's no products :(")}</div> }
            </div>
        )
    }


    render() {
        const { t } = this.props;
        return (
            <div id="store" className="container-fluid container-fw">
                { this.state.products ? this.renderStoreProducts() : <Loading /> }
            </div>
        );
    }
}

export default Store = translate(['store'], { wait: true })(Store);

