var Promise = require('es6-promise').Promise;
import 'fetch';
import "isomorphic-fetch";

//var HOST = "http://socializa.wadobo.com";
var HOST = "";

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


function JSONPost(data, token) {
    var d = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    if (token) {
        d.headers.Authorization = 'Token ' + token;
    }

    return d;
}


function JSONGet(token) {
    var d = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }

    if (token) {
        d.headers.Authorization = 'Token ' + token;
    }

    return d;
}


export default class API {
    static login(email, password) {
        var data = JSONPost({
            username: email,
            password: password
        });

        return fetch(HOST+'/api/token/', data).then(checkStatus).then(parseJSON);
    }

    static setPos(lat, lon, token) {
        var data = JSONPost({ lat: lat, lon: lon }, token);
        return fetch(HOST+'/api/player/set-pos/', data).then(checkStatus).then(parseJSON);
    }

    static nearPlayers(token) {
        var data = JSONGet(token);
        return fetch(HOST+'/api/player/near/', data).then(checkStatus).then(parseJSON);
    }

    static connectPlayer(id, token) {
        var data = JSONPost({}, token);
        return fetch(HOST+'/api/player/meeting/'+id+'/', data).then(checkStatus).then(parseJSON);
    }

    static allEvents(token) {
        var data = JSONGet(token);
        return fetch(HOST+'/api/event/all/', data).then(checkStatus).then(parseJSON);
    }
}
