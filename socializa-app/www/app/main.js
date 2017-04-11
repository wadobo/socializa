webpackJsonp([0],{

/***/ 102:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};

/***/ }),

/***/ 103:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__logger__ = __webpack_require__(23);
/* harmony export (immutable) */ __webpack_exports__["a"] = convertAPIOptions;
/* harmony export (immutable) */ __webpack_exports__["b"] = convertJSONOptions;
/* harmony export (immutable) */ __webpack_exports__["d"] = convertTOptions;
/* harmony export (immutable) */ __webpack_exports__["c"] = appendBackwardsAPI;


function convertInterpolation(options) {

  options.interpolation = {
    unescapeSuffix: 'HTML'
  };

  options.interpolation.prefix = options.interpolationPrefix || '__';
  options.interpolation.suffix = options.interpolationSuffix || '__';
  options.interpolation.escapeValue = options.escapeInterpolation || false;

  options.interpolation.nestingPrefix = options.reusePrefix || '$t(';
  options.interpolation.nestingSuffix = options.reuseSuffix || ')';

  return options;
}

function convertAPIOptions(options) {
  if (options.resStore) options.resources = options.resStore;

  if (options.ns && options.ns.defaultNs) {
    options.defaultNS = options.ns.defaultNs;
    options.ns = options.ns.namespaces;
  } else {
    options.defaultNS = options.ns || 'translation';
  }

  if (options.fallbackToDefaultNS && options.defaultNS) options.fallbackNS = options.defaultNS;

  options.saveMissing = options.sendMissing;
  options.saveMissingTo = options.sendMissingTo || 'current';
  options.returnNull = options.fallbackOnNull ? false : true;
  options.returnEmptyString = options.fallbackOnEmpty ? false : true;
  options.returnObjects = options.returnObjectTrees;
  options.joinArrays = '\n';

  options.returnedObjectHandler = options.objectTreeKeyHandler;
  options.parseMissingKeyHandler = options.parseMissingKey;
  options.appendNamespaceToMissingKey = true;

  options.nsSeparator = options.nsseparator || ':';
  options.keySeparator = options.keyseparator || '.';

  if (options.shortcutFunction === 'sprintf') {
    options.overloadTranslationOptionHandler = function (args) {
      var values = [];

      for (var i = 1; i < args.length; i++) {
        values.push(args[i]);
      }

      return {
        postProcess: 'sprintf',
        sprintf: values
      };
    };
  }

  options.whitelist = options.lngWhitelist;
  options.preload = options.preload;
  if (options.load === 'current') options.load = 'currentOnly';
  if (options.load === 'unspecific') options.load = 'languageOnly';

  // backend
  options.backend = options.backend || {};
  options.backend.loadPath = options.resGetPath || 'locales/__lng__/__ns__.json';
  options.backend.addPath = options.resPostPath || 'locales/add/__lng__/__ns__';
  options.backend.allowMultiLoading = options.dynamicLoad;

  // cache
  options.cache = options.cache || {};
  options.cache.prefix = 'res_';
  options.cache.expirationTime = 7 * 24 * 60 * 60 * 1000;
  options.cache.enabled = options.useLocalStorage ? true : false;

  options = convertInterpolation(options);
  if (options.defaultVariables) options.interpolation.defaultVariables = options.defaultVariables;

  // TODO: deprecation
  // if (options.getAsync === false) throw deprecation error

  return options;
}

function convertJSONOptions(options) {
  options = convertInterpolation(options);
  options.joinArrays = '\n';

  return options;
}

function convertTOptions(options) {
  if (options.interpolationPrefix || options.interpolationSuffix || options.escapeInterpolation) {
    options = convertInterpolation(options);
  }

  options.nsSeparator = options.nsseparator;
  options.keySeparator = options.keyseparator;

  options.returnObjects = options.returnObjectTrees;

  return options;
}

function appendBackwardsAPI(i18n) {
  i18n.lng = function () {
    __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].deprecate('i18next.lng() can be replaced by i18next.language for detected language or i18next.languages for languages ordered by translation lookup.');
    return i18n.services.languageUtils.toResolveHierarchy(i18n.language)[0];
  };

  i18n.preload = function (lngs, cb) {
    __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].deprecate('i18next.preload() can be replaced with i18next.loadLanguages()');
    i18n.loadLanguages(lngs, cb);
  };

  i18n.setLng = function (lng, options, callback) {
    __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].deprecate('i18next.setLng() can be replaced with i18next.changeLanguage() or i18next.getFixedT() to get a translation function with fixed language or namespace.');
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!options) options = {};

    if (options.fixLng === true) {
      if (callback) return callback(null, i18n.getFixedT(lng));
    }

    i18n.changeLanguage(lng, callback);
  };

  i18n.addPostProcessor = function (name, fc) {
    __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].deprecate('i18next.addPostProcessor() can be replaced by i18next.use({ type: \'postProcessor\', name: \'name\', process: fc })');
    i18n.use({
      type: 'postProcessor',
      name: name,
      process: fc
    });
  };
}

/***/ }),

/***/ 104:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({

  processors: {},

  addPostProcessor: function addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle: function handle(processors, value, key, options, translator) {
    var _this = this;

    processors.forEach(function (processor) {
      if (_this.processors[processor]) value = _this.processors[processor].process(value, key, options, translator);
    });

    return value;
  }
});

/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.I18nextProvider = exports.Interpolate = exports.translate = exports.loadNamespaces = undefined;

var _translate = __webpack_require__(469);

var _translate2 = _interopRequireDefault(_translate);

var _interpolate = __webpack_require__(467);

var _interpolate2 = _interopRequireDefault(_interpolate);

var _I18nextProvider = __webpack_require__(466);

var _I18nextProvider2 = _interopRequireDefault(_I18nextProvider);

var _loadNamespaces = __webpack_require__(468);

var _loadNamespaces2 = _interopRequireDefault(_loadNamespaces);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.loadNamespaces = _loadNamespaces2.default;
exports.translate = _translate2.default;
exports.Interpolate = _interpolate2.default;
exports.I18nextProvider = _I18nextProvider2.default;

/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.user = undefined;
exports.setUser = setUser;
exports.requireAuth = requireAuth;
exports.isAuthenticated = isAuthenticated;
exports.login = login;
exports.storeUser = storeUser;
exports.logout = logout;
exports.getIcon = getIcon;

var _jquery = __webpack_require__(8);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defuser = {
    username: '',
    apikey: '',
    isAuthenticated: false,
    activeEvent: null,
    interests: []
};

var user = exports.user = {
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
        exports.user = user = _jquery2.default.extend(user, u);
    }
}
loadUser();

function setUser(newuser) {
    exports.user = user = _jquery2.default.extend(user, newuser);
}

function requireAuth(nextState, replace) {
    if (!user.isAuthenticated) {
        replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname }
        });
    }
};

function isAuthenticated() {
    return user.isAuthenticated;
};

function login(email, token, method) {
    user.isAuthenticated = true;
    user.username = email;
    user.apikey = token;
    user.authmethod = method;
    localStorage['socializa-user'] = JSON.stringify(user);
};

function storeUser() {
    localStorage['socializa-user'] = JSON.stringify(user);
};

function logout() {
    localStorage['socializa-user'] = '';
    exports.user = user = _jquery2.default.extend({}, defuser);
};

function getIcon(p) {
    // returns an icon based on the player id
    var icons = {
        player: ['geo10', 'geo9', 'geo8', 'geo7', 'geo6', 'geo5', 'geo4', 'geo3', 'geo2'],
        ai: ['geo-ia']
    };

    var l = p.ptype == 'ai' ? icons.ai : icons.player;
    //var r = Math.floor(Math.random() * l.length);
    var icon = l[p.pk % l.length];
    return 'app/images/' + icon + '.svg';
}

/***/ }),

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(95);

__webpack_require__(373);

var _auth = __webpack_require__(13);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = __webpack_require__(309).Promise;


function fake(data) {
    var p = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(data);
        }, Math.random() * 1000);
    });
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
    };

    if (method == 'GET' || method == 'HEAD') {
        delete d.body;
    }

    if (_auth.user.apikey) {
        d.headers.Authorization = 'Token ' + _auth.user.apikey;
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

var API = function () {
    function API() {
        _classCallCheck(this, API);
    }

    _createClass(API, null, [{
        key: 'login',
        value: function login(email, password) {
            var data = JSONPost({
                username: email,
                password: password
            });

            return customFetch('/api/token/', data);
        }
    }, {
        key: 'register',
        value: function register(email, password) {
            var data = JSONPost({
                email: email,
                password: password
            });

            return customFetch('/api/player/register/', data);
        }
    }, {
        key: 'setPos',
        value: function setPos(lat, lon) {
            var data = JSONPost({ lat: lat, lon: lon });
            return customFetch('/api/player/set-pos/', data);
        }
    }, {
        key: 'nearPlayers',
        value: function nearPlayers(ev) {
            var data = JSONGet();
            var url = '/api/player/near/';
            if (ev) {
                url += ev + '/';
            }
            return customFetch(url, data);
        }

        // <- connected | step1 | step2

    }, {
        key: 'connectPlayer',
        value: function connectPlayer(id, ev) {
            var data = JSONPost({});
            var url = '/api/player/meeting/' + id + '/';
            if (ev) url += ev + '/';
            return customFetch(url, data);
        }

        //POST captured()
        // <- connected

    }, {
        key: 'captured',
        value: function captured(id, ev, code) {
            var data = JSONPost({});
            var url = '/api/player/meeting/' + id + '/';
            if (ev) url += ev + '/';
            url += 'captured/' + code + '/';
            return customFetch(url, data);
        }

        //GET qrclue

    }, {
        key: 'qrclue',
        value: function qrclue(id, ev) {
            var data = JSONGet();
            var url = '/api/player/meeting/' + id + '/';
            if (ev) url += ev + '/';
            url += 'qrclue/';
            return customFetch(url, data);
        }
    }, {
        key: 'allEvents',
        value: function allEvents(q) {
            var data = JSONGet();
            var url = '/api/event/all/';
            if (q) {
                url += '?' + $.param(q);
            }
            return customFetch(url, data);
        }
    }, {
        key: 'myEvents',
        value: function myEvents() {
            var data = JSONGet();
            var url = '/api/event/my-events/';
            return customFetch(url, data);
        }
    }, {
        key: 'EventDetail',
        value: function EventDetail(id) {
            var data = JSONGet();
            return customFetch('/api/event/' + id + '/', data);
        }
    }, {
        key: 'joinEvent',
        value: function joinEvent(id) {
            var data = JSONPost({});
            return customFetch('/api/event/join/' + id + '/', data);
        }
    }, {
        key: 'leaveEvent',
        value: function leaveEvent(id) {
            var data = JSONq('DELETE', {});
            return customFetch('/api/event/unjoin/' + id + '/', data);
        }
    }, {
        key: 'oauth2apps',
        value: function oauth2apps() {
            var data = JSONGet();
            return customFetch('/api/oauth2apps/', data);
        }
    }, {
        key: 'clues',
        value: function clues(gameid) {
            var data = JSONGet();
            return customFetch('/api/clue/my-clues/' + gameid + '/', data);
        }
    }, {
        key: 'solve_clue',
        value: function solve_clue(clueid, solution) {
            var data = JSONPost({ 'solution': solution });
            return customFetch('/api/clue/solve/' + clueid + '/', data);
        }
    }, {
        key: 'solve',
        value: function solve(eventid, solution) {
            var data = JSONPost({ 'solution': solution });
            return customFetch('/api/event/solve/' + eventid + '/', data);
        }
    }, {
        key: 'getProfile',
        value: function getProfile(userid) {
            var data = JSONGet();
            var url = '/api/player/profile/';
            if (userid) {
                url += userid + '/';
            }
            return customFetch(url, data);
        }
    }, {
        key: 'setProfile',
        value: function setProfile(data) {
            var data = JSONPost(data);
            return customFetch('/api/player/profile/', data);
        }
    }, {
        key: 'setPlayingEvent',
        value: function setPlayingEvent(evid) {
            var data = JSONPost({});
            var url = '/api/event/current/';
            if (evid) {
                url += evid + '/';
            }

            return customFetch(url, data);
        }
    }, {
        key: 'getEventChallenges',
        value: function getEventChallenges(evid) {
            var data = JSONGet({});
            return customFetch('/api/event/admin/challenges/' + evid + '/', data);
        }
    }, {
        key: 'setEventProperties',
        value: function setEventProperties(evid, options) {
            var data = JSONPost(options);
            return customFetch('/api/event/admin/' + evid + '/', data);
        }
    }]);

    return API;
}();

exports.default = API;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),

/***/ 22:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bucket = function Bucket() {
    _classCallCheck(this, Bucket);
};

Object.defineProperty(Bucket, "lastPost", {
    enumerable: true,
    writable: true,
    value: null
});
Object.defineProperty(Bucket, "clue", {
    enumerable: true,
    writable: true,
    value: null
});
Object.defineProperty(Bucket, "setAppState", {
    enumerable: true,
    writable: true,
    value: null
});
exports.default = Bucket;

/***/ }),

/***/ 23:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var consoleLogger = {
  type: 'logger',

  log: function log(args) {
    this._output('log', args);
  },
  warn: function warn(args) {
    this._output('warn', args);
  },
  error: function error(args) {
    this._output('error', args);
  },
  _output: function _output(type, args) {
    if (console && console[type]) console[type].apply(console, Array.prototype.slice.call(args));
  }
};

var Logger = function () {
  function Logger(concreteLogger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Logger);

    this.init(concreteLogger, options);
  }

  Logger.prototype.init = function init(concreteLogger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    this.prefix = options.prefix || 'i18next:';
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug === false ? false : true;
  };

  Logger.prototype.setDebug = function setDebug(bool) {
    this.debug = bool;
  };

  Logger.prototype.log = function log() {
    this.forward(arguments, 'log', '', true);
  };

  Logger.prototype.warn = function warn() {
    this.forward(arguments, 'warn', '', true);
  };

  Logger.prototype.error = function error() {
    this.forward(arguments, 'error', '');
  };

  Logger.prototype.deprecate = function deprecate() {
    this.forward(arguments, 'warn', 'WARNING DEPRECATED: ', true);
  };

  Logger.prototype.forward = function forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return;
    if (typeof args[0] === 'string') args[0] = prefix + this.prefix + ' ' + args[0];
    this.logger[lvl](args);
  };

  Logger.prototype.create = function create(moduleName) {
    var sub = new Logger(this.logger, _extends({ prefix: this.prefix + ':' + moduleName + ':' }, this.options));

    return sub;
  };

  // createInstance(options = {}) {
  //   return new Logger(options, callback);
  // }

  return Logger;
}();

;

/* harmony default export */ __webpack_exports__["a"] = (new Logger());

/***/ }),

/***/ 253:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var isModifiedEvent = function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
};

/**
 * The public API for rendering a history-aware <a>.
 */

var Link = function (_React$Component) {
  _inherits(Link, _React$Component);

  function Link() {
    var _temp, _this, _ret;

    _classCallCheck(this, Link);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleClick = function (event) {
      if (_this.props.onClick) _this.props.onClick(event);

      if (!event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !_this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
      ) {
          event.preventDefault();

          var history = _this.context.router.history;
          var _this$props = _this.props,
              replace = _this$props.replace,
              to = _this$props.to;


          if (replace) {
            history.replace(to);
          } else {
            history.push(to);
          }
        }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Link.prototype.render = function render() {
    var _props = this.props,
        replace = _props.replace,
        to = _props.to,
        props = _objectWithoutProperties(_props, ['replace', 'to']); // eslint-disable-line no-unused-vars

    var href = this.context.router.history.createHref(typeof to === 'string' ? { pathname: to } : to);

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('a', _extends({}, props, { onClick: this.handleClick, href: href }));
  };

  return Link;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Link.propTypes = {
  onClick: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func,
  target: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string,
  replace: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].bool,
  to: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].oneOfType([__WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string, __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].object]).isRequired
};
Link.defaultProps = {
  replace: false
};
Link.contextTypes = {
  router: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].shape({
    history: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].shape({
      push: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func.isRequired,
      replace: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func.isRequired,
      createHref: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func.isRequired
    }).isRequired
  }).isRequired
};


/* harmony default export */ __webpack_exports__["a"] = (Link);

/***/ }),

/***/ 265:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _reactRouterDom = __webpack_require__(49);

var _navbar = __webpack_require__(278);

var _navbar2 = _interopRequireDefault(_navbar);

var _map = __webpack_require__(277);

var _map2 = _interopRequireDefault(_map);

var _profile = __webpack_require__(279);

var _profile2 = _interopRequireDefault(_profile);

var _events = __webpack_require__(274);

var _events2 = _interopRequireDefault(_events);

var _event = __webpack_require__(273);

var _event2 = _interopRequireDefault(_event);

var _connect = __webpack_require__(61);

var _connect2 = _interopRequireDefault(_connect);

var _qrview = __webpack_require__(281);

var _qrview2 = _interopRequireDefault(_qrview);

var _qrcapt = __webpack_require__(280);

var _qrcapt2 = _interopRequireDefault(_qrcapt);

var _clue = __webpack_require__(271);

var _clue2 = _interopRequireDefault(_clue);

var _admin = __webpack_require__(270);

var _admin2 = _interopRequireDefault(_admin);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _auth = __webpack_require__(13);

var _jquery = __webpack_require__(8);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.$ = window.jQuery = _jquery2.default;

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, App);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = App.__proto__ || Object.getPrototypeOf(App)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: { title: 'Socializa', active: null }
        }), Object.defineProperty(_this, 'setAppState', {
            enumerable: true,
            writable: true,
            value: function value(newst) {
                _this.setState(newst);
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(App, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            if (!(0, _auth.isAuthenticated)()) {
                if (this.props.history.location.pathname != '/login') {
                    this.props.history.push('/login');
                }
            }

            if (!this.props.children) {
                this.props.history.push('/map');
            }
            _bucket2.default.setAppState = this.setAppState;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                _reactRouterDom.HashRouter,
                null,
                _react2.default.createElement(
                    'div',
                    { id: 'socializa-app' },
                    _react2.default.createElement(_navbar2.default, { title: this.state.title, active: this.state.active }),
                    _react2.default.createElement(
                        'div',
                        null,
                        this.props.children
                    ),
                    _react2.default.createElement('div', { id: 'overlay' }),
                    _react2.default.createElement(
                        _reactRouterDom.Switch,
                        null,
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/map', component: _map2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/map/:ev', component: _map2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/profile', component: _profile2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/events', component: _events2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/event/:pk', component: _event2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/admin/:pk', component: _admin2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/connect/:pk', component: _connect2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/qrcode/:user/:ev/:secret', component: _qrview2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/qrcapt/:user/:ev', component: _qrcapt2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/clue', component: _clue2.default })
                    )
                )
            );
        }
    }]);

    return App;
}(_react2.default.Component);

exports.default = (0, _reactRouter.withRouter)(App);

/***/ }),

/***/ 266:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _reactRouterDom = __webpack_require__(49);

var _jquery = __webpack_require__(8);

