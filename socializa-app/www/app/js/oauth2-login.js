
function scanQR(success, error) {
    // TODO move style to css
    var modal = $("#overlay");
    var reader = '<div class="close"><i class="fa fa-close"></i></div><div id="reader"></div>';
    modal.html(reader);
    modal.addClass("open");

    $("#overlay .close").click(function() {
        $('#reader').html5_qrcode_stop();
        modal.html("");
        modal.removeClass("open");
        error({status: 'closed'});
    });

    $('#reader').html5_qrcode(
        function(data){
            $('#reader').html5_qrcode_stop();
            modal.html("");
            modal.removeClass("open");
            success({text: data});
        },
        function(error){
            //show read errors
        }, function(videoError){
            //the video stream could be opened
        }
    );
}

function facebookAuth() {
    const { t } = this.props;
    var self = this;

    var fbLoginSuccess = function (userData) {
        var token = userData.authResponse.accessToken;
        facebookConnectPlugin.api("/me?fields=email", null,
            function (data) {
                var email = data.email;
                API.convert_token(self.state.social.facebook.id, 'facebook', token)
                    .then(function(resp) {
                        login(email, resp.access_token, 'token');
                        self.props.history.push('/map');
                    }).catch(function(error) {
                        alert(error);
                    });
            },
            function (error) {
                alert(t("login::Unauthorized"));
            }
        );
    }

    var fbError = function(error) {
        alert(error);
    }

    facebookConnectPlugin.login(["public_profile"], fbLoginSuccess, fbError);

}

function googleAuth() {
    const { t } = this.props;
    var self = this;

    var config = {
        'scopes': 'profile email',
        'webClientId': '180959654042-25rgejtel6r7m6dg93mnmhv39shfs93j.apps.googleusercontent.com',
        'offline': true
    };
    window.plugins.googleplus.login(
        config,
        function(obj) {
            alert(obj);
            var token = obj.idToken;
            var email = obj.email;
            API.convert_token(self.state.social.google.id, 'google-oauth2', token)
                .then(function(resp) {
                    login(email, resp.access_token, 'token');
                    self.props.history.push('/map');
                }).catch(function(error) {
                    alert("CON" + error);
                });
        },
        function(msg) {
            alert("L"+msg);
        }
    );
}

