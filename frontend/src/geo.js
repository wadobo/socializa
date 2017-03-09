export default class GEO {
    static watchID = null;
    static options = { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
    static status = 'stopped';

    static successCB = null;
    static errorCB = null;

    static start() {
        if (this.watchID == null) {
            this.watchID = navigator.geolocation.watchPosition(this.success.bind(this), this.error.bind(this), this.options);
        }

        navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error.bind(this), this.options);

        this.status = 'started';
    }

    static success(p) {
        if (this.successCB) this.successCB(p);
    }

    static error(e) {
        if (this.errorCB) this.errorCB(e);
    }

    static stop(pause) {
        if (this.watchID != null) {
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
