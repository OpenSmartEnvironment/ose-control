'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var L = O.link;
var Pin = O.class('./pin');
var Switch = O.class('./switch');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light kind
 *
 * @readme
 * [Entry kind] defining behaviour of lights. Each light consists of
 * channels. Each channel is controlled by some `master`
 * controller. It is possible to use dimming when the controller
 * supports it. This component allows to easily create lights composed
 * of LED strips that can smoothly change the colour and intensity,
 * and do any other effects.
 *
 * @description
 * ## Description
 * Each light channel can be controlled either through a digital
 * output pin or a pin supporting PWO. Smooth changes of light
 * intensity can be controlled through the `speed` value, which
 * defines the time in milliseconds it takes change the light
 * intensity from 0 to 100% or vice versa.
 *
 * Each light supports auto-off timeout since last change with
 * configurable dim speed.
 *
 * Every light can be controlled by a [switch entry] with the
 * following behaviour:
 * - One tap when shining: Switch the light off.
 * - One tap when off: Switch to the default configurable value.
 * - Two taps: Switch the light fully on.
 * - Hold: Switch the light off.
 *
 * @aliases light lights lightEntry lightEntryKind
 * @class control.lib.light
 * @extend ose.lib.kind
 * @type class
 */

/**
 * Light channels
 *
 * A light entry can consist of one or more channels. An example light
 * can have 3 LED strips (warm white, cold white and RGB). The entry
 * describing such a light consists of 5 independently controllable
 * channels (warm, cold, red, green and blue).
 *
 * Each property of `data.channels` is one channel. The key is a
 * channel name and the value is the pin index on the `data.master`
 * controller.
 *
 * @example
 *     data.channels = {
 *       warm: 0,
 *       cold: 1,
 *       red: 2,
 *       green: 3,
 *       blue: 4
 *     }
 *
 * @property data.channels
 * @type Object
 */

/**
 * Controller entry identification object.
 *
 * The light entry establishes a new link to the controller.
 *
 * @property data.master
 * @type String | Object
 */

/**
 * Each property of this object defines one profile of the
 * light. There are predefined profiles `"off"`, `"on"` and `"full"`.
 *
 * Default values are:
 * - `"off": 0`
 * - `"on": O.consts.lightDefaultOn`
 * - `"full": 1`
 *
 * @property data.profiles
 * @type Object
 */

/**
 * Switch entry identification object.
 *
 * If specified, the light establishes a new link to a switch and gets
 * controlled by it.
 *
 * @property data.switch
 * @type String | Object
 */

/**
 * Auto off value
 *
 * Defines how long the light will wait before it starts dimming and
 * the speed of the dimming. The auto off timer is enabled each time
 * any light channel is changed.
 *
 * The value can be one of the following:
 * - `true`: Enable auto off with default values
 * - `false`: Disable auto off
 * - Number: Wait timeout in seconds
 * - Object: `{wait: <seconds>, speed: <milliseconds>}`
 *
 * Default values:
 * - `data.autoOff.wait: O.consts.lightAutoOffWait`
 * - `data.autoOff.speed: O.consts.lightAutoOffSpeed`
 *
 * @property data.autoOff
 * @type Boolean | Number | Object
 */

// Public  {{{1
exports.init = function() {  // {{{2
  this.on('set', set);
  this.on('lock', lock);
  this.on('stop', stop);
  this.on('delta', delta);
  this.on('update', update);
  this.on('profile', profile);
  this.on('autoOff', autoOff);
};

exports.inView = function(entry, params) {  // {{{2
  if (params.filter) {
    if ('turned' in params.filter) {
      return params.filter.turned === entry.state.main;
    }
  }

  return true;
};

