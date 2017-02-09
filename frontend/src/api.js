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

    // <- connected | step1 | step2
    static connectPlayer(id, ev) {
        var data = JSONPost({});
        var url = '/api/player/meeting/'+id+'/';
        if (ev) url += ev + '/';
        return customFetch(url, data);
    }

    //POST captured()
    // <- connected
    static captured(id, ev, code) {
        var data = JSONPost({});
        var url = '/api/player/meeting/'+id+'/';
        if (ev) url += ev + '/';
        url += 'captured/' + code;
        return customFetch(url, data);
    }

    //GET qrclue
    static qrclue(id, ev) {
        var data = JSONGet();
        var url = '/api/player/meeting/'+id+'/';
        if (ev) url += ev + '/';
        url += 'qrclue/';
        return customFetch(url, data);
    }

    static allEvents(page) {
        var data = JSONGet();
        var url = '/api/event/all/';
        if (page) {
            url += '?page='+page;
        }
        return customFetch(url, data);
    }

    static EventDetail(id) {
        var data = JSONGet();
        return customFetch('/api/event/'+id+'/', data);
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

    static clues(gameid) {
        var data = JSONGet();
        return customFetch('/api/clue/my-clues/'+gameid+'/', data);
    }

    static solve_clue(clueid, solution) {
        var data = JSONPost({ 'solution': solution });
        return customFetch('/api/clue/solve/'+clueid+'/', data);
    }

    static solve(eventid, solution) {
        var data = JSONPost({ 'solution': solution });
        return customFetch('/api/event/solve/'+eventid+'/', data);
    }

    static getProfile() {
        var data = JSONGet();
        return customFetch('/api/player/profile/', data);
    }

    static setProfile(data) {
        var data = JSONPost(data);
        return customFetch('/api/player/profile/', data);
    }
}
