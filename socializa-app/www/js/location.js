var count = 0;

function checkEnableGPS() { // plugin diagnostic: go to settings
    cordova.plugins.diagnostic.isGpsLocationEnabled(
        function(enabled){
            document.getElementById("status").innerHTML = "GPS location is " + (enabled ? "enabled" : "disabled");
            if (!enabled) {
                cordova.plugins.diagnostic.switchToLocationSettings();
            }
        }, function(error){
            document.getElementById("status").innerHTML = "The following error occurred: "+error;
        });
}

function checkEnableGPS2() { // plugin request-location-accuracy: alert with yes or no for activate GPS
    cordova.plugins.locationAccuracy.canRequest(function(canRequest){
        if(canRequest){
            cordova.plugins.locationAccuracy.request(function(){
                console.log("Request successful");
            }, function (error){
                console.error("Request failed");
                if(error){
                    // Android only
                    console.error("error code="+error.code+"; error message="+error.message);
                    if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
                        if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
                            cordova.plugins.diagnostic.switchToLocationSettings();
                        }
                    }
                }
            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
            );
        }
    });
}

function onLocSuccess(pos) {
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    document.getElementById("location").innerHTML = String(count++) + ": " + String(lat) + " - " + String(lon);
}

function onLocError(error) {
    console.log("code" + error.code + ":" + error.message);
}


function getLocation() {
    checkEnableGPS2();
    navigator.geolocation.getCurrentPosition(onLocSuccess, onLocError,
            {enableHighAccuracy: true, timeout: 5*1000, maximumAge: 30000});
}

function sendPos() {
    getLocation();
}

