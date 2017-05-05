(function() {
    var STORE = this.STORE = {};

    STORE.get_product = function(id_product) {
        return store.get(id_product);
    }

    STORE.order = function(id_product) {
        store.order(id_product);
        return 0;
    }

    STORE.get_price = function(id_product) {
        var product = this.get_product(id_product);
        return String(product.price) + product.currency;
    }

    STORE.get_desc = function(id_product) {
        var product = this.get_product(id_product);
        return product.title + ": " + product.description;
    }

}).call(this);