var _jquery2 = _interopRequireDefault(_jquery);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _auth = __webpack_require__(13);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Login = function (_React$Component) {
    _inherits(Login, _React$Component);

    function Login(props) {
        _classCallCheck(this, Login);

        var _this = _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).call(this, props));

        Object.defineProperty(_this, 'getQueryParams', {
            enumerable: true,
            writable: true,
            value: function value() {
                var qs = document.location.search;
                qs = qs.split('+').join(' ');

                var params = {},
                    tokens,
                    re = /[?&]?([^=]+)=([^&]*)/g;

                while (tokens = re.exec(qs)) {
                    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
                }

                return params;
            }
        });
        Object.defineProperty(_this, 'emailChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ email: e.target.value });
            }
        });
        Object.defineProperty(_this, 'passChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ password: e.target.value });
            }
        });
        Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                email: '', password: '',
                gapp: null, fapp: null
            }
        });
        Object.defineProperty(_this, 'login', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var email = _this.state.email;
                var password = _this.state.password;
                var self = _this;

                return _api2.default.login(email, password).then(function (resp) {
                    (0, _auth.login)(email, resp.token, 'token');
                    self.props.history.push('/map');
                }).catch(function (error) {
                    alert(error);
                });
            }
        });
        return _this;
    }

    _createClass(Login, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var self = this;

            var q = this.getQueryParams();

            if (q.token) {
                self.authWithToken(q.token, q.email);
            } else {
                _api2.default.oauth2apps().then(function (resp) {
                    self.setState({
                        gapp: resp.google,
                        fapp: resp.facebook
                    });
                });
            }
        }
    }, {
        key: 'authWithToken',
        value: function authWithToken(token, email) {
            (0, _auth.login)(email, token, 'token');
            this.props.history.push('/map');
            document.location.search = '';
        }
    }, {
        key: 'socialAuth',
        value: function socialAuth(backend) {
            var self = this;
            var redirect = encodeURIComponent('https://socializa.wadobo.com/oauth2callback');

            var app = '';
            var uri = '';
            switch (backend) {
                case 'google':
                    uri = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=email&client_id=';
                    app = this.state.gapp;
                    break;
                case 'facebook':
                    app = this.state.fapp;
                    uri = 'https://www.facebook.com/v2.8/dialog/oauth?response_type=token&scope=email&client_id=';
                    break;
            }

            uri += app;
            uri += '&redirect_uri=' + redirect;
            uri += '&state=' + btoa(JSON.stringify({ app: backend, url: location.href }));

            if (window.HOST != '') {
                this.win = window.open(uri, '_blank', 'location=no');
            } else {
                location.href = uri;
            }

            function loadCallBack(ev) {
                var qs = ev.url;
                qs = qs.split('+').join(' ');
                if (!qs.includes('oauth2redirect')) {
                    return;
                }

                var params = {},
                    tokens,
                    re = /[?&]?([^=]+)=([^&]*)/g;

                while (tokens = re.exec(qs)) {
                    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
                }
                if (params.token) {
                    self.authWithToken(params.token, params.email);
                }
                self.win.close();
            }

            if (this.win) {
                this.win.addEventListener('loadstart', loadCallBack);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this.props.t;


            return _react2.default.createElement(
                'div',
                { id: 'login', className: 'container mbottom' },
                _react2.default.createElement(
                    'div',
                    { className: 'header text-center' },
                    _react2.default.createElement('img', { src: 'app/images/icon.png', className: 'logo', alt: 'logo' }),
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'h1',
                        null,
                        'Socializa'
                    )
                ),
                _react2.default.createElement(
                    'form',
                    { className: 'form' },
                    _react2.default.createElement('input', { className: 'form-control', type: 'email', id: 'email', name: 'email', placeholder: t('login::email'), value: this.state.email, onChange: this.emailChange }),
                    _react2.default.createElement('input', { className: 'form-control', type: 'password', id: 'password', name: 'password', placeholder: t('login::password'), value: this.state.password, onChange: this.passChange })
                ),
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    _reactRouterDom.Link,
                    { to: '/register', className: 'pull-right btn btn-primary' },
                    t('login::New account')
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(
                        'h3',
                        null,
                        t('login::Login using Facebook or Google')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'social row text-center' },
                    _react2.default.createElement(
                        'div',
                        { className: 'col-xs-6' },
                        this.state.fapp ? _react2.default.createElement(
                            'a',
                            { onClick: this.socialAuth.bind(this, 'facebook'), className: 'btn btn-primary btn-circle' },
                            _react2.default.createElement('i', { className: 'fa fa-facebook', 'aria-hidden': 'true' })
                        ) : _react2.default.createElement('span', null)
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'col-xs-6' },
                        this.state.gapp ? _react2.default.createElement(
                            'a',
                            { onClick: this.socialAuth.bind(this, 'google'), className: 'btn btn-danger btn-circle' },
                            _react2.default.createElement('i', { className: 'fa fa-google-plus', 'aria-hidden': 'true' })
                        ) : _react2.default.createElement('span', null)
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'button',
                    { className: 'btn btn-fixed-bottom btn-success', onClick: this.login },
                    t('login::Login')
                )
            );
        }
    }]);

    return Login;
}(_react2.default.Component);

exports.default = (0, _reactI18next.translate)(['login'], { wait: true })((0, _reactRouter.withRouter)(Login));

/***/ }),

/***/ 267:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _jquery = __webpack_require__(8);

var _jquery2 = _interopRequireDefault(_jquery);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _auth = __webpack_require__(13);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Register = function (_React$Component) {
    _inherits(Register, _React$Component);

    function Register() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Register);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Register.__proto__ || Object.getPrototypeOf(Register)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                email: '', password: '', password2: ''
            }
        }), Object.defineProperty(_this, 'emailChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ email: e.target.value });
            }
        }), Object.defineProperty(_this, 'passChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ password: e.target.value });
            }
        }), Object.defineProperty(_this, 'passChange2', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ password2: e.target.value });
            }
        }), Object.defineProperty(_this, 'register', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var t = _this.props.t;

                var self = _this;

                var email = _this.state.email;
                var pwd = _this.state.password;
                var pwd2 = _this.state.password2;
                if (pwd != pwd2) {
                    alert(t("login::Passwords didn't match"));
                    return;
                }
                _api2.default.register(email, pwd).then(function (resp) {
                    if (resp.status == 'nok') {
                        alert(t('login::Invalid or used email'));
                    } else {
                        alert(t('login::Check your email and confirm your account'));
                        self.props.history.push('/login');
                    }
                }).catch(function (e) {
                    alert(e);
                });
            }
        }), Object.defineProperty(_this, 'goBack', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.props.history.push('/login');
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Register, [{
        key: 'render',
        value: function render() {
            var t = this.props.t;


            return _react2.default.createElement(
                'div',
                { id: 'register', className: 'container mbottom' },
                _react2.default.createElement(
                    'div',
                    { className: 'goback', onClick: this.goBack },
                    _react2.default.createElement('i', { className: 'fa fa-chevron-left' })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'header text-center' },
                    _react2.default.createElement('img', { src: 'app/images/icon.png', className: 'logo', alt: 'logo', height: '50px' }),
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'h1',
                        null,
                        t('login::Register')
                    )
                ),
                _react2.default.createElement(
                    'form',
                    { className: 'form' },
                    _react2.default.createElement('input', { className: 'form-control', type: 'email', id: 'email', name: 'email', placeholder: t('login::email'), value: this.state.email, onChange: this.emailChange }),
                    _react2.default.createElement('input', { className: 'form-control', type: 'password', id: 'password', name: 'password', placeholder: t('login::password'), value: this.state.password, onChange: this.passChange }),
                    _react2.default.createElement('input', { className: 'form-control', type: 'password', id: 'password2', name: 'password2', placeholder: t('login::repeat the password'), value: this.state.password2, onChange: this.passChange2 })
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'button',
                    { className: 'btn btn-fixed-bottom btn-success', onClick: this.register },
                    t('login::Register')
                )
            );
        }
    }]);

    return Register;
}(_react2.default.Component);

exports.default = Register = (0, _reactI18next.translate)(['login'], { wait: true })((0, _reactRouter.withRouter)(Register));

/***/ }),

/***/ 270:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _auth = __webpack_require__(13);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Challenge = function (_React$Component) {
    _inherits(Challenge, _React$Component);

    function Challenge() {
        _classCallCheck(this, Challenge);

        return _possibleConstructorReturn(this, (Challenge.__proto__ || Object.getPrototypeOf(Challenge)).apply(this, arguments));
    }

    _createClass(Challenge, [{
        key: 'render',
        value: function render() {
            var c = this.props.c;

            return _react2.default.createElement(
                'div',
                { className: 'challenge' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'strong',
                        null,
                        c.name
                    ),
                    c.player && [_react2.default.createElement(
                        'span',
                        { className: 'text-muted' },
                        ' / ',
                        c.player.ptype
                    ), _react2.default.createElement(
                        'span',
                        { className: 'text-primary' },
                        ' / ',
                        c.player.username
                    )]
                )
            );
        }
    }]);

    return Challenge;
}(_react2.default.Component);

var Admin = function (_React$Component2) {
    _inherits(Admin, _React$Component2);

    function Admin() {
        var _ref;

        var _temp, _this2, _ret;

        _classCallCheck(this, Admin);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = Admin.__proto__ || Object.getPrototypeOf(Admin)).call.apply(_ref, [this].concat(args))), _this2), Object.defineProperty(_this2, 'state', {
            enumerable: true,
            writable: true,
            value: {
                ev: null,
                cs: null,
                vd: 0,
                md: 0
            }
        }), Object.defineProperty(_this2, 'updateEvents', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this2;
                _api2.default.EventDetail(self.props.match.params.pk).then(function (ev) {
                    self.setState({ ev: ev, vd: ev.vision_distance, md: ev.meeting_distance });
                    self.retitle();
                    self.updateChallenges();
                });
            }
        }), Object.defineProperty(_this2, 'updateChallenges', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this2;
                _api2.default.getEventChallenges(self.props.match.params.pk).then(function (cs) {
                    self.setState({ cs: cs });
                });
            }
        }), Object.defineProperty(_this2, 'retitle', {
            enumerable: true,
            writable: true,
            value: function value() {
                var title = 'Admin';
                if (_this2.state.ev) {
                    title = title + ' - ' + _this2.state.ev.name;
                }
                _bucket2.default.setAppState({ title: title, active: 'event' });
            }
        }), Object.defineProperty(_this2, 'save', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this2.props.t;


                _api2.default.setEventProperties(_this2.state.ev.pk, {
                    vision_distance: _this2.state.vd,
                    meeting_distance: _this2.state.md
                }).then(function () {
                    alert(t('common::Saved!'));
                });
            }
        }), Object.defineProperty(_this2, 'mdChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this2.setState({ md: e.target.value });
            }
        }), Object.defineProperty(_this2, 'vdChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this2.setState({ vd: e.target.value });
            }
        }), _temp), _possibleConstructorReturn(_this2, _ret);
    }

    _createClass(Admin, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.updateEvents();
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this.props.t;

            var self = this;

            return _react2.default.createElement(
                'div',
                { id: 'admin', className: 'container mbottom' },
                this.state.ev ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h3',
                        { className: 'text-center' },
                        this.state.ev.name
                    ),
                    _react2.default.createElement(
                        'table',
                        { className: 'table table-responsive' },
                        _react2.default.createElement(
                            'tbody',
                            null,
                            _react2.default.createElement(
                                'tr',
                                null,
                                _react2.default.createElement(
                                    'th',
                                    null,
                                    t('admin::Game')
                                ),
                                _react2.default.createElement(
                                    'td',
                                    null,
                                    this.state.ev.game.name
                                )
                            ),
                            _react2.default.createElement(
                                'tr',
                                null,
                                _react2.default.createElement(
                                    'th',
                                    null,
                                    t('admin::Vision distance (m)')
                                ),
                                _react2.default.createElement(
                                    'td',
                                    null,
                                    _react2.default.createElement('input', { type: 'number', className: 'form-control', placeholder: t('admin::vision distance'),
                                        onChange: this.vdChange,
                                        value: this.state.vd })
                                )
                            ),
                            _react2.default.createElement(
                                'tr',
                                null,
                                _react2.default.createElement(
                                    'th',
                                    null,
                                    t('admin::Interact distance (m)')
                                ),
                                _react2.default.createElement(
                                    'td',
                                    null,
                                    _react2.default.createElement('input', { type: 'number', className: 'form-control', placeholder: t('admin::interact distance'),
                                        onChange: this.mdChange,
                                        value: this.state.md })
                                )
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'h3',
                        null,
                        t('admin::Challenges')
                    ),
                    this.state.cs ? _react2.default.createElement(
                        'div',
                        null,
                        self.state.cs.map(function (c, i) {
                            return _react2.default.createElement(Challenge, { c: c });
                        })
                    ) : _react2.default.createElement(_loading2.default, null),
                    _react2.default.createElement(
                        'button',
                        { className: 'btn btn-fixed-bottom btn-success', onClick: this.save },
                        t('common::Save')
                    )
                ) : _react2.default.createElement(_loading2.default, null)
            );
        }
    }]);

    return Admin;
}(_react2.default.Component);

exports.default = Admin = (0, _reactI18next.translate)(['admin', 'common'], { wait: true })(Admin);

/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _htmlPurify = __webpack_require__(36);

var _htmlPurify2 = _interopRequireDefault(_htmlPurify);

var _auth = __webpack_require__(13);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Clue = function (_React$Component) {
    _inherits(Clue, _React$Component);

    function Clue() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Clue);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Clue.__proto__ || Object.getPrototypeOf(Clue)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                clue: null
            }
        }), Object.defineProperty(_this, 'goBack', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.props.history.push('/map');
            }
        }), Object.defineProperty(_this, 'viewEvent', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.props.history.push('/event/' + _auth.user.activeEvent.pk);
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Clue, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.setState({ clue: _bucket2.default.clue });
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this.props.t;

            var self = this;
            function createMarkup() {
                var purifier = new _htmlPurify2.default();
                var input = self.state.clue.desc;
                var result = purifier.purify(input);
                return { __html: result };
            }

            return _react2.default.createElement(
                'div',
                { id: 'clue', className: 'container mbottom' },
                this.state.clue ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'clue' },
                        _react2.default.createElement(
                            'h1',
                            null,
                            this.state.clue.name
                        ),
                        _react2.default.createElement('div', { dangerouslySetInnerHTML: createMarkup() })
                    ),
                    _react2.default.createElement(
                        'button',
                        { className: 'btn btn-primary btn-fixed-bottom-left', onClick: this.goBack },
                        t('clue::Map')
                    ),
                    _react2.default.createElement(
                        'button',
                        { className: 'btn btn-success btn-fixed-bottom-right', onClick: this.viewEvent },
                        t('clue::Event')
                    )
                ) : _react2.default.createElement(_loading2.default, null)
            );
        }
    }]);

    return Clue;
}(_react2.default.Component);

exports.default = Clue = (0, _reactI18next.translate)(['clue'], { wait: true })((0, _reactRouter.withRouter)(Clue));

/***/ }),

/***/ 272:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _htmlPurify = __webpack_require__(36);

var _htmlPurify2 = _interopRequireDefault(_htmlPurify);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClueRow = function (_React$Component) {
    _inherits(ClueRow, _React$Component);

    function ClueRow() {
        _classCallCheck(this, ClueRow);

        return _possibleConstructorReturn(this, (ClueRow.__proto__ || Object.getPrototypeOf(ClueRow)).apply(this, arguments));
    }

    _createClass(ClueRow, [{
        key: 'render',
        value: function render() {
            var self = this;
            function createMarkup() {
                var purifier = new _htmlPurify2.default();
                var input = self.props.clue.challenge.desc;
                var result = purifier.purify(input);
                return { __html: result };
            }
            return _react2.default.createElement(
                'div',
                { className: 'clue' },
                _react2.default.createElement(
                    'strong',
                    null,
                    this.props.clue.challenge.name
                ),
                ':',
                _react2.default.createElement('br', null),
                _react2.default.createElement('div', { dangerouslySetInnerHTML: createMarkup() })
            );
        }
    }]);

    return ClueRow;
}(_react2.default.Component);

exports.default = ClueRow = (0, _reactI18next.translate)(['clue'], { wait: true })(ClueRow);

/***/ }),

/***/ 273:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _auth = __webpack_require__(13);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

var _htmlPurify = __webpack_require__(36);

var _htmlPurify2 = _interopRequireDefault(_htmlPurify);

var _eventrow = __webpack_require__(98);

var _eventrow2 = _interopRequireDefault(_eventrow);

var _cluerow = __webpack_require__(272);

var _cluerow2 = _interopRequireDefault(_cluerow);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO, solve a clue. Clues can also be solved, but for now we don't
// support this.

var Event = function (_React$Component) {
    _inherits(Event, _React$Component);

    function Event() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Event);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Event.__proto__ || Object.getPrototypeOf(Event)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                user: _auth.user,
                ev: null,
                clues: null,
                solution: null,
                state: 'loading' // loading | event | solving | solving-loading | solved
            }
        }), Object.defineProperty(_this, 'updateClues', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this;
                _api2.default.clues(self.state.ev.game.pk).then(function (clues) {
                    var ev = self.state.ev;
                    if (ev.solved) {
                        self.setState({ clues: clues, state: 'solved', solution: ev.solved });
                    } else {
                        self.setState({ clues: clues, state: 'event' });
                    }
                });
            }
        }), Object.defineProperty(_this, 'updateEvents', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this;
                _api2.default.EventDetail(self.props.match.params.pk).then(function (ev) {
                    self.setState({ ev: ev });
                    self.updateClues();
                });
            }
        }), Object.defineProperty(_this, 'retitle', {
            enumerable: true,
            writable: true,
            value: function value() {
                var title = _this.props.t('events::Event');
                if (_this.state.ev) {
                    title = title + ' - ' + _this.state.name;
                }
                _bucket2.default.setAppState({ title: title, active: 'event' });
            }
        }), Object.defineProperty(_this, 'tryToSolve', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.setState({ state: 'solving' });
            }
        }), Object.defineProperty(_this, 'sendSolution', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;

                var self = _this;
                var solution = document.querySelector(".solve-input").value;
                _this.setState({ state: 'solving-loading' });
                _api2.default.solve(_this.state.ev.pk, solution).then(function (resp) {
                    if (resp.status == 'correct') {
                        self.setState({ state: 'solved', solution: solution });
                        alert(t('events::Conglatulations!'));
                    } else {
                        self.setState({ state: 'solving' });
                        alert(t('events::Wrong answer. Try again'));
                    }
                }).catch(function (err) {
                    self.setState({ state: 'solving' });
                    alert(t('common::Unknown error'));
                });
            }
        }), Object.defineProperty(_this, 'renderSolveButton', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;

                var button = _react2.default.createElement(
                    'button',
                    { onClick: _this.tryToSolve, className: 'btn btn-primary btn-fixed-bottom' },
                    t('events::Solve')
                );

                if (_this.state.state == 'solved') {
                    button = _react2.default.createElement(
                        'button',
                        { className: 'btn btn-success btn-fixed-bottom' },
                        _this.state.solution
                    );
                }
                return button;
            }
        }), Object.defineProperty(_this, 'renderSolving', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;

                var solving = _this.state.state == 'solving-loading';
                var button = _react2.default.createElement(
                    'button',
                    { onClick: _this.sendSolution, className: 'btn btn-primary', type: 'button' },
                    t('events::Go!')
                );
                if (_this.state.state == 'solving-loading') {
                    button = _react2.default.createElement(
                        'button',
                        { className: 'btn btn-primary disabled', type: 'button' },
                        _react2.default.createElement('i', { className: 'fa fa-cog fa-spin fa-fw' }),
                        _react2.default.createElement(
                            'span',
                            { className: 'sr-only' },
                            t('events::Loading...')
                        )
                    );
                }
                return _react2.default.createElement(
                    'div',
                    { className: 'event-solving' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        _this.state.ev.game.name
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _this.state.ev.game.desc
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'input-group' },
                        _react2.default.createElement('input', { type: 'text', className: 'solve-input form-control', placeholder: t('events::The solution!') }),
                        _react2.default.createElement(
                            'span',
                            { className: 'input-group-btn' },
                            button
                        )
                    )
                );
            }
        }), Object.defineProperty(_this, 'renderEvent', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;

                switch (_this.state.state) {
                    case 'loading':
                        return _react2.default.createElement(_loading2.default, null);
                    case 'solving-loading':
                    case 'solving':
                        return _this.renderSolving();
                    case 'solved':
                    case 'event':
                        {
                            var ev = _this.state.ev;

                            return _react2.default.createElement(
                                'div',
                                { className: 'event-desc' },
                                _react2.default.createElement(_eventrow2.default, { ev: ev, expand: true, hiddenbuttons: true }),
                                _this.state.clues && _this.state.clues.length ? _react2.default.createElement(
                                    'h2',
                                    null,
                                    t('events::Clues')
                                ) : _react2.default.createElement(
                                    'p',
                                    { className: 'text-center' },
                                    t('events::No Clues yet'),
                                    ',',
                                    _react2.default.createElement(
                                        _reactRouter.Link,
                                        { to: '/map' },
                                        ' ',
                                        _react2.default.createElement('i', { className: 'fa fa-fw fa-map-marker' }),
                                        t('events::go to find someone')
                                    )
                                ),
                                _this.state.clues && _this.state.clues.map(function (clue, i) {
                                    return _react2.default.createElement(_cluerow2.default, { ev: ev, clue: clue });
                                }),
                                _this.renderSolveButton()
                            );
                        }
                }
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Event, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.updateEvents();
            this.retitle();
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'events', className: 'container mbottom' },
                this.renderEvent()
            );
        }
    }]);

    return Event;
}(_react2.default.Component);

exports.default = Event = (0, _reactI18next.translate)(['events', 'common'], { wait: true })(Event);

/***/ }),

/***/ 274:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _auth = __webpack_require__(13);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

var _eventrow = __webpack_require__(98);

