
function scanQR(success, error) {
    // TODO move style to css
    var modal = $("#overlay");
    var reader = '<div id="reader"></div>';
    modal.html(reader);
    modal.addClass("open");

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
