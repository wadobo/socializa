(function() {
    var STORE = this.STORE = {};
    STORE.get_product = function(ev) {
        alert("NOT IMPLEMENT: you should buy in mobile app.");
        return 0;
    }

    STORE.order = function(id_product) {
        return 0;
    }

    STORE.get_price = function(id_product) {
        return '';
    }

    STORE.get_desc = function(id_product) {
        var product = this.get_product(id_product);
        return '';
    }

}).call(this);