var _eventrow2 = _interopRequireDefault(_eventrow);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = function (_React$Component) {
    _inherits(Events, _React$Component);

    function Events() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Events);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Events.__proto__ || Object.getPrototypeOf(Events)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                user: _auth.user,
                events: null,
                loadingMore: false,
                q: null,
                page: 0
            }
        }), Object.defineProperty(_this, 'updateEvents', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this;
                _this.setState({ events: null });
                _api2.default.allEvents(_this.state.q).then(function (events) {
                    self.setState({ events: events });
                });
            }
        }), Object.defineProperty(_this, 'loadMore', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this;
                _this.setState({ loadingMore: true });
                _this.state.page += 1;

                var q = {
                    page: _this.state.page
                };

                if (_this.state.q) $.extend(q, _this.state.q);

                _api2.default.allEvents(q).then(function (events) {
                    self.setState({ events: self.state.events.concat(events) });
                    self.setState({ loadingMore: false });
                });
            }
        }), Object.defineProperty(_this, 'retitle', {
            enumerable: true,
            writable: true,
            value: function value() {
                var title = _this.props.t('events::Events');
                if (_auth.user.activeEvent) {
                    title = title + ' - ' + _auth.user.activeEvent.name;
                }
                _bucket2.default.setAppState({ title: title, active: 'events' });
            }
        }), Object.defineProperty(_this, 'searchChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var q = _this.state.q || {};
                q.q = e.target.value;
                _this.setState({ q: q });
            }
        }), Object.defineProperty(_this, 'filterEvents', {
            enumerable: true,
            writable: true,
            value: function value(v) {
                var q = _this.state.q || {};
                q.filter = v;
                _this.state.q = q;
                _this.updateEvents();
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Events, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.updateEvents();
            this.retitle();
        }
    }, {
        key: 'renderEvents',
        value: function renderEvents() {
            var self = this;
            var t = this.props.t;

            return _react2.default.createElement(
                'div',
                null,
                this.state.events.map(function (ev, i) {
                    return _react2.default.createElement(_eventrow2.default, { ev: ev, key: i, active: self.state.active });
                }),
                this.state.events.length ? _react2.default.createElement('span', null) : _react2.default.createElement(
                    'div',
                    { className: 'jumbotron' },
                    t("events::There's no events :(")
                ),
                this.state.loadingMore ? _react2.default.createElement(
                    'button',
                    { className: 'btn btn-block btn-primary btn-disabled' },
                    ' ',
                    _react2.default.createElement('i', { className: 'fa fa-cog fa-spin fa-fw' }),
                    ' '
                ) : _react2.default.createElement(
                    'button',
                    { className: 'btn btn-block btn-primary', onClick: this.loadMore },
                    t('events::Load More')
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this.props.t;

            return _react2.default.createElement(
                'div',
                { id: 'events', className: 'container-fluid container-fw' },
                _react2.default.createElement(
                    'div',
                    { className: 'search input-group' },
                    _react2.default.createElement('input', { className: 'form-control search', id: 'search', placeholder: t('events::search'), onChange: this.searchChange }),
                    _react2.default.createElement(
                        'div',
                        { className: 'input-group-btn' },
                        _react2.default.createElement(
                            'button',
                            { type: 'button', onClick: this.updateEvents, className: 'btn btn-success' },
                            _react2.default.createElement('i', { className: 'fa fa-sw fa-search' })
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'filters' },
                    _react2.default.createElement(
                        'div',
                        { className: 'btn-group btn-group-justified', 'data-toggle': 'buttons' },
                        _react2.default.createElement(
                            'label',
                            { className: 'btn btn-default active', onClick: this.filterEvents.bind(this, 'all') },
                            _react2.default.createElement('input', { type: 'radio', name: 'options', autocomplete: 'off', checked: true }),
                            ' ',
                            t('events::All')
                        ),
                        _react2.default.createElement(
                            'label',
                            { className: 'btn btn-default', onClick: this.filterEvents.bind(this, 'mine') },
                            _react2.default.createElement('input', { type: 'radio', name: 'options', autocomplete: 'off' }),
                            ' ',
                            t('events::Mine')
                        ),
                        _react2.default.createElement(
                            'label',
                            { className: 'btn btn-default', onClick: this.filterEvents.bind(this, 'admin') },
                            _react2.default.createElement('input', { type: 'radio', name: 'options', autocomplete: 'off' }),
                            ' ',
                            t('events::Admin')
                        )
                    )
                ),
                this.state.events ? this.renderEvents() : _react2.default.createElement(_loading2.default, null)
            );
        }
    }]);

    return Events;
}(_react2.default.Component);

exports.default = Events = (0, _reactI18next.translate)(['events'], { wait: true })(Events);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),

/***/ 275:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GEO = function () {
    function GEO() {
        _classCallCheck(this, GEO);
    }

    _createClass(GEO, null, [{
        key: 'start',
        value: function start() {
            if (this.watchID == null) {
                this.watchID = navigator.geolocation.watchPosition(this.success.bind(this), this.error.bind(this), this.options);
            }

            navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error.bind(this), this.options);

            this.status = 'started';
        }
    }, {
        key: 'success',
        value: function success(p) {
            if (this.successCB) this.successCB(p);
        }
    }, {
        key: 'error',
        value: function error(e) {
            if (this.errorCB) this.errorCB(e);
        }
    }, {
        key: 'stop',
        value: function stop(pause) {
            if (this.watchID != null) {
                navigator.geolocation.clearWatch(this.watchID);
                this.watchID = null;
            }

            if (!pause) {
                this.status = 'stopped';
            } else {
                this.status = 'paused';
            }
        }
    }]);

    return GEO;
}();

Object.defineProperty(GEO, 'watchID', {
    enumerable: true,
    writable: true,
    value: null
});
Object.defineProperty(GEO, 'options', {
    enumerable: true,
    writable: true,
    value: { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true }
});
Object.defineProperty(GEO, 'status', {
    enumerable: true,
    writable: true,
    value: 'stopped'
});
Object.defineProperty(GEO, 'successCB', {
    enumerable: true,
    writable: true,
    value: null
});
Object.defineProperty(GEO, 'errorCB', {
    enumerable: true,
    writable: true,
    value: null
});
exports.default = GEO;
;

document.addEventListener("pause", function () {
    GEO.stop.bind(GEO)(true);
}, false);

document.addEventListener("resume", function () {
    if (GEO.status == 'paused') {
        GEO.start.bind(GEO)();
    }
}, false);

/***/ }),

/***/ 276:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(60);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = __webpack_require__(49);

var _reactI18next = __webpack_require__(12);

var _app = __webpack_require__(265);

var _app2 = _interopRequireDefault(_app);

var _login = __webpack_require__(266);

var _login2 = _interopRequireDefault(_login);

var _register = __webpack_require__(267);

var _register2 = _interopRequireDefault(_register);

var _i18n = __webpack_require__(94);

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// main.js
_reactDom2.default.render(_react2.default.createElement(
  _reactI18next.I18nextProvider,
  { i18n: _i18n2.default },
  _react2.default.createElement(
    _reactRouterDom.HashRouter,
    null,
    _react2.default.createElement(
      _reactRouterDom.Switch,
      null,
      _react2.default.createElement(_reactRouterDom.Route, { path: '/login', component: _login2.default }),
      _react2.default.createElement(_reactRouterDom.Route, { path: '/register', component: _register2.default }),
      _react2.default.createElement(_app2.default, null)
    )
  )
), document.getElementById('content'));

/***/ }),

/***/ 277:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _openlayers = __webpack_require__(96);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _auth = __webpack_require__(13);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _geo = __webpack_require__(275);

var _geo2 = _interopRequireDefault(_geo);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    function Map() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Map);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Map.__proto__ || Object.getPrototypeOf(Map)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                user: _auth.user,
                state: 'stopped',
                eventMenu: false,
                events: []
            }
        }), Object.defineProperty(_this, 'firstCentre', {
            enumerable: true,
            writable: true,
            value: false
        }), Object.defineProperty(_this, 'centre', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.map.getView().animate({
                    center: _bucket2.default.lastPost,
                    duration: 1000
                });
            }
        }), Object.defineProperty(_this, 'playersUpdated', {
            enumerable: true,
            writable: true,
            value: function value(data) {
                var self = _this;
                var fs = _this.playerList.getFeatures();

                var noremove = {};

                data.forEach(function (p) {
                    noremove[p.pk] = true;
                    var playerFeature = null;

                    var i = 0;
                    while (i < fs.length) {
                        var f = fs[i];
                        if (f.customData.id == p.pk) {
                            playerFeature = f;
                            break;
                        }
                        i++;
                    }

                    if (playerFeature == null) {
                        // adding not found features
                        playerFeature = new _openlayers2.default.Feature();
                        playerFeature.setStyle(new _openlayers2.default.style.Style({
                            image: self.getIcon(p),
                            zIndex: 100
                        }));
                        self.playerList.addFeature(playerFeature);
                    }

                    // moving the features
                    var coords = [parseFloat(p.pos.longitude), parseFloat(p.pos.latitude)];
                    var point = new _openlayers2.default.proj.transform([coords[0], coords[1]], 'EPSG:4326', 'EPSG:3857');
                    playerFeature.customData = { id: p.pk, coords: point, name: p.username };
                    playerFeature.setGeometry(new _openlayers2.default.geom.Point(_openlayers2.default.proj.fromLonLat(coords)));
                });

                // removing removed featured
                var i = 0;
                var l = fs.length;
                while (i < l) {
                    var f = fs[i];
                    if (noremove[f.customData.id]) {
                        i++;
                        continue;
                    }

                    _this.playerList.removeFeature(f);
                    l--;
                }
            }
        }), Object.defineProperty(_this, 'setUpdateTimer', {
            enumerable: true,
            writable: true,
            value: function value(timeout) {
                if (_this.state.state == 'started') {
                    clearTimeout(_this.updateTimer);
                    _this.updateTimer = setTimeout(_this.updatePlayers.bind(_this), timeout);
                }
            }
        }), Object.defineProperty(_this, 'updatePlayers', {
            enumerable: true,
            writable: true,
            value: function value() {
                var ev = _auth.user.activeEvent ? _auth.user.activeEvent.pk : _auth.user.activeEvent;
                var self = _this;

                _api2.default.nearPlayers(ev).then(function (data) {
                    self.playersUpdated(data);
                    self.setUpdateTimer(2000);
                }).catch(function () {
                    self.setUpdateTimer(5000);
                });
            }
        }), Object.defineProperty(_this, 'startState', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.start();
            }
        }), Object.defineProperty(_this, 'start', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.firstCentre = true;
                _this.setState({ state: 'started' });
            }
        }), Object.defineProperty(_this, 'stop', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ state: 'stopped' });
                _geo2.default.stop();
                _this.unplay();
            }
        }), Object.defineProperty(_this, 'toggleEventMenu', {
            enumerable: true,
            writable: true,
            value: function value() {
                if (_this.state.eventMenu) {
                    _this.setState({ eventMenu: false });
                } else {
                    _this.updateEvents();
                    _this.setState({ eventMenu: true });
                }
            }
        }), Object.defineProperty(_this, 'retitle', {
            enumerable: true,
            writable: true,
            value: function value() {
                var title = _this.props.t('map::Map');
                if (_auth.user.activeEvent) {
                    title = title + ' - ' + _auth.user.activeEvent.name;
                }
                _bucket2.default.setAppState({ title: title, active: 'map' });
            }
        }), Object.defineProperty(_this, 'play', {
            enumerable: true,
            writable: true,
            value: function value(e, ev) {
                var t = _this.props.t;

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var self = _this;
                _api2.default.setPlayingEvent(ev.pk).then(function () {
                    _auth.user.activeEvent = ev;
                    (0, _auth.storeUser)();
                    self.setState({ active: _auth.user.activeEvent });
                    self.retitle();
                    self.start();
                    self.toggleEventMenu();
                }).catch(function () {
                    alert(t("map::Error joining the game"));
                });
            }
        }), Object.defineProperty(_this, 'unplay', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var t = _this.props.t;

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var self = _this;
                _api2.default.setPlayingEvent(null).then(function () {
                    _auth.user.activeEvent = null;
                    (0, _auth.storeUser)();
                    self.setState({ active: _auth.user.activeEvent });
                    self.retitle();
                }).catch(function () {
                    alert(t("map::Error leaving the game"));
                });
            }
        }), Object.defineProperty(_this, 'playGlobal', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var t = _this.props.t;

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var self = _this;
                _api2.default.setPlayingEvent(null).then(function () {
                    _auth.user.activeEvent = null;
                    (0, _auth.storeUser)();
                    self.setState({ active: _auth.user.activeEvent });
                    self.retitle();
                    self.start();
                    self.toggleEventMenu();
                }).catch(function () {
                    alert(t("map::Error starting the game"));
                });
            }
        }), Object.defineProperty(_this, 'renderEventMenu', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;

                var self = _this;
                if (_this.state.eventMenu) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'eventMenu' },
                        _react2.default.createElement(
                            'div',
                            { className: 'ev', onClick: function onClick(e) {
                                    return self.playGlobal(e);
                                } },
                            t('map::Global event')
                        ),
                        _this.state.events.map(function (ev, i) {
                            return _react2.default.createElement(
                                'div',
                                { className: 'ev', onClick: function onClick(e) {
                                        return self.play(e, ev);
                                    } },
                                ' ',
                                ev.name,
                                ' '
                            );
                        })
                    );
                } else {
                    return _react2.default.createElement(
                        'button',
                        { className: 'btn btn-fixed-bottom btn-success', onClick: _this.toggleEventMenu },
                        t('map::Start')
                    );
                }
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Map, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.retitle();
            window.addEventListener("resize", this.updateDimensions.bind(this));

            if (this.props.match.params.ev) {
                var self = this;
                self.toggleEventMenu();
                _api2.default.EventDetail(self.props.match.params.ev).then(function (ev) {
                    self.play(null, ev);
                });
            }

            if (_geo2.default.status == 'started') {
                this.start();
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var svq = _openlayers2.default.proj.fromLonLat([-5.9866369, 37.3580539]);
            var c = _bucket2.default.lastPost ? _bucket2.default.lastPost : svq;
            this.view = new _openlayers2.default.View({
                center: c,
                zoom: 12
            });

            if (this.map) {
                this.map.setTarget(null);
            }

            this.map = new _openlayers2.default.Map({
                target: 'socializa-map',
                layers: [new _openlayers2.default.layer.Tile({
                    source: new _openlayers2.default.source.OSM()
                })],
                view: this.view
            });

            this.startGeolocation();
            this.updateDimensions();
        }
    }, {
        key: 'updateDimensions',
        value: function updateDimensions() {
            $('canvas').height($(window).height() - 120);
            this.map.updateSize();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearTimeout(this.updateTimer);

            window.removeEventListener("resize", this.updateDimensions.bind(this));
        }
    }, {
        key: 'updateEvents',
        value: function updateEvents() {
            var self = this;
            _api2.default.allEvents({ filter: 'mine' }).then(function (events) {
                self.setState({ events: events });
            });
        }
    }, {
        key: 'onPosSuccess',
        value: function onPosSuccess(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var coords = [parseFloat(lon), parseFloat(lat)];

            _api2.default.setPos(lat, lon);

            var coordinates = new _openlayers2.default.geom.Point(_openlayers2.default.proj.fromLonLat(coords));
            var center = _openlayers2.default.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
            _bucket2.default.lastPost = center;

            if (this.firstCentre) {
                this.centre();
                this.firstCentre = false;
            }
            this.positionFeature.setGeometry(coordinates);

            var vd = _auth.user.activeEvent ? _auth.user.activeEvent.vision_distance : 0;
            var md = _auth.user.activeEvent ? _auth.user.activeEvent.meeting_distance : 0;
            var circle = new _openlayers2.default.geom.Circle(center, vd);
            this.visionFeature.setGeometry(circle);
            circle = new _openlayers2.default.geom.Circle(center, md);
            this.meetingFeature.setGeometry(circle);
        }
    }, {
        key: 'onPosError',
        value: function onPosError(error) {}
    }, {
        key: 'startGeolocation',
        value: function startGeolocation() {
            var map = this.map;
            var self = this;

            this.positionFeature = new _openlayers2.default.Feature();
            this.positionFeature.setStyle(new _openlayers2.default.style.Style({
                image: new _openlayers2.default.style.Icon({ src: 'app/images/geo1.svg' }),
                zIndex: 10
            }));
            this.positionFeature.customData = { name: 'me' };

            this.visionFeature = new _openlayers2.default.Feature();
            this.meetingFeature = new _openlayers2.default.Feature();

            // vision layer
            new _openlayers2.default.layer.Vector({
                map: map,

                source: new _openlayers2.default.source.Vector({
                    features: [this.visionFeature]
                }),

                style: new _openlayers2.default.style.Style({
                    fill: new _openlayers2.default.style.Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
                    stroke: new _openlayers2.default.style.Stroke({ width: 1, color: '#286090' })
                })

            });

            // meeting distance layer
            new _openlayers2.default.layer.Vector({
                map: map,

                source: new _openlayers2.default.source.Vector({
                    features: [this.meetingFeature]
                }),

                style: new _openlayers2.default.style.Style({
                    fill: new _openlayers2.default.style.Fill({ color: 'rgba(92, 184, 92, 0.1)' }),
                    stroke: new _openlayers2.default.style.Stroke({ width: 0.5, color: '#5cb85c' })
                })
            });

            // my position layer
            new _openlayers2.default.layer.Vector({
                map: map,

                source: new _openlayers2.default.source.Vector({
                    features: [this.positionFeature]
                })
            });

            this.playerList = new _openlayers2.default.source.Vector();

            var playersLayer = new _openlayers2.default.layer.Vector({
                map: map,
                source: this.playerList
            });

            // starting tracking
            if (this.state.state == 'started') {
                _geo2.default.successCB = this.onPosSuccess.bind(this);
                _geo2.default.errorCB = this.onPosError.bind(this);
                _geo2.default.start();

                this.view.setZoom(18);
                this.setUpdateTimer(500);
            }

            var select = new _openlayers2.default.interaction.Select({
                filter: function filter(f, l) {
                    if (f == self.visionFeature) {
                        return false;
                    }
                    if (f == self.meetingFeature) {
                        return false;
                    }
                    if (f == self.positionFeature) {
                        return false;
                    }
                    return true;
                }
            });
            map.addInteraction(select);
            select.on('select', function (e) {
                var f = e.target.getFeatures();

                if (f.getLength()) {
                    var i = 0;
                    var feature = f.getArray()[i];
                    self.props.history.push('/connect/' + feature.customData.id);
                }
            });
        }
    }, {
        key: 'getIcon',
        value: function getIcon(p) {
            return new _openlayers2.default.style.Icon({ src: (0, _auth.getIcon)(p) });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var t = this.props.t;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('div', { id: 'socializa-map' }),
                _react2.default.createElement(
                    'div',
                    { id: 'center-button', onClick: this.centre, className: 'btn btn-circle btn-primary' },
                    _react2.default.createElement('i', { className: 'fa fa-street-view' })
                ),
                function () {
                    switch (_this2.state.state) {
                        case 'started':
                            return _react2.default.createElement(
                                'button',
                                { className: 'btn btn-fixed-bottom btn-danger', onClick: _this2.stop },
                                t('map::Stop')
                            );
                        default:
                            return _this2.renderEventMenu();
                    }
                }()
            );
        }
    }]);

    return Map;
}(_react2.default.Component);

exports.default = Map = (0, _reactI18next.translate)(['map'], { wait: true })((0, _reactRouter.withRouter)(Map));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),

/***/ 278:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _reactRouterDom = __webpack_require__(49);

var _auth = __webpack_require__(13);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NavBar = function (_React$Component) {
    _inherits(NavBar, _React$Component);

    function NavBar() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, NavBar);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = NavBar.__proto__ || Object.getPrototypeOf(NavBar)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: { user: _auth.user, open: false }
        }), Object.defineProperty(_this, 'logout', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                (0, _auth.logout)();
                _this.props.history.push('/login');
            }
        }), Object.defineProperty(_this, 'openmenu', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                _this.setState({ open: !_this.state.open });
            }
        }), Object.defineProperty(_this, 'activeEvent', {
            enumerable: true,
            writable: true,
            value: function value() {
                var act = _this.props.active;
                if (!_auth.user.activeEvent) {
                    return _react2.default.createElement('span', null);
                }
                var ev = _auth.user.activeEvent;
                var link = "/event/" + ev.pk;
                return _react2.default.createElement(
                    'li',
                    { className: act == 'event' ? "active" : "" },
                    _react2.default.createElement(
                        _reactRouterDom.Link,
                        { to: link },
                        _react2.default.createElement('i', { className: 'fa fa-fw fa-dot-circle-o' }),
                        ' ',
                        ev.name
                    )
                );
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(NavBar, [{
        key: 'render',
        value: function render() {
            var t = this.props.t;

            var act = this.props.active;
            return _react2.default.createElement(
                'div',
                { id: 'main-menu' },
                _react2.default.createElement(
                    'div',
                    { id: 'menu-bar' },
                    _react2.default.createElement(
                        'div',
                        { id: 'menu-button', onClick: this.openmenu },
                        this.state.open ? _react2.default.createElement('i', { className: 'fa fa-fw fa-close' }) : _react2.default.createElement('i', { className: 'fa fa-fw fa-bars' })
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'socializa-title' },
                        this.props.title
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { id: 'menu', onClick: this.openmenu, className: this.state.open ? "open" : "" },
                    _react2.default.createElement(
                        'ul',
                        null,
                        this.activeEvent(),
                        _react2.default.createElement(
                            'li',
                            { className: act == 'map' ? "active" : "" },
                            _react2.default.createElement(
                                _reactRouterDom.Link,
                                { to: '/map' },
                                ' ',
                                _react2.default.createElement('i', { className: 'fa fa-fw fa-map-marker' }),
                                ' ',
                                t('navbar::map')
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: act == 'events' ? "active" : "" },
                            _react2.default.createElement(
                                _reactRouterDom.Link,
                                { to: '/events' },
                                ' ',
                                _react2.default.createElement('i', { className: 'fa fa-fw fa-gamepad' }),
                                ' ',
                                t('navbar::events')
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: act == 'profile' ? "active" : "" },
                            _react2.default.createElement(
                                _reactRouterDom.Link,
                                { to: '/profile' },
                                ' ',
                                _react2.default.createElement('i', { className: 'fa fa-fw fa-user' }),
                                t('navbar::profile'),
                                ' / ',
                                _auth.user.username
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { onClick: this.logout },
                                ' ',
                                _react2.default.createElement('i', { className: 'fa fa-fw fa-close' }),
                                ' ',
                                t('navbar::Logout')
                            )
                        )
                    )
                )
            );
        }
    }]);

    return NavBar;
}(_react2.default.Component);

exports.default = NavBar = (0, _reactI18next.translate)(['navbar'], { wait: true })((0, _reactRouter.withRouter)(NavBar));

/***/ }),

