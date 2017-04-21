(function() {
    var FACEBOOK = this.FACEBOOK = {};
    FACEBOOK.loggedin = false;

    FACEBOOK.login = function(appid, success, error) {
        var perms = ['public_profile', 'email'];

        function success2(response) {
            FACEBOOK.loggedin = true;

            FACEBOOK.getData(function(resp) {
                success(response.authResponse.accessToken, resp.email);
            });
        };

        facebookConnectPlugin.login(perms, success2, error);
    }

    FACEBOOK.logout = function(success, error) {
        if (FACEBOOK.loggedin) {
            FACEBOOK.loggedin = false;
            facebookConnectPlugin.logout(success, error);
        } else {
            if (success) success();
        }
    }

    FACEBOOK.getData = function(success, error) {
        facebookConnectPlugin.api( "me/?fields=email", ["public_profile", "email"], success, error);
    }
}).call(this);
