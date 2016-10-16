import $ from 'jquery';


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
    // TODO: make the real login
    console.log("auth: " + email + ', ' + password);
    user.isAuthenticated = true;
    user.username = email;
    user.apikey = 'FAKEAPIKEY';

    localStorage['socializa-user'] = JSON.stringify(user);
};


export function logout() {
    localStorage['socializa-user'] = ''
    user = $.extend({}, defuser);
    console.log("logout");
};


export function register(email, password) {
    return true;
};
