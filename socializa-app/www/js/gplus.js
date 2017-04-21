(function() {
    var GPLUS = this.GPLUS = {};
    GPLUS.loggedin = false;

    GPLUS.init = function(apikey, clientid) {
    }

    GPLUS.login = function(appid, success, error) {
        var config = {'webClientId': appid, 'offline': true};
        window.plugins.googleplus.login(
            config,
            function(obj) {
                var token = obj.idToken;
                var email = obj.email;

                $.get(HOST + '/api/gplusid/' + token + '/',
                    function(response) {
                        if (response.status == 'ok') {
                            success(response.token, email, true);
                        } else {
                            error();
                        }
            },
            function(msg) {
                console.log("ERROR", msg);
                error();
            });
    }

    GPLUS.logout = function(success, error) {
        if (GPLUS.loggedin) {
            GPLUS.loggedin = false;
            window.plugins.googleplus.logout(success);
        } else {
            if (success) success();
        }
    }
}).call(this);
