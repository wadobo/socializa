import React from 'react';
import { withRouter } from 'react-router';

import { setUser, user, logout } from './auth';
import Loading from './loading';
import API from './api';

import Bucket from './bucket';
import { translate } from 'react-i18next';


class Profile extends React.Component {
    state = {
        storeProducts: null,
        state: 'normal',
    }

    componentDidMount() {
        Bucket.setAppState({ title: this.props.t('store::Store'), active: 'store' });
        this.updateStore();
    }

    updateStore = () => {
        var self = this;
        this.setState({ storeProducts: null });
        API.storeProducts()
            .then(function(products) {
                self.setState({ storeProducts: products });
            });
    }

    renderStoreProducts() {
        var self = this;
        const { t } = this.props;
        return (
            <div>
            { this.state.storeProducts.map(function(product, i) {
                return <StoreProduct product={product} />
            }) }

            { this.state.storeProducts.length ? <span></span> : <div className="jumbotron">{t("store::There's no products :(")}</div> }
            </div>
        )
    }


    render() {
        const { t } = this.props;
        if (!this.state.player || this.state.state == 'loading') {
            return <Loading />;
        }

        return (
            <div id="store" className="container-fluid container-fw">
                { this.state.stores ? this.renderStoreRows() : <Loading /> }
            </div>
        );
    }
}

export default Store = translate(['store'], { wait: true })(Store);

