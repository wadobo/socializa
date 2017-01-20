var Promise = require('es6-promise').Promise;
import 'fetch';
import "isomorphic-fetch";

import { user } from './auth';


function fake(data) {
    var p = new Promise(
        function(resolve, reject) {
            setTimeout(function() { resolve(data); },
                       Math.random() * 1000);
        }
    );
    return p;
}


function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}


function parseJSON(response) {
    return response.json();
}


function JSONq(method, data) {
    var d = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    if (method == 'GET' || method == 'HEAD') {
        delete d.body;
    }

    if (user.apikey) {
        d.headers.Authorization = 'Token ' + user.apikey;
    }

    return d;
}


function JSONPost(data) {
    return JSONq('POST', data);
}


function JSONGet() {
    return JSONq('GET', {});
}


function URL(path) {
    return HOST + path;
}


function customFetch(path, data) {
    return fetch(URL(path), data).then(checkStatus).then(parseJSON);
}


export default class API {
    static login(email, password) {
        var data = JSONPost({
            username: email,
            password: password
        });

        return customFetch('/api/token/', data);
    }

    static setPos(lat, lon) {
        var data = JSONPost({ lat: lat, lon: lon });
        return customFetch('/api/player/set-pos/', data);
    }

    static nearPlayers(ev) {
        var data = JSONGet();
        var url = '/api/player/near/';
        if (ev) {
            url += ev + '/';
        }
        return customFetch(url, data);
    }

    // <- connected | camera | qrcode
    static connectPlayer(id, ev) {
        var data = JSONPost({});
        var url = '/api/player/meeting/'+id+'/';
        if (ev) {
            url += ev + '/';
        }
        //return customFetch(url, data);

        // TODO: Fake response
        //var option = parseInt(Math.random() * 1000, 10) % 3;
        var option = 1;
        var data = {};
        switch (option) {
            case 0:
                data = { 'status': 'connected', 'clue': '<strong>CLUE!</strong>' };
                break;
            case 1:
                data = { 'status': 'step1' };
                break;
            case 2:
                data = { 'status': 'step2', 'secret': 'socializa!'};
                break;
        }
        return fake(data);
    }

    //POST captured()
    // <- connected
    static captured(code) {
        var data = JSONPost({});
        //return customFetch('/api/player/captured/'+ code +'/', data);
        // TODO add the challenge clue here
        return fake({ 'status': 'connected', 'clue': '<strong>CLUE!</strong>' });
    }

    //GET qrclue
    static qrclue(player_id) {
        var data = JSONGet();
        //return customFetch('/api/player/qrclue/'+ player_id +'/');
        return fake({ 'status': 'waiting' });
    }

    static allEvents() {
        var data = JSONGet();
        return customFetch('/api/event/all/', data);
    }

    static joinEvent(id) {
        var data = JSONPost({});
        return customFetch('/api/event/join/'+id+'/', data);
    }

    static leaveEvent(id) {
        var data = JSONq('DELETE', {});
        return customFetch('/api/event/unjoin/'+id+'/', data);
    }

    static oauth2apps() {
        var data = JSONGet();
        return customFetch('/api/oauth2apps/', data);
    }
}
