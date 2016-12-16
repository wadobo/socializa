var Promise = require('es6-promise').Promise;
import 'fetch';
import "isomorphic-fetch";


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


function JSONq(method, data, token) {
    var d = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    if (method == 'GET' || method == 'HEAD') {
        delete d.body;
    }

    if (token) {
        d.headers.Authorization = 'Token ' + token;
    }

    return d;
}


function JSONPost(data, token) {
    return JSONq('POST', data, token);
}


function JSONGet(token) {
    return JSONq('GET', {}, token);
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

    static setPos(lat, lon, token) {
        var data = JSONPost({ lat: lat, lon: lon }, token);
        return customFetch('/api/player/set-pos/', data);
    }

    static nearPlayers(token) {
        var data = JSONGet(token);
        return customFetch('/api/player/near/', data);
    }

    static connectPlayer(id, ev, token) {
        var data = JSONPost({}, token);
        var url = '/api/player/meeting/'+id+'/';
        if (ev) {
            url += ev + '/';
        }
        return customFetch(url, data);
    }

    static allEvents(token) {
        var data = JSONGet(token);
        return customFetch('/api/event/all/', data);
    }

    static joinEvent(id, token) {
        var data = JSONPost({}, token);
        return customFetch('/api/event/join/'+id+'/', data);
    }

    static leaveEvent(id, token) {
        var data = JSONq('DELETE', {}, token);
        return customFetch('/api/event/unjoin/'+id+'/', data);
    }
}
