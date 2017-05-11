(function() {
    function start() {
    }

    var GPLUS = this.GPLUS = {};
    GPLUS.loggedin = false;
    GPLUS.auth = null;

    GPLUS.init = function(apikey, clientid) {
        function start() {
            gapi.client.init({
              'apiKey': apikey,
              'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
              'clientId': clientid,
              'scope': 'profile email',
            }).then(function() {
              GPLUS.auth = gapi.auth2.getAuthInstance();
            });
        }
        gapi.load('client', start);
    }

    GPLUS.login = function(appid, success, error) {
        GPLUS.auth.signIn()
            .then(function(response) {
                var tk = response.getAuthResponse().access_token;
                var email = response.getBasicProfile().getEmail();
                success(tk, email);
            });
    }

    GPLUS.logout = function(success, error) {
        if (GPLUS.loggedin) {
            GPLUS.loggedin = false;
            GPLUS.auth.signOut();
            success();
        } else {
            if (success) success();
        }
    }
}).call(this);