exports.homeInit = function(entry) {  // {{{2
  entry.on('state', onState.bind(entry));

  entry.queueStateTimeout = 1;

  entry.channels = {};

  entry.state = {
    main: 'off',
    channels: {}
  };

  if (entry.data) {
    if (entry.data.channels) {
      if (entry.data.pin) {
        O.log.warning('Ignoring pin!', {entry: entry.identify(), pin: entry.data.pin});
      }

      for (var key in entry.data.channels) {
        new Pin(
          entry,
          key,
          entry.data.channels[key]
        );
      }
    } else if (entry.data.pin) {
      new Pin(entry, 'single', entry.data.pin);
    }

    if (entry.data.switch) {
      // Creates a client socket
      if (Array.isArray(entry.data.switch)) {
        for (var i = 0; i < entry.data.switch.length; i++) {
          new Switch(entry, entry.data.switch[i]);
        }
      } else {
        new Switch(entry, entry.data.switch);
      }
    }
  }

//  console.log('LIGHT HARBOUR INITED', entry.id, entry.state);
};

// }}}1
// Commands {{{1
function profile(req, socket) {  // {{{2
/**
 * Sets light profile.
 *
 * @param req {Object|String} Sets the light profile to the value specified. Simple profile name can be specified.
 * @param req.name {String} Profile name
 * @param [req.speed] {Number} Speed of change
 *
 * @method profile
 * @handler
 */

//  console.log('LIGHT PROFILE', req);

  if (testLock(this, socket)) return;

  var e = this.entry;

  if (typeof req !== 'object') {
    req = {name: req};
  } else if (req === null) {
    req = {name: 'off'};
  }

  switch (req.name) {
  case 1:
  case true:
    req.name = 'on';
    break;
  case undefined:
  case 0:
  case false:
    req.name = 'off';
    break;
  case 'switch':
    if (almostOff(e)) {
      req.name = 'on';
      break;
    }

    req.name = 'off';
    break;
  }

  var p = e.data.profiles && e.data.main[req.name];
  if (p === undefined) {
    switch (req.name) {
    case 'off':
      p = 0;
      break;
    case 'on':
      p = 0.2;
      break;
    case 'full':
      p = 1;
      break;
    }
  }

  switch (typeof p) {
  case 'number':
    for (var key in e.channels) {
      L.send(e.channels[key], 'write', {
        value: p,
        speed: sp(),
      }, null, true);
    }
    L.close(socket);
    return;
  case 'object':
    for (var key in e.channels) {
      if (key in p) {
        var c = p[key];
        if (typeof c !== 'object') {
          c = {value: c};
        }

        L.send(e.channels[key], 'write', {
          value: c.value,
          speed: sp(c.speed),
        }, null, true);
      } else {
        L.send(e.channels[key], 'write', {
          value: 0,
          speed: sp(),
        }, null, true);
      }
    }
    L.close(socket);
    return;
  }

  L.error(socket, O.error(e, 'Invalid profile', req));
  return;

  function sp(val) {  // {{{3
    if (typeof val === 'number') {
      return val;
    }

    if (typeof req.speed === 'number') {
      return req.speed;
    }

    return O.consts.lightDimSpeed;
  }

  // }}}3
};

function set(req, socket) {  // {{{2
/**
 * Sets all channels.
 *
 * @param req {Number | Object} Sets the light to the value specified. `req` can be one of the following:
 * - Number: Switch all channels to this value. It should be number between 0 .. 1
 * - Object: Sets channels to requested value. Channels not listed will be switched off
 *
 * @param socket {Object} Response [socket]
 *
 * @method set
 * @handler
 */

//  console.log('LIGHT SET', req);

  if (testLock(this, socket)) return;

  var e = this.entry;

  switch (typeof req) {
  case 'object':
    break;
  case 'number':
    if ((req >= 0) && (req <= 1)) break;
  default:
    L.error(socket, O.error(e, 'Invalid request', req));
    return;
  }

  switch (typeof req) {
  case 'number':
    for (var key in e.channels) {
      L.send(e.channels[key], 'write', {
        value: req,
        speed: O.consts.lightDimSpeed,
      }, null, true);
      /*
      e.channels[key].link.update({
        value: req,
        speed: O.consts.lightDimSpeed,
      });
      */
    }
    L.close(socket);
    return;
  case 'object':
    for (var key in e.channels) {
      var a = {
        index: e.state.channels[key].pin,
        speed: O.consts.lightDimSpeed,
      };

      if (key in req) {
        a.value = req[key];
      } else {
        a.value = 0;
      }

      L.send(e.channels[key], 'write', a, null, true);
//      e.channels[key].link.update(a);
    }
    L.close(socket);
    return;
  }

  L.error(socket, O.error(e, 'Invalid arguments', req));
  return;
};

