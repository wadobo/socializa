import $ from 'jquery';
import API from './api';


let defuser = {
    username: '',
    apikey: '',
    isAuthenticated: false,
    interests: []
};


export let user = {
    username: '',
    apikey: '',
    isAuthenticated: false,
    interests: []
};


function loadUser() {
    var u = localStorage['socializa-user'];
    if (u) {
        u = JSON.parse(u);
        user = $.extend(user, u);
    }
}
loadUser();


export function setUser(newuser) {
    user = $.extend(user, newuser);
}


export function requireAuth(nextState, replace) {
    if (!user.isAuthenticated) {
        replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname }
        })
    }
};


export function isAuthenticated() {
    return user.isAuthenticated;
};


export function login(email, password) {
    return API.login(email, password)
        .then(function(resp) {
            user.isAuthenticated = true;
            user.username = email;
            user.apikey = resp.token;
            localStorage['socializa-user'] = JSON.stringify(user);
        });
};


export function logout() {
    localStorage['socializa-user'] = ''
    user = $.extend({}, defuser);
    console.log("logout");
};


export function register(email, password) {
    return true;
};
