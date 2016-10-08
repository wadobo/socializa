import $ from 'jquery';
import 'jquery.cookie';


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
    var u = $.cookie('socializa-user');
    if (u) {
        u = JSON.parse(u);
        user = $.extend(user, u);
    }
}
loadUser();


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
    // TODO: make the real login
    console.log("auth: " + email + ', ' + password);
    user.isAuthenticated = true;
    user.username = email;
    user.apikey = 'FAKEAPIKEY';

    $.cookie('socializa-user', JSON.stringify(user));
};


export function logout() {
    $.cookie('socializa-user', '');
    user = $.extend({}, defuser);
    console.log("logout");
};


export function register(email, password) {
    return true;
};
