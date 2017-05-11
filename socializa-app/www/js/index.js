/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('deviceready', this.initStore, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        cordova.plugins.certificates.trustUnsecureCerts(true);

        // backbutton for exit
        var lastTimeBackPress=0;
        var timePeriodToExit=2000;

        document.addEventListener("backbutton", function(e) {
            if (location.hash == '#/login' || location.hash == '#/map') {
                e.preventDefault();
                e.stopPropagation();
                if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
                    navigator.app.exitApp();
                } else {
                    window.plugins.toast.showWithOptions({
                        message: "Press again to exit.",
                        duration: "short", // which is 2000 ms.
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    });

                    lastTimeBackPress = new Date().getTime();
                }
            } else {
                navigator.app.backHistory()
            }
        }, false);
    },
    initStore: function() {
        if (!store) {
            alert('===============STORE NOT AVAILABLE');
            return;
        }

        store.verbosity = store.DEBUG;
        store.register({
            id: "coin_100",
            type: store.NON_CONSUMABLE
        });
        store.register({
            id: "coin_200",
            type: store.NON_CONSUMABLE
        });
        store.register({
            id: "coin_500",
            type: store.NON_CONSUMABLE
        });
        store.register({
            id: "coin_1000",
            type: store.NON_CONSUMABLE
        });
        store.register({
            id: "coin_2000",
            type: store.NON_CONSUMABLE
        });
        store.register({
            id: "coin_5000",
            type: store.NON_CONSUMABLE
        });
        store.refresh();

        store.validator = "http://devsocializa.com/api/store/check-purchase/";

        store.ready( function() {
            log("STORE READY");
        });

        store.error(function(error) {
            alert("ERROR STORE " + error.code + ": " + error.message);
        });

        store.when("product").updated(function(p) {
            //alert("update");
            //navigator.notification.confirm(message, confirmCallback, [title], [buttonLabels]);
            //store.order(p.id);
        });

        store.when("product").downloading(function(p) {
            alert("downloading");
        });

        store.when("product").downloaded(function(p) {
            alert("downloaded");
            p.finish();
        });

        store.when("product").approved(function(p) {
            alert("approved");
            p.verify();
        });

        store.when("product").verified(function(p) {
            alert("finish");
            p.finish();
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var elem = document.getElementById("spam");

        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
