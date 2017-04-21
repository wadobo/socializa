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
                console.log("TOKEN", obj);
                // TODO: convert this token to a valid token... we should
                // pass this to the backend, validate and create the user,
                // then generate a token and return it
                // https://developers.google.com/identity/sign-in/web/backend-auth
                success(token, email);
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