/***/ 279:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _auth = __webpack_require__(13);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Profile = function (_React$Component) {
    _inherits(Profile, _React$Component);

    function Profile() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Profile);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Profile.__proto__ || Object.getPrototypeOf(Profile)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: { user: _auth.user, player: null }
        }), Object.defineProperty(_this, 'updateProfile', {
            enumerable: true,
            writable: true,
            value: function value() {
                var self = _this;
                _api2.default.getProfile().then(function (player) {
                    self.setState({ player: player });
                });
            }
        }), Object.defineProperty(_this, 'save', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var p = _this.state.player;
                var self = _this;
                _api2.default.setProfile(p).then(function () {
                    self.props.history.push('/map');
                });

                (0, _auth.setUser)(_this.state.user);
                // this show loading
                _this.setState({ player: null });
            }
        }), Object.defineProperty(_this, 'aboutChange', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var p = _this.state.player;
                p.about = e.target.value;
                _this.setState({ player: p });
            }
        }), Object.defineProperty(_this, 'addInterest', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var p = _this.state.player;
                if (p.interests == undefined) {
                    p.interests = [];
                }

                var v = document.querySelector('#interest');

                p.interests.push(v.value);
                v.value = '';
                _this.setState({ player: p });
            }
        }), Object.defineProperty(_this, 'removeInterest', {
            enumerable: true,
            writable: true,
            value: function value(i, e) {
                var p = _this.state.player;
                p.interests.splice(i, 1);
                _this.setState({ player: p });
            }
        }), Object.defineProperty(_this, 'changePassword', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                var t = _this.props.t;

                var current = document.querySelector('#current').value;
                var newp = document.querySelector('#new').value;
                var repeat = document.querySelector('#repeat').value;

                // TODO, change the password
                if (newp != repeat) {
                    alert(t("profile::Password doesn't match, try again"));
                    return;
                }

                alert(t("profile::Done!"));
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Profile, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _bucket2.default.setAppState({ title: this.props.t('profile::Profile'), active: 'profile' });
            this.updateProfile();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var t = this.props.t;

            if (!this.state.player) {
                return _react2.default.createElement(_loading2.default, null);
            }

            return _react2.default.createElement(
                'div',
                { id: 'profile', className: 'container mbottom' },
                _react2.default.createElement(
                    'h2',
                    null,
                    _auth.user.username
                ),
                _react2.default.createElement(
                    'h3',
                    null,
                    t('profile::About you')
                ),
                _react2.default.createElement('textarea', { className: 'form-control', placeholder: t('profile::about you'), onChange: this.aboutChange, value: this.state.player.about }),
                _react2.default.createElement(
                    'h3',
                    null,
                    t('profile::Interests')
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement('input', { type: 'text', id: 'interest', className: 'form-control', placeholder: t('profile::interests') }),
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-btn' },
                        _react2.default.createElement(
                            'button',
                            { className: 'btn btn-success', type: 'button', onClick: this.addInterest },
                            _react2.default.createElement('i', { className: 'fa fa-plus', 'aria-hidden': 'true' })
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { id: 'interests' },
                    this.state.player.interests.map(function (obj, i) {
                        return _react2.default.createElement(
                            'span',
                            { key: obj, className: 'label label-danger' },
                            obj,
                            _react2.default.createElement('i', { className: 'fa fa-times', onClick: _this2.removeInterest.bind(_this2, i) })
                        );
                    }),
                    _react2.default.createElement('div', { className: 'clearfix' })
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'a',
                    { className: 'btn btn-primary btn-block', role: 'button', 'data-toggle': 'collapse', href: '#passwordChange',
                        'aria-expanded': 'false', 'aria-controls': 'passwordChange' },
                    _react2.default.createElement('i', { className: 'fa fa-lock' }),
                    ' ',
                    t('profile::Change password')
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'collapse', id: 'passwordChange' },
                    _react2.default.createElement(
                        'div',
                        { className: 'well' },
                        _react2.default.createElement('input', { type: 'password', id: 'current', className: 'form-control', placeholder: t('profile::current') }),
                        _react2.default.createElement('input', { type: 'password', id: 'new', className: 'form-control', placeholder: t('profile::new') }),
                        _react2.default.createElement('input', { type: 'password', id: 'repeat', className: 'form-control', placeholder: t('profile::repeat') })
                    ),
                    _react2.default.createElement(
                        'button',
                        { className: 'btn btn-danger btn-block', onClick: this.changePassword },
                        t('profile::Change')
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'button',
                    { className: 'btn btn-fixed-bottom btn-success', onClick: this.save },
                    t('profile::Save')
                )
            );
        }
    }]);

    return Profile;
}(_react2.default.Component);

exports.default = Profile = (0, _reactI18next.translate)(['profile'], { wait: true })((0, _reactRouter.withRouter)(Profile));

/***/ }),

/***/ 280:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _auth = __webpack_require__(13);

var _connect = __webpack_require__(61);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var QRCapt = function (_React$Component) {
    _inherits(QRCapt, _React$Component);

    function QRCapt() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, QRCapt);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = QRCapt.__proto__ || Object.getPrototypeOf(QRCapt)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'capturedQR', {
            enumerable: true,
            writable: true,
            value: function value(id, ev, resp) {
                var t = _this.props.t;

                var self = _this;
                _api2.default.captured(id, ev, resp.text).then(function (resp) {
                    (0, _connect.connected)(resp.clue);
                }).catch(function (error) {
                    alert(t("qr::Invalid code!"));
                });
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(QRCapt, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var self = this;
            var id = this.props.match.params.user;
            var ev = this.props.match.params.ev;

            window.scanQR(function (resp) {
                self.capturedQR.bind(self)(id, ev, resp);
            }, function (err) {});

            $("#overlay .close").click(function () {
                self.props.history.push('/map');
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', { id: 'qrcapt', className: 'container' });
        }
    }]);

    return QRCapt;
}(_react2.default.Component);

exports.default = QRCapt = (0, _reactI18next.translate)(['qr'], { wait: true })((0, _reactRouter.withRouter)(QRCapt));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),

/***/ 281:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _qrcode = __webpack_require__(97);

var _qrcode2 = _interopRequireDefault(_qrcode);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _auth = __webpack_require__(13);

var _connect = __webpack_require__(61);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var QRView = function (_React$Component) {
    _inherits(QRView, _React$Component);

    function QRView() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, QRView);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = QRView.__proto__ || Object.getPrototypeOf(QRView)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'qrcodeTimer', {
            enumerable: true,
            writable: true,
            value: null
        }), Object.defineProperty(_this, 'qrcodePolling', {
            enumerable: true,
            writable: true,
            value: function value(id, ev) {
                var t = _this.props.t;

                var self = _this;

                _api2.default.qrclue(id, ev).then(function (resp) {
                    if (resp.status == 'waiting') {
                        clearTimeout(self.qrcodeTimer);
                        self.qrcodeTimer = setTimeout(function () {
                            self.qrcodePolling.bind(self)(id, ev);
                        }, 1000);
                    } else if (resp.status == 'contected') {
                        (0, _connect.connected)(resp.clue);
                    }
                }).catch(function (err) {
                    alert(t("qr::error polling!"));
                });
            }
        }), Object.defineProperty(_this, 'goBack', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.props.history.push('/map');
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(QRView, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var self = this;
            clearTimeout(this.qrcodeTimer);
            this.qrcodeTimer = setTimeout(function () {
                self.qrcodePolling.bind(self)(self.props.match.params.user, self.props.match.params.ev);
            }, 500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearTimeout(this.qrcodeTimer);
        }
    }, {
        key: 'render',
        value: function render() {
            var qrsize = $(document).width() - 80;

            return _react2.default.createElement(
                'div',
                { id: 'qrcode' },
                _react2.default.createElement(_qrcode2.default, { value: this.props.match.params.secret, size: qrsize }),
                _react2.default.createElement(
                    'div',
                    { className: 'closebtn', onClick: this.goBack },
                    _react2.default.createElement('i', { className: 'fa fa-close' })
                )
            );
        }
    }]);

    return QRView;
}(_react2.default.Component);

exports.default = QRView = (0, _reactI18next.translate)(['qr'], { wait: true })((0, _reactRouter.withRouter)(QRView));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),

/***/ 309:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.0
 */

(function (global, factory) {
     true ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = __webpack_require__(519);
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
      GET_THEN_ERROR.error = null;
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));
//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(15)))

/***/ }),

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Loading = function (_React$Component) {
    _inherits(Loading, _React$Component);

    function Loading() {
        _classCallCheck(this, Loading);

        return _possibleConstructorReturn(this, (Loading.__proto__ || Object.getPrototypeOf(Loading)).apply(this, arguments));
    }

    _createClass(Loading, [{
        key: 'render',
        value: function render() {
            var t = this.props.t;

            return _react2.default.createElement(
                'div',
                { className: 'loadingIcon' },
                _react2.default.createElement('i', { className: 'fa fa-cog fa-spin fa-3x fa-fw' }),
                _react2.default.createElement(
                    'span',
                    { className: 'sr-only' },
                    t('common::Loading...')
                )
            );
        }
    }]);

    return Loading;
}(_react2.default.Component);

exports.default = Loading = (0, _reactI18next.translate)(['common'], { wait: true })(Loading);

/***/ }),

/***/ 325:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(30);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(50);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(65);

var _PathUtils = __webpack_require__(39);

var _createTransitionManager = __webpack_require__(66);

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = __webpack_require__(102);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Browser history needs a DOM');

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$forceRefresh = props.forceRefresh,
      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
      _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;


    var path = pathname + search + hash;

    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);

    return _extends({}, (0, _PathUtils.parsePath)(path), {
      state: state,
      key: key
    });
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var handlePopState = function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;

    handlePop(getDOMLocation(event.state));
  };

  var handleHashChange = function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  };

  var forceNextPop = false;

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allKeys.indexOf(fromLocation.key);

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key];

  // Public interface

  var createHref = function createHref(location) {
    return basename + (0, _PathUtils.createPath)(location);
  };

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');

        window.location.href = href;
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');

        window.location.replace(href);
      }
    });
  };

  var go = function go(n) {
    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createBrowserHistory;

/***/ }),

/***/ 326:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(30);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(50);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(65);

var _PathUtils = __webpack_require__(39);

var _createTransitionManager = __webpack_require__(66);

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = __webpack_require__(102);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HashChangeEvent = 'hashchange';

var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + (0, _PathUtils.stripLeadingSlash)(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: _PathUtils.stripLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  },
  slash: {
    encodePath: _PathUtils.addLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  }
};

var getHashPath = function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};

var pushHashPath = function pushHashPath(path) {
  return window.location.hash = path;
};

var replaceHashPath = function replaceHashPath(path) {
  var hashIndex = window.location.href.indexOf('#');

  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};

var createHashHistory = function createHashHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Hash history needs a DOM');

  var globalHistory = window.history;
  var canGoWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();

  var _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$hashType = props.hashType,
      hashType = _props$hashType === undefined ? 'slash' : _props$hashType;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;


  var getDOMLocation = function getDOMLocation() {
    var path = decodePath(getHashPath());

    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);

    return (0, _PathUtils.parsePath)(path);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var forceNextPop = false;
  var ignorePath = null;

  var handleHashChange = function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;

      if (!forceNextPop && (0, _LocationUtils.locationsAreEqual)(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === (0, _PathUtils.createPath)(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;

      handlePop(location);
    }
  };

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(toLocation));

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(fromLocation));

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  // Ensure the hash is encoded properly before doing anything else.
  var path = getHashPath();
  var encodedPath = encodePath(path);

  if (path !== encodedPath) replaceHashPath(encodedPath);

  var initialLocation = getDOMLocation();
  var allPaths = [(0, _PathUtils.createPath)(initialLocation)];

  // Public interface

  var createHref = function createHref(location) {
    return '#' + encodePath(basename + (0, _PathUtils.createPath)(location));
  };

  var push = function push(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot push state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);

        var prevIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(history.location));
        var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

        nextPaths.push(path);
        allPaths = nextPaths;

        setState({ action: action, location: location });
      } else {
        (0, _warning2.default)(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');

        setState();
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot replace state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf((0, _PathUtils.createPath)(history.location));

      if (prevIndex !== -1) allPaths[prevIndex] = path;

      setState({ action: action, location: location });
    });
  };

  var go = function go(n) {
    (0, _warning2.default)(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');

    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createHashHistory;

/***/ }),

/***/ 328:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    arguments: true,
    arity: true
};

var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {

                }
            }
        }
    }

    return targetComponent;
};


/***/ }),

/***/ 332:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var cookie = {
  create: function create(name, value, minutes, domain) {
    var expires = void 0;
    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + minutes * 60 * 1000);
      expires = '; expires=' + date.toGMTString();
    } else expires = '';
    domain = domain ? 'domain=' + domain + ';' : '';
    document.cookie = name + '=' + value + expires + ';' + domain + 'path=/';
  },

  read: function read(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove: function remove(name) {
    this.create(name, '', -1);
  }
};

exports.default = {
  name: 'cookie',

  lookup: function lookup(options) {
    var found = void 0;

    if (options.lookupCookie && typeof document !== 'undefined') {
      var c = cookie.read(options.lookupCookie);
      if (c) found = c;
    }

    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(lng, options) {
    if (options.lookupCookie && typeof document !== 'undefined') {
      cookie.create(options.lookupCookie, lng, options.cookieMinutes, options.cookieDomain);
    }
  }
};

/***/ }),

/***/ 333:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'htmlTag',

  lookup: function lookup(options) {
    var found = void 0;
    var htmlTag = options.htmlTag || (typeof document !== 'undefined' ? document.documentElement : null);

    if (htmlTag && typeof htmlTag.getAttribute === 'function') {
      found = htmlTag.getAttribute('lang');
    }

    return found;
  }
};

/***/ }),

/***/ 334:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var hasLocalStorageSupport = void 0;
try {
  hasLocalStorageSupport = window !== 'undefined' && window.localStorage !== null;
  var testKey = 'i18next.translate.boo';
  window.localStorage.setItem(testKey, 'foo');
  window.localStorage.removeItem(testKey);
} catch (e) {
  hasLocalStorageSupport = false;
}

exports.default = {
  name: 'localStorage',

  lookup: function lookup(options) {
    var found = void 0;

    if (options.lookupLocalStorage && hasLocalStorageSupport) {
      var lng = window.localStorage.getItem(options.lookupLocalStorage);
      if (lng) found = lng;
    }

    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(lng, options) {
    if (options.lookupLocalStorage && hasLocalStorageSupport) {
      window.localStorage.setItem(options.lookupLocalStorage, lng);
    }
  }
};

/***/ }),

/***/ 335:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'navigator',

  lookup: function lookup(options) {
    var found = [];

    if (typeof navigator !== 'undefined') {
      if (navigator.languages) {
        // chrome only; not an array, so can't use .push.apply instead of iterating
        for (var i = 0; i < navigator.languages.length; i++) {
          found.push(navigator.languages[i]);
        }
      }
      if (navigator.userLanguage) {
        found.push(navigator.userLanguage);
      }
      if (navigator.language) {
        found.push(navigator.language);
      }
    }

    return found.length > 0 ? found : undefined;
  }
};

/***/ }),

/***/ 336:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'querystring',

  lookup: function lookup(options) {
    var found = void 0;

    if (typeof window !== 'undefined') {
      var query = window.location.search.substring(1);
      var params = query.split('&');
      for (var i = 0; i < params.length; i++) {
        var pos = params[i].indexOf('=');
        if (pos > 0) {
          var key = params[i].substring(0, pos);
          if (key === options.lookupQuerystring) {
            found = params[i].substring(pos + 1);
          }
        }
      }
    }

    return found;
  }
};

/***/ }),

/***/ 337:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(338);

var utils = _interopRequireWildcard(_utils);

var _cookie = __webpack_require__(332);

var _cookie2 = _interopRequireDefault(_cookie);

var _querystring = __webpack_require__(336);

var _querystring2 = _interopRequireDefault(_querystring);

var _localStorage = __webpack_require__(334);

var _localStorage2 = _interopRequireDefault(_localStorage);

var _navigator = __webpack_require__(335);

var _navigator2 = _interopRequireDefault(_navigator);

var _htmlTag = __webpack_require__(333);

var _htmlTag2 = _interopRequireDefault(_htmlTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults() {
  return {
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',

    // cache user language
    caches: ['localStorage']
    //cookieMinutes: 10,
    //cookieDomain: 'myDomain'
  };
}

var Browser = function () {
  function Browser(services) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Browser);

    this.type = 'languageDetector';
    this.detectors = {};

    this.init(services, options);
  }

  _createClass(Browser, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var i18nOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      this.services = services;
      this.options = utils.defaults(options, this.options || {}, getDefaults());
      this.i18nOptions = i18nOptions;

      this.addDetector(_cookie2.default);
      this.addDetector(_querystring2.default);
      this.addDetector(_localStorage2.default);
      this.addDetector(_navigator2.default);
      this.addDetector(_htmlTag2.default);
    }
  }, {
    key: 'addDetector',
    value: function addDetector(detector) {
      this.detectors[detector.name] = detector;
    }
  }, {
    key: 'detect',
    value: function detect(detectionOrder) {
      var _this = this;

      if (!detectionOrder) detectionOrder = this.options.order;

      var detected = [];
      detectionOrder.forEach(function (detectorName) {
        if (_this.detectors[detectorName]) {
          var lookup = _this.detectors[detectorName].lookup(_this.options);
          if (lookup && typeof lookup === 'string') lookup = [lookup];
          if (lookup) detected = detected.concat(lookup);
        }
      });

      var found = void 0;
      detected.forEach(function (lng) {
        if (found) return;
        var cleanedLng = _this.services.languageUtils.formatLanguageCode(lng);
        if (_this.services.languageUtils.isWhitelisted(cleanedLng)) found = cleanedLng;
      });

      return found || this.i18nOptions.fallbackLng[0];
    }
  }, {
    key: 'cacheUserLanguage',
    value: function cacheUserLanguage(lng, caches) {
      var _this2 = this;

      if (!caches) caches = this.options.caches;
      if (!caches) return;
      caches.forEach(function (cacheName) {
        if (_this2.detectors[cacheName]) _this2.detectors[cacheName].cacheUserLanguage(lng, _this2.options);
      });
    }
  }]);

  return Browser;
}();

Browser.type = 'languageDetector';

exports.default = Browser;

/***/ }),

/***/ 338:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = defaults;
exports.extend = extend;
var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function extend(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

/***/ }),

/***/ 339:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(337).default;


/***/ }),

/***/ 340:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function addQueryString(url, params) {
  if (params && (typeof params === 'undefined' ? 'undefined' : _typeof(params)) === 'object') {
    var queryString = '',
        e = encodeURIComponent;

    // Must encode data
    for (var paramName in params) {
      queryString += '&' + e(paramName) + '=' + e(params[paramName]);
    }

    if (!queryString) {
      return url;
    }

    url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1);
  }

  return url;
}

// https://gist.github.com/Xeoncross/7663273
function ajax(url, options, callback, data, cache) {

  if (data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    if (!cache) {
      data['_t'] = new Date();
    }
    // URL encoded form data must be in querystring format
    data = addQueryString('', data).slice(1);
  }

  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams);
  }

  try {
    var x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    x.open(data ? 'POST' : 'GET', url, 1);
    if (!options.crossDomain) {
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    x.withCredentials = !!options.withCredentials;
    if (data) {
      x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    var h = options.customHeaders;
    if (h) {
      for (var i in h) {
        x.setRequestHeader(i, h[i]);
      }
    }
    x.onreadystatechange = function () {
      x.readyState > 3 && callback && callback(x.responseText, x);
    };
    x.send(data);
  } catch (e) {
    console && console.log(e);
  }
}

exports.default = ajax;

/***/ }),

/***/ 341:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(342);

var utils = _interopRequireWildcard(_utils);

var _ajax = __webpack_require__(340);

