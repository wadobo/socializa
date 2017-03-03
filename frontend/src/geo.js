export default class GEO {
    static watchID = null;
    static options = { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
    static status = 'stopped';

    static successCB = null;
    static errorCB = null;

    static start(success, error) {
        if (success) this.successCB = success;
        if (error) this.errorCB = error;

        this.watchID = navigator.geolocation.watchPosition(this.successCB, this.errorCB, this.options);
        this.status = 'started';
    }

    static stop(pause) {
        if (this.watchID) {
            navigator.geolocation.clearWatch(this.watchID);
            this.watchID = null;
        }

        if (!pause) {
            this.status = 'stopped';
        } else {
            this.status = 'paused';
        }
    }
};

document.addEventListener("pause", function() {
    GEO.stop.bind(GEO)(true);
}, false);

document.addEventListener("resume", function() {
    if (GEO.status == 'paused') {
        GEO.start.bind(GEO)();
    }
}, false);
