import 'fetch';


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


export default class API {
    static login(email, password) {
        var data = JSONPost({
            username: email,
            password: password
        });

        return fetch('/api/token/', data).then(checkStatus).then(parseJSON);
    }

    static setPos(lat, lon, token) {
        var data = JSONPost({ lat: lat, lon: lon }, token);
        return fetch('/api/player/set-pos/', data).then(checkStatus).then(parseJSON);
    }
}