var _ajax2 = _interopRequireDefault(_ajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults() {
  return {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: 'locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    parse: JSON.parse,
    crossDomain: false,
    ajax: _ajax2.default
  };
}

var Backend = function () {
  function Backend(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Backend);

    this.init(services, options);

    this.type = 'backend';
  }

  _createClass(Backend, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = utils.defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'readMulti',
    value: function readMulti(languages, namespaces, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath(languages, namespaces);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'read',
    value: function read(language, namespace, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath([language], [namespace]);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'loadUrl',
    value: function loadUrl(url, callback) {
      var _this = this;

      this.options.ajax(url, this.options, function (data, xhr) {
        if (xhr.status >= 500 && xhr.status < 600) return callback('failed loading ' + url, true /* retry */);
        if (xhr.status >= 400 && xhr.status < 500) return callback('failed loading ' + url, false /* no retry */);

        var ret = void 0,
            err = void 0;
        try {
          ret = _this.options.parse(data, url);
        } catch (e) {
          err = 'failed parsing ' + url + ' to json';
        }
        if (err) return callback(err, false);
        callback(null, ret);
      });
    }
  }, {
    key: 'create',
    value: function create(languages, namespace, key, fallbackValue) {
      var _this2 = this;

      if (typeof languages === 'string') languages = [languages];

      var payload = {};
      payload[key] = fallbackValue || '';

      languages.forEach(function (lng) {
        var url = _this2.services.interpolator.interpolate(_this2.options.addPath, { lng: lng, ns: namespace });

        _this2.options.ajax(url, _this2.options, function (data, xhr) {
          //const statusCode = xhr.status.toString();
          // TODO: if statusCode === 4xx do log
        }, payload);
      });
    }
  }]);

  return Backend;
}();

Backend.type = 'backend';

exports.default = Backend;

/***/ }),

/***/ 342:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = defaults;
exports.extend = extend;
var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function extend(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

/***/ }),

/***/ 343:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(341).default;


/***/ }),

/***/ 344:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__logger__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__EventEmitter__ = __webpack_require__(40);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }





function remove(arr, what) {
  var found = arr.indexOf(what);

  while (found !== -1) {
    arr.splice(found, 1);
    found = arr.indexOf(what);
  }
}

var Connector = function (_EventEmitter) {
  _inherits(Connector, _EventEmitter);

  function Connector(backend, store, services) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, Connector);

    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.backend = backend;
    _this.store = store;
    _this.services = services;
    _this.options = options;
    _this.logger = __WEBPACK_IMPORTED_MODULE_1__logger__["a" /* default */].create('backendConnector');

    _this.state = {};
    _this.queue = [];

    _this.backend && _this.backend.init && _this.backend.init(services, options.backend, options);
    return _this;
  }

  Connector.prototype.queueLoad = function queueLoad(languages, namespaces, callback) {
    var _this2 = this;

    // find what needs to be loaded
    var toLoad = [],
        pending = [],
        toLoadLanguages = [],
        toLoadNamespaces = [];

    languages.forEach(function (lng) {
      var hasAllNamespaces = true;

      namespaces.forEach(function (ns) {
        var name = lng + '|' + ns;

        if (_this2.store.hasResourceBundle(lng, ns)) {
          _this2.state[name] = 2; // loaded
        } else if (_this2.state[name] < 0) {
          // nothing to do for err
        } else if (_this2.state[name] === 1) {
          if (pending.indexOf(name) < 0) pending.push(name);
        } else {
          _this2.state[name] = 1; // pending

          hasAllNamespaces = false;

          if (pending.indexOf(name) < 0) pending.push(name);
          if (toLoad.indexOf(name) < 0) toLoad.push(name);
          if (toLoadNamespaces.indexOf(ns) < 0) toLoadNamespaces.push(ns);
        }
      });

      if (!hasAllNamespaces) toLoadLanguages.push(lng);
    });

    if (toLoad.length || pending.length) {
      this.queue.push({
        pending: pending,
        loaded: {},
        errors: [],
        callback: callback
      });
    }

    return {
      toLoad: toLoad,
      pending: pending,
      toLoadLanguages: toLoadLanguages,
      toLoadNamespaces: toLoadNamespaces
    };
  };

  Connector.prototype.loaded = function loaded(name, err, data) {
    var _this3 = this;

    var _name$split = name.split('|'),
        _name$split2 = _slicedToArray(_name$split, 2),
        lng = _name$split2[0],
        ns = _name$split2[1];

    if (err) this.emit('failedLoading', lng, ns, err);

    if (data) {
      this.store.addResourceBundle(lng, ns, data);
    }

    // set loaded
    this.state[name] = err ? -1 : 2;
    // callback if ready
    this.queue.forEach(function (q) {
      __WEBPACK_IMPORTED_MODULE_0__utils__["b" /* pushPath */](q.loaded, [lng], ns);
      remove(q.pending, name);

      if (err) q.errors.push(err);

      if (q.pending.length === 0 && !q.done) {
        _this3.emit('loaded', q.loaded);
        q.errors.length ? q.callback(q.errors) : q.callback();
        q.done = true;
      }
    });

    // remove done load requests
    this.queue = this.queue.filter(function (q) {
      return !q.done;
    });
  };

  Connector.prototype.read = function read(lng, ns, fcName, tried, wait, callback) {
    var _this4 = this;

    if (!tried) tried = 0;
    if (!wait) wait = 250;

    if (!lng.length) return callback(null, {}); // noting to load

    this.backend[fcName](lng, ns, function (err, data) {
      if (err && data /* = retryFlag */ && tried < 5) {
        setTimeout(function () {
          _this4.read.call(_this4, lng, ns, fcName, ++tried, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    });
  };

  Connector.prototype.load = function load(languages, namespaces, callback) {
    var _this5 = this;

    if (!this.backend) {
      this.logger.warn('No backend was added via i18next.use. Will not load resources.');
      return callback && callback();
    }
    var options = _extends({}, this.backend.options, this.options.backend);

    if (typeof languages === 'string') languages = this.services.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];

    var toLoad = this.queueLoad(languages, namespaces, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length) callback(); // nothing to load and no pendings...callback now
      return; // pendings will trigger callback
    }

    // load with multi-load
    if (options.allowMultiLoading && this.backend.readMulti) {
      this.read(toLoad.toLoadLanguages, toLoad.toLoadNamespaces, 'readMulti', null, null, function (err, data) {
        if (err) _this5.logger.warn('loading namespaces ' + toLoad.toLoadNamespaces.join(', ') + ' for languages ' + toLoad.toLoadLanguages.join(', ') + ' via multiloading failed', err);
        if (!err && data) _this5.logger.log('loaded namespaces ' + toLoad.toLoadNamespaces.join(', ') + ' for languages ' + toLoad.toLoadLanguages.join(', ') + ' via multiloading', data);

        toLoad.toLoad.forEach(function (name) {
          var _name$split3 = name.split('|'),
              _name$split4 = _slicedToArray(_name$split3, 2),
              l = _name$split4[0],
              n = _name$split4[1];

          var bundle = __WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getPath */](data, [l, n]);
          if (bundle) {
            _this5.loaded(name, err, bundle);
          } else {
            var _err = 'loading namespace ' + n + ' for language ' + l + ' via multiloading failed';
            _this5.loaded(name, _err);
            _this5.logger.error(_err);
          }
        });
      });
    }

    // load one by one
    else {
        var readOne = function readOne(name) {
          var _this6 = this;

          var _name$split5 = name.split('|'),
              _name$split6 = _slicedToArray(_name$split5, 2),
              lng = _name$split6[0],
              ns = _name$split6[1];

          this.read(lng, ns, 'read', null, null, function (err, data) {
            if (err) _this6.logger.warn('loading namespace ' + ns + ' for language ' + lng + ' failed', err);
            if (!err && data) _this6.logger.log('loaded namespace ' + ns + ' for language ' + lng, data);

            _this6.loaded(name, err, data);
          });
        };

        ;

        toLoad.toLoad.forEach(function (name) {
          readOne.call(_this5, name);
        });
      }
  };

  Connector.prototype.reload = function reload(languages, namespaces) {
    var _this7 = this;

    if (!this.backend) {
      this.logger.warn('No backend was added via i18next.use. Will not load resources.');
    }
    var options = _extends({}, this.backend.options, this.options.backend);

    if (typeof languages === 'string') languages = this.services.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];

    // load with multi-load
    if (options.allowMultiLoading && this.backend.readMulti) {
      this.read(languages, namespaces, 'readMulti', null, null, function (err, data) {
        if (err) _this7.logger.warn('reloading namespaces ' + namespaces.join(', ') + ' for languages ' + languages.join(', ') + ' via multiloading failed', err);
        if (!err && data) _this7.logger.log('reloaded namespaces ' + namespaces.join(', ') + ' for languages ' + languages.join(', ') + ' via multiloading', data);

        languages.forEach(function (l) {
          namespaces.forEach(function (n) {
            var bundle = __WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getPath */](data, [l, n]);
            if (bundle) {
              _this7.loaded(l + '|' + n, err, bundle);
            } else {
              var _err2 = 'reloading namespace ' + n + ' for language ' + l + ' via multiloading failed';
              _this7.loaded(l + '|' + n, _err2);
              _this7.logger.error(_err2);
            }
          });
        });
      });
    }

    // load one by one
    else {
        var readOne = function readOne(name) {
          var _this8 = this;

          var _name$split7 = name.split('|'),
              _name$split8 = _slicedToArray(_name$split7, 2),
              lng = _name$split8[0],
              ns = _name$split8[1];

          this.read(lng, ns, 'read', null, null, function (err, data) {
            if (err) _this8.logger.warn('reloading namespace ' + ns + ' for language ' + lng + ' failed', err);
            if (!err && data) _this8.logger.log('reloaded namespace ' + ns + ' for language ' + lng, data);

            _this8.loaded(name, err, data);
          });
        };

        ;

        languages.forEach(function (l) {
          namespaces.forEach(function (n) {
            readOne.call(_this7, l + '|' + n);
          });
        });
      }
  };

  Connector.prototype.saveMissing = function saveMissing(languages, namespace, key, fallbackValue) {
    if (this.backend && this.backend.create) this.backend.create(languages, namespace, key, fallbackValue);

    // write to store to avoid resending
    if (!languages || !languages[0]) return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  };

  return Connector;
}(__WEBPACK_IMPORTED_MODULE_2__EventEmitter__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (Connector);

/***/ }),

/***/ 345:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__logger__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__EventEmitter__ = __webpack_require__(40);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }





var Connector = function (_EventEmitter) {
  _inherits(Connector, _EventEmitter);

  function Connector(cache, store, services) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, Connector);

    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.cache = cache;
    _this.store = store;
    _this.services = services;
    _this.options = options;
    _this.logger = __WEBPACK_IMPORTED_MODULE_1__logger__["a" /* default */].create('cacheConnector');

    _this.cache && _this.cache.init && _this.cache.init(services, options.cache, options);
    return _this;
  }

  Connector.prototype.load = function load(languages, namespaces, callback) {
    var _this2 = this;

    if (!this.cache) return callback && callback();
    var options = _extends({}, this.cache.options, this.options.cache);

    if (typeof languages === 'string') languages = this.services.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];

    if (options.enabled) {
      this.cache.load(languages, function (err, data) {
        if (err) _this2.logger.error('loading languages ' + languages.join(', ') + ' from cache failed', err);
        if (data) {
          for (var l in data) {
            for (var n in data[l]) {
              if (n === 'i18nStamp') continue;
              var bundle = data[l][n];
              if (bundle) _this2.store.addResourceBundle(l, n, bundle);
            }
          }
        }
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  };

  Connector.prototype.save = function save() {
    if (this.cache && this.options.cache && this.options.cache.enabled) this.cache.save(this.store.data);
  };

  return Connector;
}(__WEBPACK_IMPORTED_MODULE_2__EventEmitter__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (Connector);

/***/ }),

/***/ 346:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__logger__ = __webpack_require__(23);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var Interpolator = function () {
  function Interpolator() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Interpolator);

    this.logger = __WEBPACK_IMPORTED_MODULE_1__logger__["a" /* default */].create('interpolator');

    this.init(options, true);
  }

  Interpolator.prototype.init = function init() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var reset = arguments[1];

    if (reset) {
      this.options = options;
      this.format = options.interpolation && options.interpolation.format || function (value) {
        return value;
      };
      this.escape = options.interpolation && options.interpolation.escape || __WEBPACK_IMPORTED_MODULE_0__utils__["d" /* escape */];
    }
    if (!options.interpolation) options.interpolation = { escapeValue: true };

    var iOpts = options.interpolation;

    this.escapeValue = iOpts.escapeValue !== undefined ? iOpts.escapeValue : true;

    this.prefix = iOpts.prefix ? __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */](iOpts.prefix) : iOpts.prefixEscaped || '{{';
    this.suffix = iOpts.suffix ? __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */](iOpts.suffix) : iOpts.suffixEscaped || '}}';

    this.formatSeparator = iOpts.formatSeparator ? iOpts.formatSeparator : iOpts.formatSeparator || ',';

    this.unescapePrefix = iOpts.unescapeSuffix ? '' : iOpts.unescapePrefix || '-';
    this.unescapeSuffix = this.unescapePrefix ? '' : iOpts.unescapeSuffix || '';

    this.nestingPrefix = iOpts.nestingPrefix ? __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */](iOpts.nestingPrefix) : iOpts.nestingPrefixEscaped || __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */]('$t(');
    this.nestingSuffix = iOpts.nestingSuffix ? __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */](iOpts.nestingSuffix) : iOpts.nestingSuffixEscaped || __WEBPACK_IMPORTED_MODULE_0__utils__["e" /* regexEscape */](')');

    // the regexp
    this.resetRegExp();
  };

  Interpolator.prototype.reset = function reset() {
    if (this.options) this.init(this.options);
  };

  Interpolator.prototype.resetRegExp = function resetRegExp() {
    // the regexp
    var regexpStr = this.prefix + '(.+?)' + this.suffix;
    this.regexp = new RegExp(regexpStr, 'g');

    var regexpUnescapeStr = this.prefix + this.unescapePrefix + '(.+?)' + this.unescapeSuffix + this.suffix;
    this.regexpUnescape = new RegExp(regexpUnescapeStr, 'g');

    var nestingRegexpStr = this.nestingPrefix + '(.+?)' + this.nestingSuffix;
    this.nestingRegexp = new RegExp(nestingRegexpStr, 'g');
  };

  Interpolator.prototype.interpolate = function interpolate(str, data, lng) {
    var _this = this;

    var match = void 0,
        value = void 0;

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }

    var handleFormat = function handleFormat(key) {
      if (key.indexOf(_this.formatSeparator) < 0) return __WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getPath */](data, key);

      var p = key.split(_this.formatSeparator);
      var k = p.shift().trim();
      var f = p.join(_this.formatSeparator).trim();

      return _this.format(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getPath */](data, k), f, lng);
    };

    this.resetRegExp();

    // unescape if has unescapePrefix/Suffix
    while (match = this.regexpUnescape.exec(str)) {
      var _value = handleFormat(match[1].trim());
      str = str.replace(match[0], _value);
      this.regexpUnescape.lastIndex = 0;
    }

    // regular escape on demand
    while (match = this.regexp.exec(str)) {
      value = handleFormat(match[1].trim());
      if (typeof value !== 'string') value = __WEBPACK_IMPORTED_MODULE_0__utils__["f" /* makeString */](value);
      if (!value) {
        this.logger.warn('missed to pass in variable ' + match[1] + ' for interpolating ' + str);
        value = '';
      }
      value = this.escapeValue ? regexSafe(this.escape(value)) : regexSafe(value);
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  };

  Interpolator.prototype.nest = function nest(str, fc) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var match = void 0,
        value = void 0;

    var clonedOptions = _extends({}, options);
    clonedOptions.applyPostProcessor = false; // avoid post processing on nested lookup

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }

    // if value is something like "myKey": "lorem $(anotherKey, { "count": {{aValueInOptions}} })"
    function handleHasOptions(key) {
      if (key.indexOf(',') < 0) return key;

      var p = key.split(',');
      key = p.shift();
      var optionsString = p.join(',');
      optionsString = this.interpolate(optionsString, clonedOptions);
      optionsString = optionsString.replace(/'/g, '"');

      try {
        clonedOptions = JSON.parse(optionsString);
      } catch (e) {
        this.logger.error('failed parsing options string in nesting for key ' + key, e);
      }

      return key;
    }

    // regular escape on demand
    while (match = this.nestingRegexp.exec(str)) {
      value = fc(handleHasOptions.call(this, match[1].trim()), clonedOptions);
      if (typeof value !== 'string') value = __WEBPACK_IMPORTED_MODULE_0__utils__["f" /* makeString */](value);
      if (!value) {
        this.logger.warn('missed to pass in variable ' + match[1] + ' for interpolating ' + str);
        value = '';
      }
      // Nested keys should not be escaped by default #854
      // value = this.escapeValue ? regexSafe(utils.escape(value)) : regexSafe(value);
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  };

  return Interpolator;
}();

/* harmony default export */ __webpack_exports__["a"] = (Interpolator);

/***/ }),

/***/ 347:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__logger__ = __webpack_require__(23);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var LanguageUtil = function () {
  function LanguageUtil(options) {
    _classCallCheck(this, LanguageUtil);

    this.options = options;

    this.whitelist = this.options.whitelist || false;
    this.logger = __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].create('languageUtils');
  }

  LanguageUtil.prototype.getScriptPartFromCode = function getScriptPartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return null;

    var p = code.split('-');
    if (p.length === 2) return null;
    p.pop();
    return this.formatLanguageCode(p.join('-'));
  };

  LanguageUtil.prototype.getLanguagePartFromCode = function getLanguagePartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return code;

    var p = code.split('-');
    return this.formatLanguageCode(p[0]);
  };

  LanguageUtil.prototype.formatLanguageCode = function formatLanguageCode(code) {
    // http://www.iana.org/assignments/language-tags/language-tags.xhtml
    if (typeof code === 'string' && code.indexOf('-') > -1) {
      var specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab'];
      var p = code.split('-');

      if (this.options.lowerCaseLng) {
        p = p.map(function (part) {
          return part.toLowerCase();
        });
      } else if (p.length === 2) {
        p[0] = p[0].toLowerCase();
        p[1] = p[1].toUpperCase();

        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
      } else if (p.length === 3) {
        p[0] = p[0].toLowerCase();

        // if lenght 2 guess it's a country
        if (p[1].length === 2) p[1] = p[1].toUpperCase();
        if (p[0] !== 'sgn' && p[2].length === 2) p[2] = p[2].toUpperCase();

        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
        if (specialCases.indexOf(p[2].toLowerCase()) > -1) p[2] = capitalize(p[2].toLowerCase());
      }

      return p.join('-');
    } else {
      return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
    }
  };

  LanguageUtil.prototype.isWhitelisted = function isWhitelisted(code, exactMatch) {
    if (this.options.load === 'languageOnly' || this.options.nonExplicitWhitelist && !exactMatch) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.whitelist || !this.whitelist.length || this.whitelist.indexOf(code) > -1 ? true : false;
  };

  LanguageUtil.prototype.getFallbackCodes = function getFallbackCodes(fallbacks, code) {
    if (!fallbacks) return [];
    if (typeof fallbacks === 'string') fallbacks = [fallbacks];
    if (Object.prototype.toString.apply(fallbacks) === '[object Array]') return fallbacks;

    if (!code) return fallbacks.default || [];

    // asume we have an object defining fallbacks
    var found = fallbacks[code];
    if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found) found = fallbacks[this.formatLanguageCode(code)];
    if (!found) found = fallbacks.default;

    return found || [];
  };

  LanguageUtil.prototype.toResolveHierarchy = function toResolveHierarchy(code, fallbackCode) {
    var _this = this;

    var fallbackCodes = this.getFallbackCodes(fallbackCode || this.options.fallbackLng || [], code);

    var codes = [];
    var addCode = function addCode(code) {
      var exactMatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!code) return;
      if (_this.isWhitelisted(code, exactMatch)) {
        codes.push(code);
      } else {
        _this.logger.warn('rejecting non-whitelisted language code: ' + code);
      }
    };

    if (typeof code === 'string' && code.indexOf('-') > -1) {
      if (this.options.load !== 'languageOnly') addCode(this.formatLanguageCode(code), true);
      if (this.options.load !== 'languageOnly' && this.options.load !== 'currentOnly') addCode(this.getScriptPartFromCode(code), true);
      if (this.options.load !== 'currentOnly') addCode(this.getLanguagePartFromCode(code));
    } else if (typeof code === 'string') {
      addCode(this.formatLanguageCode(code));
    }

    fallbackCodes.forEach(function (fc) {
      if (codes.indexOf(fc) < 0) addCode(_this.formatLanguageCode(fc));
    });

    return codes;
  };

  return LanguageUtil;
}();

;

/* harmony default export */ __webpack_exports__["a"] = (LanguageUtil);

/***/ }),

/***/ 348:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__logger__ = __webpack_require__(23);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



