(function() {
    var FACEBOOK = this.FACEBOOK = {};
    FACEBOOK.loggedin = false;

    FACEBOOK.login = function(appid, success, error) {
        FB.init({
          appId      : appid,
          xfbml      : true,
          version    : 'v2.8'
        });
        FB.AppEvents.logPageView();

        // Using facebook auth SDK
        window.FB.login(function(response) {
            if (response.status === 'connected') {
                // we've the token, we can auth with this
                var tk = response.authResponse.accessToken;

                // getting the email
                FACEBOOK.getData(function(response) {
                    FACEBOOK.loggedin = true;
                    success(tk, response.email);
                });
            } else {
                error();
            }
        }, {scope: 'public_profile,email'});
    }

    FACEBOOK.logout = function(success, error) {
        if (FACEBOOK.loggedin) {
            FACEBOOK.loggedin = false;
            FB.logout(success);
        } else {
            if (success) success();
        }
    }

    FACEBOOK.getData = function(success, error) {
        FB.api('/me?fields=email', success);
    }
}).call(this);
