export default class GEO {
    static watchID = null;
    static cwatchID = null;
    static options = { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
    static status = 'stopped';

    static successCB = null;
    static errorCB = null;
    static compassCB = null;

    static start() {
        if (this.watchID == null) {
            this.watchID = navigator.geolocation.watchPosition(this.success.bind(this), this.error.bind(this), this.options);
        }

        navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error.bind(this), this.options);

        if (navigator.compass && this.cwatchID == null) {
            this.cwatchID = navigator.compass.watchHeading(this.compassSuccess.bind(this), this.error.bind(this), {frequency: 500});
        }

        this.status = 'started';
    }

    static compassSuccess(heading) {
        if(this.compassCB) {
            this.compassCB(heading.magneticHeading);
        }
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

        if (this.cwatchID != null) {
            navigator.compass.clearWatch(this.cwatchID);
            this.cwatchID = null;
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