// definition http://translate.sourceforge.net/wiki/l10n/pluralforms
/* eslint-disable */
var sets = [{ lngs: ['ach', 'ak', 'am', 'arn', 'br', 'fil', 'gun', 'ln', 'mfe', 'mg', 'mi', 'oc', 'tg', 'ti', 'tr', 'uz', 'wa'], nr: [1, 2], fc: 1 }, { lngs: ['af', 'an', 'ast', 'az', 'bg', 'bn', 'ca', 'da', 'de', 'dev', 'el', 'en', 'eo', 'es', 'es_ar', 'et', 'eu', 'fi', 'fo', 'fur', 'fy', 'gl', 'gu', 'ha', 'he', 'hi', 'hu', 'hy', 'ia', 'it', 'kn', 'ku', 'lb', 'mai', 'ml', 'mn', 'mr', 'nah', 'nap', 'nb', 'ne', 'nl', 'nn', 'no', 'nso', 'pa', 'pap', 'pms', 'ps', 'pt', 'pt_br', 'rm', 'sco', 'se', 'si', 'so', 'son', 'sq', 'sv', 'sw', 'ta', 'te', 'tk', 'ur', 'yo'], nr: [1, 2], fc: 2 }, { lngs: ['ay', 'bo', 'cgg', 'fa', 'id', 'ja', 'jbo', 'ka', 'kk', 'km', 'ko', 'ky', 'lo', 'ms', 'sah', 'su', 'th', 'tt', 'ug', 'vi', 'wo', 'zh'], nr: [1], fc: 3 }, { lngs: ['be', 'bs', 'dz', 'hr', 'ru', 'sr', 'uk'], nr: [1, 2, 5], fc: 4 }, { lngs: ['ar'], nr: [0, 1, 2, 3, 11, 100], fc: 5 }, { lngs: ['cs', 'sk'], nr: [1, 2, 5], fc: 6 }, { lngs: ['csb', 'pl'], nr: [1, 2, 5], fc: 7 }, { lngs: ['cy'], nr: [1, 2, 3, 8], fc: 8 }, { lngs: ['fr'], nr: [1, 2], fc: 9 }, { lngs: ['ga'], nr: [1, 2, 3, 7, 11], fc: 10 }, { lngs: ['gd'], nr: [1, 2, 3, 20], fc: 11 }, { lngs: ['is'], nr: [1, 2], fc: 12 }, { lngs: ['jv'], nr: [0, 1], fc: 13 }, { lngs: ['kw'], nr: [1, 2, 3, 4], fc: 14 }, { lngs: ['lt'], nr: [1, 2, 10], fc: 15 }, { lngs: ['lv'], nr: [1, 2, 0], fc: 16 }, { lngs: ['mk'], nr: [1, 2], fc: 17 }, { lngs: ['mnk'], nr: [0, 1, 2], fc: 18 }, { lngs: ['mt'], nr: [1, 2, 11, 20], fc: 19 }, { lngs: ['or'], nr: [2, 1], fc: 2 }, { lngs: ['ro'], nr: [1, 2, 20], fc: 20 }, { lngs: ['sl'], nr: [5, 1, 2, 3], fc: 21 }];

var _rulesPluralsTypes = {
  1: function _(n) {
    return Number(n > 1);
  },
  2: function _(n) {
    return Number(n != 1);
  },
  3: function _(n) {
    return 0;
  },
  4: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  5: function _(n) {
    return Number(n === 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
  },
  6: function _(n) {
    return Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2);
  },
  7: function _(n) {
    return Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  8: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3);
  },
  9: function _(n) {
    return Number(n >= 2);
  },
  10: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
  },
  11: function _(n) {
    return Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3);
  },
  12: function _(n) {
    return Number(n % 10 != 1 || n % 100 == 11);
  },
  13: function _(n) {
    return Number(n !== 0);
  },
  14: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3);
  },
  15: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  16: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2);
  },
  17: function _(n) {
    return Number(n == 1 || n % 10 == 1 ? 0 : 1);
  },
  18: function _(n) {
    return Number(n == 0 ? 0 : n == 1 ? 1 : 2);
  },
  19: function _(n) {
    return Number(n == 1 ? 0 : n === 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3);
  },
  20: function _(n) {
    return Number(n == 1 ? 0 : n === 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2);
  },
  21: function _(n) {
    return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
  }
};
/* eslint-enable */

function createRules() {
  var l,
      rules = {};
  sets.forEach(function (set) {
    set.lngs.forEach(function (l) {
      return rules[l] = {
        numbers: set.nr,
        plurals: _rulesPluralsTypes[set.fc]
      };
    });
  });
  return rules;
}

var PluralResolver = function () {
  function PluralResolver(languageUtils) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, PluralResolver);

    this.languageUtils = languageUtils;
    this.options = options;

    this.logger = __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].create('pluralResolver');

    this.rules = createRules();
  }

  PluralResolver.prototype.addRule = function addRule(lng, obj) {
    this.rules[lng] = obj;
  };

  PluralResolver.prototype.getRule = function getRule(code) {
    return this.rules[this.languageUtils.getLanguagePartFromCode(code)];
  };

  PluralResolver.prototype.needsPlural = function needsPlural(code) {
    var rule = this.getRule(code);

    return rule && rule.numbers.length <= 1 ? false : true;
  };

  PluralResolver.prototype.getSuffix = function getSuffix(code, count) {
    var _this = this;

    var rule = this.getRule(code);

    if (rule) {
      if (rule.numbers.length === 1) return ''; // only singular

      var idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
      var suffix = rule.numbers[idx];

      // special treatment for lngs only having singular and plural
      if (rule.numbers.length === 2 && rule.numbers[0] === 1) {
        if (suffix === 2) {
          suffix = 'plural';
        } else if (suffix === 1) {
          suffix = '';
        }
      }

      var returnSuffix = function returnSuffix() {
        return _this.options.prepend && suffix.toString() ? _this.options.prepend + suffix.toString() : suffix.toString();
      };

      // COMPATIBILITY JSON
      // v1
      if (this.options.compatibilityJSON === 'v1') {
        if (suffix === 1) return '';
        if (typeof suffix === 'number') return '_plural_' + suffix.toString();
        return returnSuffix();
      }
      // v2
      else if (this.options.compatibilityJSON === 'v2' || rule.numbers.length === 2 && rule.numbers[0] === 1) {
          return returnSuffix();
        }
        // v3 - gettext index
        else if (rule.numbers.length === 2 && rule.numbers[0] === 1) {
            return returnSuffix();
          }
      return this.options.prepend && idx.toString() ? this.options.prepend + idx.toString() : idx.toString();
    } else {
      this.logger.warn('no plural rule found for: ' + code);
      return '';
    }
  };

  return PluralResolver;
}();

;

/* harmony default export */ __webpack_exports__["a"] = (PluralResolver);

/***/ }),

/***/ 349:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__EventEmitter__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(41);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }




var ResourceStore = function (_EventEmitter) {
  _inherits(ResourceStore, _EventEmitter);

  function ResourceStore() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { ns: ['translation'], defaultNS: 'translation' };

    _classCallCheck(this, ResourceStore);

    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.data = data;
    _this.options = options;
    return _this;
  }

  ResourceStore.prototype.addNamespaces = function addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  };

  ResourceStore.prototype.removeNamespaces = function removeNamespaces(ns) {
    var index = this.options.ns.indexOf(ns);
    if (index > -1) {
      this.options.ns.splice(index, 1);
    }
  };

  ResourceStore.prototype.getResource = function getResource(lng, ns, key) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var keySeparator = options.keySeparator || this.options.keySeparator;
    if (keySeparator === undefined) keySeparator = '.';

    var path = [lng, ns];
    if (key && typeof key !== 'string') path = path.concat(key);
    if (key && typeof key === 'string') path = path.concat(keySeparator ? key.split(keySeparator) : key);

    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
    }

    return __WEBPACK_IMPORTED_MODULE_1__utils__["c" /* getPath */](this.data, path);
  };

  ResourceStore.prototype.addResource = function addResource(lng, ns, key, value) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { silent: false };

    var keySeparator = this.options.keySeparator;
    if (keySeparator === undefined) keySeparator = '.';

    var path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);

    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
      value = ns;
      ns = path[1];
    }

    this.addNamespaces(ns);

    __WEBPACK_IMPORTED_MODULE_1__utils__["g" /* setPath */](this.data, path, value);

    if (!options.silent) this.emit('added', lng, ns, key, value);
  };

  ResourceStore.prototype.addResources = function addResources(lng, ns, resources) {
    for (var m in resources) {
      if (typeof resources[m] === 'string') this.addResource(lng, ns, m, resources[m], { silent: true });
    }
    this.emit('added', lng, ns, resources);
  };

  ResourceStore.prototype.addResourceBundle = function addResourceBundle(lng, ns, resources, deep, overwrite) {
    var path = [lng, ns];
    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
      deep = resources;
      resources = ns;
      ns = path[1];
    }

    this.addNamespaces(ns);

    var pack = __WEBPACK_IMPORTED_MODULE_1__utils__["c" /* getPath */](this.data, path) || {};

    if (deep) {
      __WEBPACK_IMPORTED_MODULE_1__utils__["h" /* deepExtend */](pack, resources, overwrite);
    } else {
      pack = _extends({}, pack, resources);
    }

    __WEBPACK_IMPORTED_MODULE_1__utils__["g" /* setPath */](this.data, path, pack);

    this.emit('added', lng, ns, resources);
  };

  ResourceStore.prototype.removeResourceBundle = function removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);

    this.emit('removed', lng, ns);
  };

  ResourceStore.prototype.hasResourceBundle = function hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== undefined;
  };

  ResourceStore.prototype.getResourceBundle = function getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS;

    // TODO: COMPATIBILITY remove extend in v2.1.0
    if (this.options.compatibilityAPI === 'v1') return _extends({}, this.getResource(lng, ns));

    return this.getResource(lng, ns);
  };

  ResourceStore.prototype.toJSON = function toJSON() {
    return this.data;
  };

  return ResourceStore;
}(__WEBPACK_IMPORTED_MODULE_0__EventEmitter__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (ResourceStore);

/***/ }),

/***/ 350:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__logger__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__EventEmitter__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__postProcessor__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__compatibility_v1__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils__ = __webpack_require__(41);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }







var Translator = function (_EventEmitter) {
  _inherits(Translator, _EventEmitter);

  function Translator(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Translator);

    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

    __WEBPACK_IMPORTED_MODULE_4__utils__["a" /* copy */](['resourceStore', 'languageUtils', 'pluralResolver', 'interpolator', 'backendConnector'], services, _this);

    _this.options = options;
    _this.logger = __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].create('translator');
    return _this;
  }

  Translator.prototype.changeLanguage = function changeLanguage(lng) {
    if (lng) this.language = lng;
  };

  Translator.prototype.exists = function exists(key) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { interpolation: {} };

    if (this.options.compatibilityAPI === 'v1') {
      options = __WEBPACK_IMPORTED_MODULE_3__compatibility_v1__["d" /* convertTOptions */](options);
    }

    return this.resolve(key, options) !== undefined;
  };

  Translator.prototype.extractFromKey = function extractFromKey(key, options) {
    var nsSeparator = options.nsSeparator || this.options.nsSeparator;
    if (nsSeparator === undefined) nsSeparator = ':';
    var keySeparator = options.keySeparator || this.options.keySeparator || '.';

    var namespaces = options.ns || this.options.defaultNS;
    if (nsSeparator && key.indexOf(nsSeparator) > -1) {
      var parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1) namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    if (typeof namespaces === 'string') namespaces = [namespaces];

    return {
      key: key,
      namespaces: namespaces
    };
  };

  Translator.prototype.translate = function translate(keys) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      options = this.options.overloadTranslationOptionHandler(arguments);
    } else if (this.options.compatibilityAPI === 'v1') {
      options = __WEBPACK_IMPORTED_MODULE_3__compatibility_v1__["d" /* convertTOptions */](options);
    }

    // non valid keys handling
    if (keys === undefined || keys === null || keys === '') return '';
    if (typeof keys === 'number') keys = String(keys);
    if (typeof keys === 'string') keys = [keys];

    // separators
    var keySeparator = options.keySeparator || this.options.keySeparator || '.';

    // get namespace(s)

    var _extractFromKey = this.extractFromKey(keys[keys.length - 1], options),
        key = _extractFromKey.key,
        namespaces = _extractFromKey.namespaces;

    var namespace = namespaces[namespaces.length - 1];

    // return key on CIMode
    var lng = options.lng || this.language;
    var appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (lng && lng.toLowerCase() === 'cimode') {
      if (appendNamespaceToCIMode) {
        var nsSeparator = options.nsSeparator || this.options.nsSeparator;
        return namespace + nsSeparator + key;
      }

      return key;
    }

    // resolve from store
    var res = this.resolve(keys, options);

    var resType = Object.prototype.toString.apply(res);
    var noObject = ['[object Number]', '[object Function]', '[object RegExp]'];
    var joinArrays = options.joinArrays !== undefined ? options.joinArrays : this.options.joinArrays;

    // object
    if (res && typeof res !== 'string' && noObject.indexOf(resType) < 0 && !(joinArrays && resType === '[object Array]')) {
      if (!options.returnObjects && !this.options.returnObjects) {
        this.logger.warn('accessing an object - but returnObjects options is not enabled!');
        return this.options.returnedObjectHandler ? this.options.returnedObjectHandler(key, res, options) : 'key \'' + key + ' (' + this.language + ')\' returned an object instead of string.';
      }

      // if we got a separator we loop over children - else we just return object as is
      // as having it set to false means no hierarchy so no lookup for nested values
      if (options.keySeparator || this.options.keySeparator) {
        var copy = resType === '[object Array]' ? [] : {}; // apply child translation on a copy

        for (var m in res) {
          copy[m] = this.translate('' + key + keySeparator + m, _extends({}, options, { joinArrays: false, ns: namespaces }));
        }
        res = copy;
      }
    }
    // array special treatment
    else if (joinArrays && resType === '[object Array]') {
        res = res.join(joinArrays);
        if (res) res = this.extendTranslation(res, key, options);
      }
      // string, empty or null
      else {
          var usedDefault = false,
              usedKey = false;

          // fallback value
          if (!this.isValidLookup(res) && options.defaultValue !== undefined) {
            usedDefault = true;
            res = options.defaultValue;
          }
          if (!this.isValidLookup(res)) {
            usedKey = true;
            res = key;
          }

          // save missing
          if (usedKey || usedDefault) {
            this.logger.log('missingKey', lng, namespace, key, res);

            var lngs = [];
            var fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, options.lng || this.language);
            if (this.options.saveMissingTo === 'fallback' && fallbackLngs && fallbackLngs[0]) {
              for (var i = 0; i < fallbackLngs.length; i++) {
                lngs.push(fallbackLngs[i]);
              }
            } else if (this.options.saveMissingTo === 'all') {
              lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);
            } else {
              //(this.options.saveMissingTo === 'current' || (this.options.saveMissingTo === 'fallback' && this.options.fallbackLng[0] === false) ) {
              lngs.push(options.lng || this.language);
            }

            if (this.options.saveMissing) {
              if (this.options.missingKeyHandler) {
                this.options.missingKeyHandler(lngs, namespace, key, res);
              } else if (this.backendConnector && this.backendConnector.saveMissing) {
                this.backendConnector.saveMissing(lngs, namespace, key, res);
              }
            }

            this.emit('missingKey', lngs, namespace, key, res);
          }

          // extend
          res = this.extendTranslation(res, key, options);

          // append namespace if still key
          if (usedKey && res === key && this.options.appendNamespaceToMissingKey) res = namespace + ':' + key;

          // parseMissingKeyHandler
          if (usedKey && this.options.parseMissingKeyHandler) res = this.options.parseMissingKeyHandler(res);
        }

    // return
    return res;
  };

  Translator.prototype.extendTranslation = function extendTranslation(res, key, options) {
    var _this2 = this;

    if (options.interpolation) this.interpolator.init(_extends({}, options, { interpolation: _extends({}, this.options.interpolation, options.interpolation) }));

    // interpolate
    var data = options.replace && typeof options.replace !== 'string' ? options.replace : options;
    if (this.options.interpolation.defaultVariables) data = _extends({}, this.options.interpolation.defaultVariables, data);
    res = this.interpolator.interpolate(res, data, this.language);

    // nesting
    res = this.interpolator.nest(res, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this2.translate.apply(_this2, args);
    }, options);

    if (options.interpolation) this.interpolator.reset();

    // post process
    var postProcess = options.postProcess || this.options.postProcess;
    var postProcessorNames = typeof postProcess === 'string' ? [postProcess] : postProcess;

    if (res !== undefined && postProcessorNames && postProcessorNames.length && options.applyPostProcessor !== false) {
      res = __WEBPACK_IMPORTED_MODULE_2__postProcessor__["a" /* default */].handle(postProcessorNames, res, key, options, this);
    }

    return res;
  };

  Translator.prototype.resolve = function resolve(keys) {
    var _this3 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var found = void 0;

    if (typeof keys === 'string') keys = [keys];

    // forEach possible key
    keys.forEach(function (k) {
      if (_this3.isValidLookup(found)) return;

      var _extractFromKey2 = _this3.extractFromKey(k, options),
          key = _extractFromKey2.key,
          namespaces = _extractFromKey2.namespaces;

      if (_this3.options.fallbackNS) namespaces = namespaces.concat(_this3.options.fallbackNS);

      var needsPluralHandling = options.count !== undefined && typeof options.count !== 'string';
      var needsContextHandling = options.context !== undefined && typeof options.context === 'string' && options.context !== '';

      var codes = options.lngs ? options.lngs : _this3.languageUtils.toResolveHierarchy(options.lng || _this3.language);

      namespaces.forEach(function (ns) {
        if (_this3.isValidLookup(found)) return;

        codes.forEach(function (code) {
          if (_this3.isValidLookup(found)) return;

          var finalKey = key;
          var finalKeys = [finalKey];

          var pluralSuffix = void 0;
          if (needsPluralHandling) pluralSuffix = _this3.pluralResolver.getSuffix(code, options.count);

          // fallback for plural if context not found
          if (needsPluralHandling && needsContextHandling) finalKeys.push(finalKey + pluralSuffix);

          // get key for context if needed
          if (needsContextHandling) finalKeys.push(finalKey += '' + _this3.options.contextSeparator + options.context);

          // get key for plural if needed
          if (needsPluralHandling) finalKeys.push(finalKey += pluralSuffix);

          // iterate over finalKeys starting with most specific pluralkey (-> contextkey only) -> singularkey only
          var possibleKey = void 0;
          while (possibleKey = finalKeys.pop()) {
            if (_this3.isValidLookup(found)) continue;
            found = _this3.getResource(code, ns, possibleKey, options);
          }
        });
      });
    });

    return found;
  };

  Translator.prototype.isValidLookup = function isValidLookup(res) {
    return res !== undefined && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === '');
  };

  Translator.prototype.getResource = function getResource(code, ns, key) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    return this.resourceStore.getResource(code, ns, key, options);
  };

  return Translator;
}(__WEBPACK_IMPORTED_MODULE_1__EventEmitter__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (Translator);

/***/ }),

/***/ 351:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = get;
/* harmony export (immutable) */ __webpack_exports__["a"] = transformOptions;
function get() {
  return {
    debug: false,
    initImmediate: true,

    ns: ['translation'],
    defaultNS: ['translation'],
    fallbackLng: ['dev'],
    fallbackNS: false, // string or array of namespaces

    whitelist: false, // array with whitelisted languages
    nonExplicitWhitelist: false,
    load: 'all', // | currentOnly | languageOnly
    preload: false, // array with preload languages

    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_',

    saveMissing: false, // enable to send missing values
    saveMissingTo: 'fallback', // 'current' || 'all'
    missingKeyHandler: false, // function(lng, ns, key, fallbackValue) -> override if prefer on handling

    postProcess: false, // string or array of postProcessor names
    returnNull: true, // allows null value as valid translation
    returnEmptyString: true, // allows empty string value as valid translation
    returnObjects: false,
    joinArrays: false, // or string to join array
    returnedObjectHandler: function returnedObjectHandler() {}, // function(key, value, options) triggered if key returns object but returnObjects is set to false
    parseMissingKeyHandler: false, // function(key) parsed a key that was not found in t() before returning
    appendNamespaceToMissingKey: false,
    appendNamespaceToCIMode: false,
    overloadTranslationOptionHandler: function overloadTranslationOptionHandler(args) {
      return { defaultValue: args[1] };
    },

    interpolation: {
      escapeValue: true,
      format: function format(value, _format, lng) {
        return value;
      },
      prefix: '{{',
      suffix: '}}',
      formatSeparator: ',',
      // prefixEscaped: '{{',
      // suffixEscaped: '}}',
      // unescapeSuffix: '',
      unescapePrefix: '-',

      nestingPrefix: '$t(',
      nestingSuffix: ')',
      // nestingPrefixEscaped: '$t(',
      // nestingSuffixEscaped: ')',
      defaultVariables: undefined // object that can have values to interpolate on - extends passed in interpolation data
    }
  };
}

function transformOptions(options) {
  // create namespace object if namespace is passed in as string
  if (typeof options.ns === 'string') options.ns = [options.ns];
  if (typeof options.fallbackLng === 'string') options.fallbackLng = [options.fallbackLng];
  if (typeof options.fallbackNS === 'string') options.fallbackNS = [options.fallbackNS];

  // extend whitelist with cimode
  if (options.whitelist && options.whitelist.indexOf('cimode') < 0) options.whitelist.push('cimode');

  return options;
}

/***/ }),