function stop(req, socket) {  // {{{2
/**
 * Keep all channels at their current value.
 *
 * @param [req] {*} Unused
 * @param socket {Object} Response [socket]
 *
 * @method set
 * @handler
 */

//  console.log('LIGHT SET', req);

  if (testLock(this, socket)) return;

  var e = this.entry;

  for (var key in e.channels) {
    L.send(e.channels[key], 'write', {value: 'stop'}, null, true);
    /*
    e.channels[key].link.update({
      value: 'stop',
    });
    */
  }

  L.close(socket);
};

function delta(req, socket) {  // {{{2
/**
 * Update requested channels.
 *
 * @param req {String | Number} Delta
 * @param socket {Object} Response [socket]
 *
 * @method delta
 * @handler
 */

//  console.log('LIGHT DELTA', req, this.entry.state);

  if (testLock(this, socket)) return;

  var e = this.entry;

  if (typeof req !== 'object') {
    req = {value: req};
  }

  if (! ('speed' in req)) {
    req.speed = O.consts.lightDimSpeed;
  }

  switch (req.value) {
  case 'more':
    req.value = 0.05;
    break;
  case 'less':
    req.value = -0.05;
    break;
  }

  if ((typeof req.value !== 'number') || isNaN(req.value)) {
    L.error(socket, O.error(e, 'Invalid arguments', req));
    return;
  }

  if (almostOff(e)) {
    if (req.value < 0) {
      L.close(socket);
      return;
    }

    switch (typeof (e.data.profiles && e.data.main.on || 0)) {
    case 'number':
      for (var key in e.channels) {
        L.send(e.channels[key], 'write', {
          value: e.state.channels[key].value + req.value,
          speed: req.speed,
        }, null, true);
      }
      return;
    case 'object':
      for (var key in e.data.profiles.on) {
        L.send(e.channels[key], 'write', {
          value: e.state.channels[key].value + req.value,
          speed: req.speed,
        }, null, true);
      }
      return;
    }

    throw O.error(e, 'INVALID', 'Invalid main on', e.data.profiles.on);
  }

  var now = O._.now();
  for (var key in e.channels) {
    var c = e.state.channels[key];
    var v = c.value;

    if ('aim' in c) {
      if (c.aim === null) {
        O.log.error(O.error(e, 'NOT_EXPECTED', 'State should never be null!', JSON.stringify({channel: key, state: e.state}, null, 2)));
      } else {
        v = c.value + (c.aim - c.value) * ((now - c.at) / c.time);
      }
    }

    if (v) {
      v += req.value;
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }

      L.send(e.channels[key], 'write', {
        value: v,
        speed: req.speed,
      }, null, true);
    }
  }
  return;
};

function update(req, socket) {  // {{{2
/**
 * Update requested channels.
 *
 * @param req {Number|Object} List of channels with their requested values.
 * @param socket {Object} Response [socket]
 *
 * @method update
 * @handler
 */

  if (testLock(this, socket)) return;

  var e = this.entry;

//  console.log('LIGHT UPDATE', req, e.state);

  switch (typeof req) {
  case 'number':
    switch (typeof (e.data.profiles && e.data.main.on || 0)) {
    case 'number':
      for (var key in e.channels) {
        L.send(e.channels[key], 'write', {
          value: req,
          speed: 5000,
        }, null, true);
      }
      return;
    case 'object':
      for (var key in e.data.profiles.on) {
        L.send(e.channels[key], 'write', {
          value: req,
          speed: 5000,
        }, null, true);
      }
      return;
    }

    L.error(socket, O.error(e, 'Invalid profile "on"!', e.data.profiles));
    return;
  case 'object':
    for (var key in req) {
      if (! (key in e.channels)) {
        L.error(socket, O.error(e, 'Invalid channel!', {request: req, channel: key}));
        return;
      }

      var a = req[key];
      var c = e.channels[key];

      if (typeof a === 'object') {
        L.send(c, 'write', {
          value: a.value,
          speed: a.speed,
        }, null, true);
      } else {
        L.send(c, 'write', {value: a}, null, true);
      }
    }
    return;
  }

  L.error(socket, O.error(e, 'Invalid arguments', req));
  return;
};

