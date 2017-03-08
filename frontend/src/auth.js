import $ from 'jquery';


let defuser = {
    username: '',
    apikey: '',
    isAuthenticated: false,
    activeEvent: null,
    interests: []
};


export let user = {
    username: '',
    apikey: '',
    authmethod: 'token',
    isAuthenticated: false,
    activeEvent: null,
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


export function login(email, token, method) {
    user.isAuthenticated = true;
    user.username = email;
    user.apikey = token;
    user.authmethod = method;
    localStorage['socializa-user'] = JSON.stringify(user);
};


export function storeUser() {
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

export function getIcon(p) {
    // returns an icon based on the player id
    var icons = {
        player: ['geo10', 'geo9', 'geo8', 'geo7', 'geo6', 'geo5', 'geo4', 'geo3', 'geo2'],
        ia: ['geo-ia']
    };

    var l = p.ia ? icons.ia : icons.player;
    //var r = Math.floor(Math.random() * l.length);
    var icon = l[p.pk % l.length];
    return 'app/images/'+ icon +'.svg';
}