/***/ 352:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__logger__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__EventEmitter__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ResourceStore__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Translator__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__LanguageUtils__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__PluralResolver__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Interpolator__ = __webpack_require__(346);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__BackendConnector__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__CacheConnector__ = __webpack_require__(345);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__defaults__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__postProcessor__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__compatibility_v1__ = __webpack_require__(103);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }















function noop() {};

var I18n = function (_EventEmitter) {
  _inherits(I18n, _EventEmitter);

  function I18n() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];

    _classCallCheck(this, I18n);

    var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.options = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["a" /* transformOptions */])(options);
    _this.services = {};
    _this.logger = __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */];
    _this.modules = { external: [] };

    if (callback && !_this.isInitialized && !options.isClone) _this.init(options, callback);
    return _this;
  }

  I18n.prototype.init = function init(options, callback) {
    var _this2 = this;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!options) options = {};

    if (options.compatibilityAPI === 'v1') {
      this.options = _extends({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["b" /* get */])(), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["a" /* transformOptions */])(__WEBPACK_IMPORTED_MODULE_11__compatibility_v1__["a" /* convertAPIOptions */](options)), {});
    } else if (options.compatibilityJSON === 'v1') {
      this.options = _extends({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["b" /* get */])(), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["a" /* transformOptions */])(__WEBPACK_IMPORTED_MODULE_11__compatibility_v1__["b" /* convertJSONOptions */](options)), {});
    } else {
      this.options = _extends({}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["b" /* get */])(), this.options, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__defaults__["a" /* transformOptions */])(options));
    }
    if (!callback) callback = noop;

    function createClassOnDemand(ClassOrObject) {
      if (!ClassOrObject) return;
      if (typeof ClassOrObject === 'function') return new ClassOrObject();
      return ClassOrObject;
    }

    // init services
    if (!this.options.isClone) {
      if (this.modules.logger) {
        __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].init(createClassOnDemand(this.modules.logger), this.options);
      } else {
        __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */].init(null, this.options);
      }

      var lu = new __WEBPACK_IMPORTED_MODULE_4__LanguageUtils__["a" /* default */](this.options);
      this.store = new __WEBPACK_IMPORTED_MODULE_2__ResourceStore__["a" /* default */](this.options.resources, this.options);

      var s = this.services;
      s.logger = __WEBPACK_IMPORTED_MODULE_0__logger__["a" /* default */];
      s.resourceStore = this.store;
      s.resourceStore.on('added removed', function (lng, ns) {
        s.cacheConnector.save();
      });
      s.languageUtils = lu;
      s.pluralResolver = new __WEBPACK_IMPORTED_MODULE_5__PluralResolver__["a" /* default */](lu, { prepend: this.options.pluralSeparator, compatibilityJSON: this.options.compatibilityJSON });
      s.interpolator = new __WEBPACK_IMPORTED_MODULE_6__Interpolator__["a" /* default */](this.options);

      s.backendConnector = new __WEBPACK_IMPORTED_MODULE_7__BackendConnector__["a" /* default */](createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      // pipe events from backendConnector
      s.backendConnector.on('*', function (event) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      s.backendConnector.on('loaded', function (loaded) {
        s.cacheConnector.save();
      });

      s.cacheConnector = new __WEBPACK_IMPORTED_MODULE_8__CacheConnector__["a" /* default */](createClassOnDemand(this.modules.cache), s.resourceStore, s, this.options);
      // pipe events from backendConnector
      s.cacheConnector.on('*', function (event) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        s.languageDetector.init(s, this.options.detection, this.options);
      }

      this.translator = new __WEBPACK_IMPORTED_MODULE_3__Translator__["a" /* default */](this.services, this.options);
      // pipe events from translator
      this.translator.on('*', function (event) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      this.modules.external.forEach(function (m) {
        if (m.init) m.init(_this2);
      });
    }

    // append api
    var storeApi = ['getResource', 'addResource', 'addResources', 'addResourceBundle', 'removeResourceBundle', 'hasResourceBundle', 'getResourceBundle'];
    storeApi.forEach(function (fcName) {
      _this2[fcName] = function () {
        return this.store[fcName].apply(this.store, arguments);
      };
    });

    // TODO: COMPATIBILITY remove this
    if (this.options.compatibilityAPI === 'v1') __WEBPACK_IMPORTED_MODULE_11__compatibility_v1__["c" /* appendBackwardsAPI */](this);

    var load = function load() {
      _this2.changeLanguage(_this2.options.lng, function (err, t) {
        _this2.isInitialized = true;
        _this2.logger.log('initialized', _this2.options);
        _this2.emit('initialized', _this2.options);

        callback(err, t);
      });
    };

    if (this.options.resources || !this.options.initImmediate) {
      load();
    } else {
      setTimeout(load, 0);
    }

    return this;
  };

  I18n.prototype.loadResources = function loadResources() {
    var _this3 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

    if (!this.options.resources) {
      if (this.language && this.language.toLowerCase() === 'cimode') return callback(); // avoid loading resources for cimode

      var toLoad = [];

      var append = function append(lng) {
        if (!lng) return;
        var lngs = _this3.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach(function (l) {
          if (toLoad.indexOf(l) < 0) toLoad.push(l);
        });
      };

      append(this.language);

      if (this.options.preload) {
        this.options.preload.forEach(function (l) {
          append(l);
        });
      }

      this.services.cacheConnector.load(toLoad, this.options.ns, function () {
        _this3.services.backendConnector.load(toLoad, _this3.options.ns, callback);
      });
    } else {
      callback(null);
    }
  };

  I18n.prototype.reloadResources = function reloadResources(lngs, ns) {
    if (!lngs) lngs = this.languages;
    if (!ns) ns = this.options.ns;
    this.services.backendConnector.reload(lngs, ns);
  };

  I18n.prototype.use = function use(module) {
    if (module.type === 'backend') {
      this.modules.backend = module;
    }

    if (module.type === 'cache') {
      this.modules.cache = module;
    }

    if (module.type === 'logger' || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }

    if (module.type === 'languageDetector') {
      this.modules.languageDetector = module;
    }

    if (module.type === 'postProcessor') {
      __WEBPACK_IMPORTED_MODULE_10__postProcessor__["a" /* default */].addPostProcessor(module);
    }

    if (module.type === '3rdParty') {
      this.modules.external.push(module);
    }

    return this;
  };

  I18n.prototype.changeLanguage = function changeLanguage(lng, callback) {
    var _this4 = this;

    var done = function done(err) {
      if (lng) {
        _this4.emit('languageChanged', lng);
        _this4.logger.log('languageChanged', lng);
      }

      if (callback) callback(err, function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return _this4.t.apply(_this4, args);
      });
    };

    if (!lng && this.services.languageDetector) lng = this.services.languageDetector.detect();

    if (lng) {
      this.language = lng;
      this.languages = this.services.languageUtils.toResolveHierarchy(lng);

      this.translator.changeLanguage(lng);

      if (this.services.languageDetector) this.services.languageDetector.cacheUserLanguage(lng);
    }

    this.loadResources(function (err) {
      done(err);
    });
  };

  I18n.prototype.getFixedT = function getFixedT(lng, ns) {
    var _this5 = this;

    var fixedT = function fixedT(key) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = _extends({}, opts);
      options.lng = options.lng || fixedT.lng;
      options.ns = options.ns || fixedT.ns;
      return _this5.t(key, options);
    };
    fixedT.lng = lng;
    fixedT.ns = ns;
    return fixedT;
  };

  I18n.prototype.t = function t() {
    return this.translator && this.translator.translate.apply(this.translator, arguments);
  };

  I18n.prototype.exists = function exists() {
    return this.translator && this.translator.exists.apply(this.translator, arguments);
  };

  I18n.prototype.setDefaultNamespace = function setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  };

  I18n.prototype.loadNamespaces = function loadNamespaces(ns, callback) {
    var _this6 = this;

    if (!this.options.ns) return callback && callback();
    if (typeof ns === 'string') ns = [ns];

    ns.forEach(function (n) {
      if (_this6.options.ns.indexOf(n) < 0) _this6.options.ns.push(n);
    });

    this.loadResources(callback);
  };

  I18n.prototype.loadLanguages = function loadLanguages(lngs, callback) {
    if (typeof lngs === 'string') lngs = [lngs];
    var preloaded = this.options.preload || [];

    var newLngs = lngs.filter(function (lng) {
      return preloaded.indexOf(lng) < 0;
    });
    // Exit early if all given languages are already preloaded
    if (!newLngs.length) return callback();

    this.options.preload = preloaded.concat(newLngs);
    this.loadResources(callback);
  };

  I18n.prototype.dir = function dir(lng) {
    if (!lng) lng = this.language;
    if (!lng) return 'rtl';

    var rtlLngs = ['ar', 'shu', 'sqr', 'ssh', 'xaa', 'yhd', 'yud', 'aao', 'abh', 'abv', 'acm', 'acq', 'acw', 'acx', 'acy', 'adf', 'ads', 'aeb', 'aec', 'afb', 'ajp', 'apc', 'apd', 'arb', 'arq', 'ars', 'ary', 'arz', 'auz', 'avl', 'ayh', 'ayl', 'ayn', 'ayp', 'bbz', 'pga', 'he', 'iw', 'ps', 'pbt', 'pbu', 'pst', 'prp', 'prd', 'ur', 'ydd', 'yds', 'yih', 'ji', 'yi', 'hbo', 'men', 'xmn', 'fa', 'jpr', 'peo', 'pes', 'prs', 'dv', 'sam'];

    return rtlLngs.indexOf(this.services.languageUtils.getLanguagePartFromCode(lng)) >= 0 ? 'rtl' : 'ltr';
  };

  I18n.prototype.createInstance = function createInstance() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];

    return new I18n(options, callback);
  };

  I18n.prototype.cloneInstance = function cloneInstance() {
    var _this7 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

    var mergedOptions = _extends({}, options, this.options, { isClone: true });
    var clone = new I18n(mergedOptions, callback);
    var membersToCopy = ['store', 'services', 'language'];
    membersToCopy.forEach(function (m) {
      clone[m] = _this7[m];
    });
    clone.translator = new __WEBPACK_IMPORTED_MODULE_3__Translator__["a" /* default */](clone.services, clone.options);
    clone.translator.on('*', function (event) {
      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      clone.emit.apply(clone, [event].concat(args));
    });
    clone.init(mergedOptions, callback);

    return clone;
  };

  return I18n;
}(__WEBPACK_IMPORTED_MODULE_1__EventEmitter__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new I18n());

/***/ }),

/***/ 353:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__i18next__ = __webpack_require__(352);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "changeLanguage", function() { return changeLanguage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneInstance", function() { return cloneInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createInstance", function() { return createInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dir", function() { return dir; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exists", function() { return exists; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFixedT", function() { return getFixedT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadLanguages", function() { return loadLanguages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadNamespaces", function() { return loadNamespaces; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadResources", function() { return loadResources; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "off", function() { return off; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "on", function() { return on; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setDefaultNamespace", function() { return setDefaultNamespace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "use", function() { return use; });


/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);

var changeLanguage = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].changeLanguage.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var cloneInstance = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].cloneInstance.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var createInstance = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].createInstance.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var dir = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].dir.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var exists = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].exists.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var getFixedT = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].getFixedT.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var init = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].init.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var loadLanguages = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].loadLanguages.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var loadNamespaces = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].loadNamespaces.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var loadResources = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].loadResources.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var off = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].off.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var on = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].on.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var setDefaultNamespace = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].setDefaultNamespace.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var t = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].t.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);
var use = __WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */].use.bind(__WEBPACK_IMPORTED_MODULE_0__i18next__["a" /* default */]);

/***/ }),

/***/ 373:
/***/ (function(module, exports, __webpack_require__) {

// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
__webpack_require__(516);
module.exports = self.fetch.bind(self);


/***/ }),

/***/ 40:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = function () {
	function EventEmitter() {
		_classCallCheck(this, EventEmitter);

		this.observers = {};
	}

	EventEmitter.prototype.on = function on(events, listener) {
		var _this = this;

		events.split(' ').forEach(function (event) {
			_this.observers[event] = _this.observers[event] || [];
			_this.observers[event].push(listener);
		});
	};

	EventEmitter.prototype.off = function off(event, listener) {
		var _this2 = this;

		if (!this.observers[event]) {
			return;
		}

		this.observers[event].forEach(function () {
			if (!listener) {
				delete _this2.observers[event];
			} else {
				var index = _this2.observers[event].indexOf(listener);
				if (index > -1) {
					_this2.observers[event].splice(index, 1);
				}
			}
		});
	};

	EventEmitter.prototype.emit = function emit(event) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		if (this.observers[event]) {
			var cloned = [].concat(this.observers[event]);
			cloned.forEach(function (observer) {
				observer.apply(undefined, args);
			});
		}

		if (this.observers['*']) {
			var _cloned = [].concat(this.observers['*']);
			_cloned.forEach(function (observer) {
				var _ref;

				observer.apply(observer, (_ref = [event]).concat.apply(_ref, args));
			});
		}
	};

	return EventEmitter;
}();

/* harmony default export */ __webpack_exports__["a"] = (EventEmitter);

/***/ }),

/***/ 41:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["f"] = makeString;
/* harmony export (immutable) */ __webpack_exports__["a"] = copy;
/* harmony export (immutable) */ __webpack_exports__["g"] = setPath;
/* harmony export (immutable) */ __webpack_exports__["b"] = pushPath;
/* harmony export (immutable) */ __webpack_exports__["c"] = getPath;
/* harmony export (immutable) */ __webpack_exports__["h"] = deepExtend;
/* harmony export (immutable) */ __webpack_exports__["e"] = regexEscape;
/* harmony export (immutable) */ __webpack_exports__["d"] = escape;
function makeString(object) {
  if (object == null) return '';
  return '' + object;
}

function copy(a, s, t) {
  a.forEach(function (m) {
    if (s[m]) t[m] = s[m];
  });
}

function getLastOfPath(object, path, Empty) {
  function cleanKey(key) {
    return key && key.indexOf('###') > -1 ? key.replace(/###/g, '.') : key;
  }

  var stack = typeof path !== 'string' ? [].concat(path) : path.split('.');
  while (stack.length > 1) {
    if (!object) return {};

    var key = cleanKey(stack.shift());
    if (!object[key] && Empty) object[key] = new Empty();
    object = object[key];
  }

  if (!object) return {};
  return {
    obj: object,
    k: cleanKey(stack.shift())
  };
}

function setPath(object, path, newValue) {
  var _getLastOfPath = getLastOfPath(object, path, Object),
      obj = _getLastOfPath.obj,
      k = _getLastOfPath.k;

  obj[k] = newValue;
}

function pushPath(object, path, newValue, concat) {
  var _getLastOfPath2 = getLastOfPath(object, path, Object),
      obj = _getLastOfPath2.obj,
      k = _getLastOfPath2.k;

  obj[k] = obj[k] || [];
  if (concat) obj[k] = obj[k].concat(newValue);
  if (!concat) obj[k].push(newValue);
}

function getPath(object, path) {
  var _getLastOfPath3 = getLastOfPath(object, path),
      obj = _getLastOfPath3.obj,
      k = _getLastOfPath3.k;

  if (!obj) return undefined;
  return obj[k];
}

function deepExtend(target, source, overwrite) {
  for (var prop in source) {
    if (prop in target) {
      // If we reached a leaf string in target or source then replace with source or skip depending on the 'overwrite' switch
      if (typeof target[prop] === 'string' || target[prop] instanceof String || typeof source[prop] === 'string' || source[prop] instanceof String) {
        if (overwrite) target[prop] = source[prop];
      } else {
        deepExtend(target[prop], source[prop], overwrite);
      }
    } else {
      target[prop] = source[prop];
    }
  }return target;
}

function regexEscape(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/* eslint-disable */
var _entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
/* eslint-enable */

function escape(data) {
  if (typeof data === 'string') {
    return data.replace(/[&<>"'\/]/g, function (s) {
      return _entityMap[s];
    });
  } else {
    return data;
  }
}

/***/ }),

/***/ 466:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _propTypes = __webpack_require__(71);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var I18nextProvider = function (_Component) {
  _inherits(I18nextProvider, _Component);

  function I18nextProvider(props, context) {
    _classCallCheck(this, I18nextProvider);

    var _this = _possibleConstructorReturn(this, (I18nextProvider.__proto__ || Object.getPrototypeOf(I18nextProvider)).call(this, props, context));

    _this.i18n = props.i18n;
    return _this;
  }

  _createClass(I18nextProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { i18n: this.i18n };
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.i18n !== nextProps.i18n) {
        throw new Error('[react-i18next][I18nextProvider]does not support changing the i18n object.');
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;

      return _react.Children.only(children);
    }
  }]);

  return I18nextProvider;
}(_react.Component);

I18nextProvider.propTypes = {
  i18n: _propTypes2.default.object.isRequired,
  children: _propTypes2.default.element.isRequired
};

I18nextProvider.childContextTypes = {
  i18n: _propTypes2.default.object.isRequired
};

exports.default = I18nextProvider;

/***/ }),

/***/ 467:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(71);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Interpolate = function (_Component) {
  _inherits(Interpolate, _Component);

  function Interpolate(props, context) {
    _classCallCheck(this, Interpolate);

    var _this = _possibleConstructorReturn(this, (Interpolate.__proto__ || Object.getPrototypeOf(Interpolate)).call(this, props, context));

    _this.i18n = context.i18n;
    _this.t = context.t;
    return _this;
  }

  _createClass(Interpolate, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var parent = this.props.parent || 'span';
      var REGEXP = this.props.regexp || this.i18n.services.interpolator.regexp;
      var _props = this.props,
          className = _props.className,
          style = _props.style;

      // Set to true if you want to use raw HTML in translation values
      // See https://github.com/i18next/react-i18next/issues/189

      var useDangerouslySetInnerHTML = this.props.useDangerouslySetInnerHTML || false;
      var dangerouslySetInnerHTMLPartElement = this.props.dangerouslySetInnerHTMLPartElement || 'span';

      var tOpts = _extends({}, this.props.options, { interpolation: { prefix: '#$?', suffix: '?$#' } });
      var format = this.t(this.props.i18nKey, tOpts);

      if (!format || typeof format !== 'string') return _react2.default.createElement('noscript', null);

      var children = [];

      var handleFormat = function handleFormat(key, props) {
        if (key.indexOf(_this2.i18n.options.interpolation.formatSeparator) < 0) {
          if (props[key] === undefined) _this2.i18n.services.logger.warn('interpolator: missed to pass in variable ' + key + ' for interpolating ' + format);
          return props[key];
        }

        var p = key.split(_this2.i18n.options.interpolation.formatSeparator);
        var k = p.shift().trim();
        var f = p.join(_this2.i18n.options.interpolation.formatSeparator).trim();

        if (props[k] === undefined) _this2.i18n.services.logger.warn('interpolator: missed to pass in variable ' + k + ' for interpolating ' + format);
        return _this2.i18n.options.interpolation.format(props[k], f, _this2.i18n.language);
      };

      format.split(REGEXP).reduce(function (memo, match, index) {
        var child = void 0;

        if (index % 2 === 0) {
          if (match.length === 0) return memo;
          if (useDangerouslySetInnerHTML) {
            child = _react2.default.createElement(dangerouslySetInnerHTMLPartElement, { dangerouslySetInnerHTML: { __html: match } });
          } else {
            child = match;
          }
        } else {
          child = handleFormat(match, _this2.props);
        }

        memo.push(child);
        return memo;
      }, children);

      return _react2.default.createElement.apply(this, [parent, { className: className, style: style }].concat(children));
    }
  }]);

  return Interpolate;
}(_react.Component);

Interpolate.propTypes = {
  children: _propTypes2.default.node,
  className: _propTypes2.default.string
};

Interpolate.contextTypes = {
  i18n: _propTypes2.default.object.isRequired,
  t: _propTypes2.default.func.isRequired
};

exports.default = Interpolate;

/***/ }),

/***/ 468:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = loadNamespaces;
// Borrowed from https://github.com/Rezonans/redux-async-connect/blob/master/modules/ReduxAsyncConnect.js#L16
function eachComponents(components, iterator) {
  for (var i = 0, l = components.length; i < l; i++) {
    // eslint-disable-line id-length
    if (_typeof(components[i]) === 'object') {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.entries(components[i])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

          iterator(value, i, key);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      iterator(components[i], i);
    }
  }
}

function filterAndFlattenComponents(components) {
  var flattened = [];
  eachComponents(components, function (Component) {
    if (Component && Component.namespaces) {

      Component.namespaces.forEach(function (namespace) {
        if (flattened.indexOf(namespace) === -1) {
          flattened.push(namespace);
        }
      });
    }
  });
  return flattened;
}

function loadNamespaces(_ref) {
  var components = _ref.components,
      i18n = _ref.i18n;

  var allNamespaces = filterAndFlattenComponents(components);

  return new Promise(function (resolve) {
    i18n.loadNamespaces(allNamespaces, resolve);
  });
}

/***/ }),

/***/ 469:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = translate;

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(71);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _hoistNonReactStatics = __webpack_require__(328);

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getDisplayName(component) {
  return component.displayName || component.name || 'Component';
}