function lock(req, socket) {  // {{{2
/**
 * Lock or unlock a light. Locked light cannot be changed via its command handlers.
 *
 * @param [req] {Boolean} Unused
 * @param socket {Object} Response [socket]
 *
 * @method lock
 * @handler
 */

  var e = this.entry;

  if (typeof req !== 'boolean') {
    L.error(socket, O.error(e, 'Request should be boolean!'));
    return;
  }

  if (req) {
    e.setState({locked: true});
    clearOff(e);
  } else {
    e.setState({locked: null});
    setupOff(e);
  }

  L.close(socket);
};

function autoOff(req, socket) {  // {{{2
/**
 * Change auto off behaviour.
 *
 * @param req {Boolean | Number | Object} Auto off configuration conforming to data.autoOff.
 * @param socket {Object} Response [socket]
 *
 * @method autoOff
 * @handler
 */

  if (testLock(this, socket)) return;

  switch (req) {
  case undefined:
  case null:
  case false:
  case 0:
    clearOff(this.entry);
    break;
  case true:
    setupOff(this.entry);
    break;
  default:
    setupOff(this.entry, req);
    break;
  }

  L.close(socket);
};

// }}}1
// Event handlers {{{1
function onState(data) {  // {{{2
  if (! ('channels' in data)) return;

  var main = 'off';

  for (var key in this.channels) {
    var c = this.state.channels[key];
    if (! c) continue;

    if (c.aim === 0) {
      main = 'dim';
    } else if ((c.value > 0) || (c.aim > 0)) {
      main = 'on';
      break;
    }
  }

  this.setState({main: main});

  switch (main) {
  case 'off':
  case 'dim':
    clearOff(this);
    return;
  case 'on':
    setupOff(this);
    return;
  }

  throw O.error(this, 'invalidMain', main);
};

// }}}1
// Private {{{1
function almostOff(entry) {  // {{{2
  switch (entry.state.main) {
  case 'on':
    return false;
  case 'off':
    return true;
  case 'dim':
    var now = O._.now();
    for (var key in entry.state.channels) {
      var c = entry.state.channels[key];

      if ((c.aim === 0) && ((c.at + c.time - now) > 20000)) {
        return false;
      }
    }

    return true;
  }

  throw O.error(entry, 'INVALID', 'Invalid main', entry.state.main);
};

function clearOff(entry) {  // {{{2
//  console.log('CLEAR OFF TIMEOUT');

  if (entry.offTimeout) {
    clearTimeout(entry.offTimeout);
    delete entry.offTimeout;
  }

  entry.setState({autoOff: null});
};

function setupOff(entry, data) {  // {{{2
  clearOff(entry);

  if (entry.state.main === 'off') {
    return;
  }

//  console.log('SETUP OFF TIMEOUT', data);

  var wait;
  var speed;

  if (! data) {
    data = entry.data.autoOff;
    if (! data) {
      return;
    }
  }

  switch (typeof data) {
  case 'number':
    wait = data * 1000;
    speed = O.consts.lightAutoOffSpeed;
    break;
  case 'boolean':
    wait = O.consts.lightAutoOffWait;
    speed = O.consts.lightAutoOffSpeed;
    break;
  case 'object':
    wait = data.wait * 1000;
    speed = data.speed;
    break;
  default:
    O.log.error(O.error(this, 'invalidAutoOff', data));
    return;
  }

  entry.offTimeout = setTimeout(onTime, wait);
  entry.setState({autoOff: {
    start: new Date().getTime(),
    wait: wait,
    speed: speed,
  }});

  return;

  function onTime() {  // {{{3
//    console.log('LIGHT AUTOOFF', speed);

    delete entry.offTimeout;

    for (var key in entry.channels) {
      var s = entry.state.channels[key];
      if (s && (s.value || s.time)) {
        L.send(entry.channels[key], 'write', {
          value: 0,
          speed: speed,
        }, null, true);
      }
    }
  };

  // }}}3
};

function testLock(src, socket) {  // {{{ 2
  if (src.entry.state.locked) {
    L.close(socket, 'locked');
    return true;
  }

  return false;
};

// }}}1


