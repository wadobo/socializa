function scanQR(success, error) {
    cordova.plugins.barcodeScanner.scan(success, error);
    //        function(result) {
    //            document.getElementById("qrtext").innerHTML = result.text;
    //            alert(JSON.stringify(result.text));
    //            localStorage.setItem("LocalData", JSON.stringify(result.text));
    //        }, function(error) {
    //            document.getElementById("qrcreating").innerHTML = error;
    //            alert("ERROR", error);
    //        }
    //);
}

function createQR() {
    alert(localStorage.getItem("LocalData"));
    cordova.plugins.barcodeScanner.encode(
            cordova.plugins.barcodeScanner.Encode.TEXT_TYPE,
            "01EMPQVERI0NEPE",
            function(success) {
                document.getElementById("creating").innerHTML = "success";
            }, function(fail) {
                document.getElementById("creating").innerHTML = "fail";
            }
    );
}
