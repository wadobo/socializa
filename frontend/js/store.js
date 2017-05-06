(function() {
    var STORE = this.STORE = {};
    STORE.get_product = function(ev) {
        return 0;
    }

    STORE.order = function(id_product) {
        alert("NOT IMPLEMENT: you should buy in mobile app.");
        return 0;
    }

    STORE.get_price = function(id_product) {
        return 'X €';
    }

    STORE.get_desc = function(id_product) {
        return id_product + ': buy for enjoy.';
    }

}).call(this);