function translate(namespaces) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$withRef = options.withRef,
      withRef = _options$withRef === undefined ? false : _options$withRef,
      _options$bindI18n = options.bindI18n,
      bindI18n = _options$bindI18n === undefined ? 'languageChanged loaded' : _options$bindI18n,
      _options$bindStore = options.bindStore,
      bindStore = _options$bindStore === undefined ? 'added removed' : _options$bindStore,
      _options$translateFun = options.translateFuncName,
      translateFuncName = _options$translateFun === undefined ? 't' : _options$translateFun;
  var _options$wait = options.wait,
      wait = _options$wait === undefined ? false : _options$wait;


  return function Wrapper(WrappedComponent) {
    var Translate = function (_Component) {
      _inherits(Translate, _Component);

      function Translate(props, context) {
        _classCallCheck(this, Translate);

        var _this = _possibleConstructorReturn(this, (Translate.__proto__ || Object.getPrototypeOf(Translate)).call(this, props, context));

        _this.i18n = context.i18n || props.i18n;
        namespaces = namespaces || _this.i18n.options.defaultNS;

        if (!wait && _this.i18n.options.wait) wait = _this.i18n.options.wait;

        _this.state = {
          i18nLoadedAt: null,
          ready: false
        };

        _this.onI18nChanged = _this.onI18nChanged.bind(_this);
        return _this;
      }

      _createClass(Translate, [{
        key: 'getChildContext',
        value: function getChildContext() {
          return _defineProperty({}, translateFuncName, this[translateFuncName]);
        }
      }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
          this[translateFuncName] = this.i18n.getFixedT(null, namespaces);
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this2 = this;

          var bind = function bind() {
            bindI18n && _this2.i18n.on(bindI18n, _this2.onI18nChanged);
            bindStore && _this2.i18n.store && _this2.i18n.store.on(bindStore, _this2.onI18nChanged);
          };

          this.mounted = true;
          this.i18n.loadNamespaces(namespaces, function () {
            var ready = function ready() {
              if (_this2.mounted) _this2.setState({ ready: true });
              if (wait && _this2.mounted) bind();
            };

            if (_this2.i18n.isInitialized) return ready();

            var initialized = function initialized() {
              // due to emitter removing issue in i18next we need to delay remove
              setTimeout(function () {
                _this2.i18n.off('initialized', initialized);
              }, 1000);
              ready();
            };
            _this2.i18n.on('initialized', initialized);
          });
          if (!wait) bind();
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          var _this3 = this;

          this.mounted = false;
          if (this.onI18nChanged) {
            if (bindI18n) {
              var p = bindI18n.split(' ');
              p.forEach(function (f) {
                return _this3.i18n.off(f, _this3.onI18nChanged);
              });
            }
            if (bindStore) {
              var _p = bindStore.split(' ');
              _p.forEach(function (f) {
                return _this3.i18n.store && _this3.i18n.store.off(f, _this3.onI18nChanged);
              });
            }
          }
        }
      }, {
        key: 'onI18nChanged',
        value: function onI18nChanged() {
          if (!this.mounted) return;

          this.setState({ i18nLoadedAt: new Date() });
        }
      }, {
        key: 'getWrappedInstance',
        value: function getWrappedInstance() {
          if (!withRef) {
            // eslint-disable-next-line no-console
            console.error('To access the wrapped instance, you need to specify ' + '{ withRef: true } as the second argument of the translate() call.');
          }

          return this.refs.wrappedInstance;
        }
      }, {
        key: 'render',
        value: function render() {
          var _extraProps;

          var _state = this.state,
              i18nLoadedAt = _state.i18nLoadedAt,
              ready = _state.ready;

          var extraProps = (_extraProps = { i18nLoadedAt: i18nLoadedAt }, _defineProperty(_extraProps, translateFuncName, this[translateFuncName]), _defineProperty(_extraProps, 'i18n', this.i18n), _extraProps);

          if (withRef) {
            extraProps.ref = 'wrappedInstance';
          }

          if (!ready && wait) return null;

          return _react2.default.createElement(WrappedComponent, _extends({}, this.props, extraProps));
        }
      }]);

      return Translate;
    }(_react.Component);

    Translate.WrappedComponent = WrappedComponent;

    Translate.contextTypes = {
      i18n: _propTypes2.default.object
    };

    Translate.childContextTypes = _defineProperty({}, translateFuncName, _propTypes2.default.func.isRequired);

    Translate.displayName = 'Translate(' + getDisplayName(WrappedComponent) + ')';

    Translate.namespaces = namespaces;

    return (0, _hoistNonReactStatics2.default)(Translate, WrappedComponent);
  };
}

/***/ }),

/***/ 470:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_createBrowserHistory__ = __webpack_require__(325);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_createBrowserHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_history_createBrowserHistory__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_router__ = __webpack_require__(6);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





/**
 * The public API for a <Router> that uses HTML5 history.
 */

var BrowserRouter = function (_React$Component) {
  _inherits(BrowserRouter, _React$Component);

  function BrowserRouter() {
    var _temp, _this, _ret;

    _classCallCheck(this, BrowserRouter);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.history = __WEBPACK_IMPORTED_MODULE_1_history_createBrowserHistory___default()(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
  }

  BrowserRouter.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_react_router__["Router"], { history: this.history, children: this.props.children });
  };

  return BrowserRouter;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

BrowserRouter.propTypes = {
  basename: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string,
  forceRefresh: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].bool,
  getUserConfirmation: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func,
  keyLength: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].number,
  children: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].node
};


/* harmony default export */ __webpack_exports__["a"] = (BrowserRouter);

/***/ }),

/***/ 471:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_createHashHistory__ = __webpack_require__(326);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_createHashHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_history_createHashHistory__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_router__ = __webpack_require__(6);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





/**
 * The public API for a <Router> that uses window.location.hash.
 */

var HashRouter = function (_React$Component) {
  _inherits(HashRouter, _React$Component);

  function HashRouter() {
    var _temp, _this, _ret;

    _classCallCheck(this, HashRouter);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.history = __WEBPACK_IMPORTED_MODULE_1_history_createHashHistory___default()(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
  }

  HashRouter.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_react_router__["Router"], { history: this.history, children: this.props.children });
  };

  return HashRouter;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

HashRouter.propTypes = {
  basename: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string,
  getUserConfirmation: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func,
  hashType: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].oneOf(['hashbang', 'noslash', 'slash']),
  children: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].node
};


/* harmony default export */ __webpack_exports__["a"] = (HashRouter);

/***/ }),

/***/ 472:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["MemoryRouter"]; });


/***/ }),

/***/ 473:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_router__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Link__ = __webpack_require__(253);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }





/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
var NavLink = function NavLink(_ref) {
  var to = _ref.to,
      exact = _ref.exact,
      strict = _ref.strict,
      activeClassName = _ref.activeClassName,
      className = _ref.className,
      activeStyle = _ref.activeStyle,
      style = _ref.style,
      getIsActive = _ref.isActive,
      rest = _objectWithoutProperties(_ref, ['to', 'exact', 'strict', 'activeClassName', 'className', 'activeStyle', 'style', 'isActive']);

  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1_react_router__["Route"], {
    path: (typeof to === 'undefined' ? 'undefined' : _typeof(to)) === 'object' ? to.pathname : to,
    exact: exact,
    strict: strict,
    children: function children(_ref2) {
      var location = _ref2.location,
          match = _ref2.match;

      var isActive = !!(getIsActive ? getIsActive(match, location) : match);

      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__Link__["a" /* default */], _extends({
        to: to,
        className: isActive ? [activeClassName, className].join(' ') : className,
        style: isActive ? _extends({}, style, activeStyle) : style
      }, rest));
    }
  });
};

NavLink.propTypes = {
  to: __WEBPACK_IMPORTED_MODULE_2__Link__["a" /* default */].propTypes.to,
  exact: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].bool,
  strict: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].bool,
  activeClassName: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string,
  className: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].string,
  activeStyle: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].object,
  style: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].object,
  isActive: __WEBPACK_IMPORTED_MODULE_0_react__["PropTypes"].func
};

NavLink.defaultProps = {
  activeClassName: 'active'
};

/* harmony default export */ __webpack_exports__["a"] = (NavLink);

/***/ }),

/***/ 474:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["Prompt"]; });


/***/ }),

/***/ 475:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["Redirect"]; });


/***/ }),

/***/ 476:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["Route"]; });


/***/ }),

/***/ 477:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["Router"]; });


/***/ }),

/***/ 478:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["StaticRouter"]; });


/***/ }),

/***/ 479:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["Switch"]; });


/***/ }),

/***/ 480:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["matchPath"]; });


/***/ }),

/***/ 481:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_router__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0_react_router__["withRouter"]; });


/***/ }),

/***/ 49:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BrowserRouter__ = __webpack_require__(470);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "BrowserRouter", function() { return __WEBPACK_IMPORTED_MODULE_0__BrowserRouter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__HashRouter__ = __webpack_require__(471);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "HashRouter", function() { return __WEBPACK_IMPORTED_MODULE_1__HashRouter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Link__ = __webpack_require__(253);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Link", function() { return __WEBPACK_IMPORTED_MODULE_2__Link__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MemoryRouter__ = __webpack_require__(472);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "MemoryRouter", function() { return __WEBPACK_IMPORTED_MODULE_3__MemoryRouter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__NavLink__ = __webpack_require__(473);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "NavLink", function() { return __WEBPACK_IMPORTED_MODULE_4__NavLink__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Prompt__ = __webpack_require__(474);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Prompt", function() { return __WEBPACK_IMPORTED_MODULE_5__Prompt__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Redirect__ = __webpack_require__(475);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Redirect", function() { return __WEBPACK_IMPORTED_MODULE_6__Redirect__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__Route__ = __webpack_require__(476);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Route", function() { return __WEBPACK_IMPORTED_MODULE_7__Route__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__Router__ = __webpack_require__(477);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Router", function() { return __WEBPACK_IMPORTED_MODULE_8__Router__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__StaticRouter__ = __webpack_require__(478);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "StaticRouter", function() { return __WEBPACK_IMPORTED_MODULE_9__StaticRouter__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__Switch__ = __webpack_require__(479);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Switch", function() { return __WEBPACK_IMPORTED_MODULE_10__Switch__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__matchPath__ = __webpack_require__(480);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "matchPath", function() { return __WEBPACK_IMPORTED_MODULE_11__matchPath__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__withRouter__ = __webpack_require__(481);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "withRouter", function() { return __WEBPACK_IMPORTED_MODULE_12__withRouter__["a"]; });



























/***/ }),

/***/ 516:
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),

/***/ 519:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.connected = connected;

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _htmlPurify = __webpack_require__(36);

var _htmlPurify2 = _interopRequireDefault(_htmlPurify);

var _auth = __webpack_require__(13);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _bucket = __webpack_require__(22);

var _bucket2 = _interopRequireDefault(_bucket);

var _loading = __webpack_require__(32);

var _loading2 = _interopRequireDefault(_loading);

var _reactI18next = __webpack_require__(12);

var _i18n = __webpack_require__(94);

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function connected(resp) {
    if (resp.pk) {
        _bucket2.default.clue = resp;
        this.props.history.push('/clue');
    } else {
        _bucket2.default.clue = null;
        alert(_i18n2.default.t("connect::I've nothing to say"));
        this.props.history.push('/map');
    }
}

var Connect = function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Connect);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Connect.__proto__ || Object.getPrototypeOf(Connect)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: {
                user: _auth.user,
                other: null
            }
        }), Object.defineProperty(_this, 'getProfile', {
            enumerable: true,
            writable: true,
            value: function value() {
                var t = _this.props.t;


                var self = _this;
                _api2.default.getProfile(self.props.match.params.pk).then(function (profile) {
                    if (!profile.username) {
                        alert(t('connect::Too far!'));
                        self.props.history.push('/map');
                    }
                    self.setState({ other: profile });
                });
            }
        }), Object.defineProperty(_this, 'goBack', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.props.history.push('/map');
            }
        }), Object.defineProperty(_this, 'connect', {
            enumerable: true,
            writable: true,
            value: function value() {
                _this.connectPlayer(_this.state.other.pk, _auth.user.activeEvent);
            }
        }), Object.defineProperty(_this, 'connectPlayer', {
            enumerable: true,
            writable: true,
            value: function value(id) {
                var ev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                var t = _this.props.t;

                var self = _this;
                ev = ev ? ev.pk : ev;
                _api2.default.connectPlayer(id, ev).then(function (resp) {
                    switch (resp.status) {
                        case 'connected':
                            connected(resp.clue);
                            break;
                        case 'step1':
                            self.props.history.push('/qrcapt/' + id + '/' + ev);
                            break;
                        case 'step2':
                            self.props.history.push('/qrcode/' + id + '/' + ev + '/' + resp.secret);
                            break;
                        default:
                            alert(t('connect::too far, get near'));
                            break;
                    }
                });
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Connect, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.getProfile();
        }
    }, {
        key: 'render',
        value: function render() {
            var t = this.props.t;

            var self = this;
            function createMarkup() {
                var purifier = new _htmlPurify2.default();
                var input = self.state.other.about || "";
                var result = purifier.purify(input);
                return { __html: result };
            }

            var icon = this.state.other ? (0, _auth.getIcon)(this.state.other) : '';

            return _react2.default.createElement(
                'div',
                { id: 'connect', className: 'container mbottom' },
                this.state.other ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'closebtn', onClick: this.goBack },
                        _react2.default.createElement('i', { className: 'fa fa-close' })
                    ),
                    _react2.default.createElement(
                        'h2',
                        { className: 'text-center' },
                        this.state.other.username
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'text-center' },
                        _react2.default.createElement('img', { src: icon })
                    ),
                    _react2.default.createElement('div', { className: 'text-center', dangerouslySetInnerHTML: createMarkup() }),
                    _react2.default.createElement(
                        'button',
                        { className: 'btn btn-fixed-bottom btn-primary', onClick: this.connect },
                        t('connect::Interact')
                    )
                ) : _react2.default.createElement(_loading2.default, null)
            );
        }
    }]);

    return Connect;
}(_react2.default.Component);

exports.default = (0, _reactI18next.translate)(['connect'], { wait: true })((0, _reactRouter.withRouter)(Connect));

/***/ }),

/***/ 71:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var factory = __webpack_require__(70);

var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
  Symbol.for &&
  Symbol.for('react.element')) ||
  0xeac7;

function isValidElement(object) {
  return typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE;
}

module.exports = factory(isValidElement);


/***/ }),

/***/ 94:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _i18next = __webpack_require__(353);

var _i18next2 = _interopRequireDefault(_i18next);

var _i18nextXhrBackend = __webpack_require__(343);

var _i18nextXhrBackend2 = _interopRequireDefault(_i18nextXhrBackend);

var _i18nextBrowserLanguagedetector = __webpack_require__(339);

var _i18nextBrowserLanguagedetector2 = _interopRequireDefault(_i18nextBrowserLanguagedetector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_i18next2.default.use(_i18nextXhrBackend2.default).use(_i18nextBrowserLanguagedetector2.default).init({
  detection: {
    order: ['navigator']
  },
  fallbackLng: 'en',
  nsSeparator: '::',
  keySeparator: ':::',

  backend: {
    loadPath: 'app/locales/{{lng}}/{{ns}}.json'
  },

  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  debug: false,

  interpolation: {
    escapeValue: false // not needed for react!!
  }
});

exports.default = _i18next2.default;

/***/ }),

/***/ 98:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(6);

var _api = __webpack_require__(17);

var _api2 = _interopRequireDefault(_api);

var _moment = __webpack_require__(0);

var _moment2 = _interopRequireDefault(_moment);

var _reactI18next = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventRow = function (_React$Component) {
    _inherits(EventRow, _React$Component);

    function EventRow() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, EventRow);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = EventRow.__proto__ || Object.getPrototypeOf(EventRow)).call.apply(_ref, [this].concat(args))), _this), Object.defineProperty(_this, 'state', {
            enumerable: true,
            writable: true,
            value: { joined: false, expand: false, solved: false }
        }), Object.defineProperty(_this, 'expand', {
            enumerable: true,
            writable: true,
            value: function value(e) {
                if (_this.state.expand) {
                    _this.setState({ expand: false });
                } else {
                    _this.setState({ expand: true });
                }
            }
        }), Object.defineProperty(_this, 'join', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                var self = _this;
                _api2.default.joinEvent(_this.props.ev.pk).then(function () {
                    self.setState({ joined: true });
                }).catch(function (error) {
                    alert(error);
                });
            }
        }), Object.defineProperty(_this, 'leave', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                var self = _this;
                _api2.default.leaveEvent(_this.props.ev.pk).then(function () {
                    self.setState({ joined: false });
                }).catch(function (error) {
                    alert(error);
                });
            }
        }), Object.defineProperty(_this, 'play', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                _this.props.history.push('/map/' + ev.pk);
            }
        }), Object.defineProperty(_this, 'admin', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                _this.props.history.push('/admin/' + ev.pk);
            }
        }), Object.defineProperty(_this, 'price', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                if (_this.props.hiddenbuttons) {
                    return _react2.default.createElement('span', null);
                }

                if (parseFloat(ev.price)) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'badge price pull-right' },
                        _react2.default.createElement('i', { className: 'fa fa-money' }),
                        ' ',
                        parseFloat(ev.price)
                    );
                }
                return _react2.default.createElement(
                    'div',
                    { className: 'badge price free pull-right' },
                    'free'
                );
            }
        }), Object.defineProperty(_this, 'maxp', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                if (parseInt(ev.max_players)) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'max badge pull-right' },
                        _react2.default.createElement('i', { className: 'fa fa-users' }),
                        ' ',
                        ev.max_players
                    );
                }
                return '';
            }
        }), Object.defineProperty(_this, 'buttons', {
            enumerable: true,
            writable: true,
            value: function value(ev) {
                var t = _this.props.t;

                if (_this.props.hiddenbuttons) {
                    return null;
                }

                return _react2.default.createElement(
                    'div',
                    { className: 'btn-group btn-group-justified', role: 'group', 'aria-label': '...' },
                    _this.state.joined ? [_react2.default.createElement(
                        'a',
                        { onClick: _this.play.bind(_this, ev), className: 'btn btn-success' },
                        _react2.default.createElement('i', { className: 'fa fa-gamepad' }),
                        ' ',
                        t('events::Play')
                    ), _react2.default.createElement(
                        'a',
                        { onClick: _this.leave.bind(_this, ev), className: 'btn btn-danger' },
                        _react2.default.createElement('i', { className: 'fa fa-sign-out' }),
                        ' ',
                        t('events::Leave')
                    )] : _react2.default.createElement(
                        'a',
                        { onClick: _this.join.bind(_this, ev), className: 'btn btn-success' },
                        _react2.default.createElement('i', { className: 'fa fa-sign-in' }),
                        ' ',
                        t('events::Join')
                    ),
                    ev.admin && _react2.default.createElement(
                        'a',
                        { onClick: _this.admin.bind(_this, ev), className: 'btn btn-primary' },
                        _react2.default.createElement('i', { className: 'fa fa-sign-cog' }),
                        ' ',
                        t('events::Admin')
                    )
                );
            }
        }), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(EventRow, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.setState({ joined: this.props.ev.joined, solved: this.props.ev.solved });
        }
    }, {
        key: 'shortDesc',
        value: function shortDesc() {
            if (!this.props.expand && !this.state.expand) {
                return _react2.default.createElement(
                    'p',
                    { className: 'small' },
                    this.props.ev.game.name
                );
            }

            return _react2.default.createElement('div', null);
        }
    }, {
        key: 'renderDesc',
        value: function renderDesc() {
            if (!this.props.expand && !this.state.expand) {
                return _react2.default.createElement('div', null);
            }

            return _react2.default.createElement(
                'div',
                { className: 'eventdesc' },
                _react2.default.createElement(
                    'div',
                    { className: 'jumbotron' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        this.props.ev.game.name
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        this.props.ev.game.desc
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'dates' },
                    _react2.default.createElement(
                        'div',
                        { className: 'start label label-default' },
                        (0, _moment2.default)(this.props.ev.start_date).format('lll')
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'end pull-right label label-danger' },
                        (0, _moment2.default)(this.props.ev.end_date).format('lll')
                    )
                ),
                _react2.default.createElement('div', { className: 'clearfix' }),
                this.buttons(this.props.ev)
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var classes = 'event';
            if (this.state.joined) {
                classes += ' joined';
            }
            if (this.state.solved) {
                classes += ' solved';
            }

            return _react2.default.createElement(
                'div',
                { className: classes, onClick: this.expand.bind(this) },
                this.price(this.props.ev),
                this.maxp(this.props.ev),
                _react2.default.createElement(
                    'h2',
                    null,
                    this.props.ev.name
                ),
                _react2.default.createElement(
                    'p',
                    { className: 'desc' },
                    ' ',
                    this.shortDesc(),
                    ' '
                ),
                this.renderDesc()
            );
        }
    }]);

    return EventRow;
}(_react2.default.Component);

exports.default = EventRow = (0, _reactI18next.translate)(['events'], { wait: true })((0, _reactRouter.withRouter)(EventRow));

/***/ })

},[276]);