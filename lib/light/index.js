'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'light');

var Consts = O.consts('control');
var L = O.link;
var Pin = O.getClass('./pin');
var Switch = O.getClass('./switch');

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
 * output pin or a pin supporting PWM. Smooth changes of light
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
 * @kind light
 * @schema control
 * @class control.lib.light
 * @extend ose.lib.kind
 * @type class
 */

// Public  {{{1
exports.role = ['pin', 'light'];

exports.ddef = O.new('ose/lib/field/object')()  // {{{2
  .text('name')  // {{{3
  /**
   * Light name
   *
   * @property dval.name
   * @type String
   */
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('parent')  // {{{3
    .detail(10.5)
    .parent

  .entry('master')  // {{{3
  /**
   * Controller entry identification object
   *
   * The light entry establishes a new link to the controller.
   *
   * @property dval.master
   * @type Object
   */
    .detail(10.5)
    .parent

  .text('pinType')  // {{{3
  /**
   * Controller pin type, possible values are: ('dout' | 'pwm')
   *
   * @property dval.pinType
   * @type String
   */
    .detail(10.5)
    .parent

  .map('channels')  // {{{3
  /**
   * Light channels
   *
   * A light entry can consist of one or more channels. An example light
   * can have 3 LED strips (warm white, cold white and RGB). The entry
   * describing such a light consists of 5 independently controllable
   * channels (warm, cold, red, green and blue).
   *
   * Each property of `dval.channels` is one channel. The key is a
   * channel name and the value is the pin index on the `dval.master`
   * controller.
   *
   * @example
   *     dval.channels = {
   *       warm: 0,
   *       cold: 1,
   *       red: 2,
   *       green: 3,
   *       blue: 4
   *     }
   *
   * @property dval.channels
   * @type Object
   */
    .integer().parent
    .detail(5)
    .parent

  .list('switches')  // {{{3
  /**
   * Switches entry identification objects
   *
   * If specified, the light establishes a new link to a switch and gets
   * controlled by it.
   *
   * @property dval.switch
   * @type String | Object
   */
    .entry().parent
//    .detail(13)
    .parent

  .object('autoOff')  // {{{3
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
   * - `dval.autoOff.wait: Consts.lightAutoOffWait`
   * - `dval.autoOff.speed: Consts.lightAutoOffSpeed`
   *
   * @property dval.autoOff
   * @type Boolean | Number | Object
   */
//    .millitime('wait').detail(14).parent
//    .integer('speed').detail(14).parent
    .parent

  .object('profiles')  // {{{3
  /**
   * Each property of this object defines one profile of the
   * light. There are predefined profiles `"off"`, `"on"` and `"full"`.
   *
   * Default values are:
   * - `"off": 0`
   * - `"on": Consts.lightDefaultOn`
   * - `"full": 1`
   *
   * @property dval.profiles
   * @type Object
   */
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/field/object')()  // {{{2
  .text('main').detail(1, mainDetail).parent
  .object('autoOff')
    .params({post: 'autoOff'})
    .detail(3, autoOffDetail)
//    .millitime('start').parent
    .parent
  .boolean('locked')
    .detail(4, {post: 'lock'})
    .parent
  .map('channels')
    .detail(5.5, channelsDetail)
    .parent
;

exports.layout('listItem', {  // {{{2
  displayLayout: function() {
    var that = this;

    this
      .empty()
      .addClass('row')
      .on('tap', this.tapItem.bind(this))
      .h3(this.entry.getCaption(), 'stretch')
      .onoff({
        value: this.entry.sval && this.entry.sval.main === 'on' ? 1 : 0,
        input: function(ev) {
          that.post('profile', ev.value ? 'on' : 'off');
        },
      })
    ;
  },
  patch: function(val) {
    val = val && val.spatch;

    if (val && 'main' in val) {
      this.find('span.buttons').val(val.main === 'on' ? 1 : 0);
    }
  },
});

exports.homeInit = function(entry) {  // {{{2
  entry.on('sval', onState.bind(entry));

  entry.channels = {};

  entry.sval = {
    main: 'off',
    channels: {}
  };

  if (! entry.dval) return;

  if (entry.dval.channels) {
    for (var key in entry.dval.channels) {
      new Pin(
        entry,
        key,
        entry.dval.pinType || 'dout',
        entry.dval.channels[key]
      );
    }
  }

  if (entry.dval.switches) {
    if (Array.isArray(entry.dval.switches)) {
      for (var i = 0; i < entry.dval.switches.length; i++) {
        new Switch(entry, entry.dval.switches[i]);
      }
    } else {
      O.log.error(this, 'Invalid "switches"');
    }
  }
};

exports.matchQuery = function(entry, params) {  // {{{2
  if (params.filter) {
    if ('turned' in params.filter) {
      return params.filter.turned === entry.sval.main;
    }
  }

  return true;
};

// Command handlers {{{1
exports.on('profile', function(req, socket) {  // {{{2
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

  var p = e.dval.profiles && e.dval.profiles[req.name];
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
      if (L.canSend(e.channels[key])) {
        L.send(e.channels[key], 'write', {
          value: p,
          speed: sp(),
        });
      }
    }
    L.close(socket);
    return;
  case 'object':
    for (var key in e.channels) {
      if (! L.canSend(e.channels[key])) {
        continue;
      }

      if (key in p) {
        var c = p[key];
        if (typeof c !== 'object') {
          c = {value: c};
        }

        L.send(e.channels[key], 'write', {
          value: c.value,
          speed: sp(c.speed),
        });
      } else {
        L.send(e.channels[key], 'write', {
          value: 0,
          speed: sp(),
        });
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

    return Consts.lightDimSpeed;
  }

  // }}}3
});

exports.on('set', function(req, socket) {  // {{{2
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
      if (L.canSend(e.channels[key])) {
        L.send(e.channels[key], 'write', {
          value: req,
          speed: Consts.lightDimSpeed,
        });
      }
      /*
      e.channels[key].link.update({
        value: req,
        speed: Consts.lightDimSpeed,
      });
      */
    }
    L.close(socket);
    return;
  case 'object':
    for (var key in e.channels) {
      if (! L.canSend(e.channels[key])) {
        continue;
      }

      var a = {
        index: e.sval.channels[key].pin,
        speed: Consts.lightDimSpeed,
      };

      if (key in req) {
        a.value = req[key];
      } else {
        a.value = 0;
      }

      L.send(e.channels[key], 'write', a);
//      e.channels[key].link.update(a);
    }
    L.close(socket);
    return;
  }

  L.error(socket, O.error(e, 'INVALID_ARGS', req));
  return;
});

exports.on('stop', function(req, socket) {  // {{{2
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
    if (L.canSend(e.channels[key])) {
      L.send(e.channels[key], 'write', {value: 'stop'});
    }
  }

  L.close(socket);
});

exports.on('delta', function(req, socket) {  // {{{2
/**
 * Update requested channels.
 *
 * @param req {String | Number} Delta
 * @param socket {Object} Response [socket]
 *
 * @method delta
 * @handler
 */

//  console.log('LIGHT DELTA', req, this.entry.sval);

  if (testLock(this, socket)) return;

  var e = this.entry;

  if (typeof req !== 'object') {
    req = {value: req};
  }

  if (! ('speed' in req)) {
    req.speed = Consts.lightDimSpeed;
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
    L.error(socket, O.error(e, 'INVALID_ARGS', req));
    return;
  }

  if (almostOff(e)) {
    if (req.value < 0) {
      L.close(socket);
      return;
    }

    switch (typeof (e.dval.profiles && e.dval.profiles.on || 0)) {
    case 'number':
      for (var key in e.channels) {
        if (L.canSend(e.channels[key])) {
          L.send(e.channels[key], 'write', {
            value: e.sval.channels[key].value + req.value,
            speed: req.speed,
          });
        }
      }
      return;
    case 'object':
      for (var key in e.dval.profiles.on) {
        if (L.canSend(e.channels[key])) {
          L.send(e.channels[key], 'write', {
            value: e.sval.channels[key].value + req.value,
            speed: req.speed,
          });
        }
      }
      return;
    }

    throw O.log.error(e, 'INVALID', 'Invalid profile on', e.dval.profiles.on);
  }

  var now = Date.now();
  for (var key in e.channels) {
    if (! L.canSend(e.channels[key])) {
      continue;
    }

    var c = e.sval.channels[key];
    var v = c.value;

    if ('aim' in c) {
      if (c.aim === null) {
        O.log.error(e, 'NOT_EXPECTED', 'State should never be null!', JSON.stringify({channel: key, sval: e.sval}, null, 2));
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
      });
    }
  }
  return;
});

exports.on('update', function(req, socket) {  // {{{2
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

//  console.log('LIGHT UPDATE', req, e.sval);

  switch (typeof req) {
  case 'number':
    switch (typeof (e.dval.profiles && e.dval.profiles.on || 0)) {
    case 'number':
      for (var key in e.channels) {
        if (L.canSend(e.channels[key])) {
          L.send(e.channels[key], 'write', {
            value: req,
            speed: 5000,
          });
        }
      }
      L.close(socket);
      return;
    case 'object':
      for (var key in e.dval.profiles.on) {
        if (L.canSend(e.channels[key])) {
          L.send(e.channels[key], 'write', {
            value: req,
            speed: 5000,
          });
        }
      }
      L.close(socket);
      return;
    }

    L.error(socket, O.error(e, 'Invalid profile "on"!', e.dval.profiles));
    return;
  case 'object':
    for (var key in req) {
      if (! (key in e.channels)) {
        L.error(socket, O.error(e, 'Invalid channel!', {request: req, channel: key}));
        return;
      }

      if (! L.canSend(e.channels[key])) {
        continue;
      }

      var a = req[key];
      var c = e.channels[key];

      if (typeof a === 'object') {
        L.send(c, 'write', {
          value: a.value,
          speed: a.speed,
        });
      } else {
        L.send(c, 'write', {value: a});
      }
    }

    L.close(socket);
    return;
  }

  L.error(socket, O.error(e, 'INVALID_ARGS', req));
  return;
});

exports.on('lock', function(req, socket) {  // {{{2
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
});

exports.on('autoOff', function(req, socket) {  // {{{2
/**
 * Change auto off behaviour.
 *
 * @param req {Boolean | Number | Object} Auto off configuration conforming to dval.autoOff.
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
});

// Event handlers {{{1
function onState(val) {
  if (! ('channels' in val)) return;

  var main = 'off';

  for (var key in this.channels) {
    var c = this.sval.channels[key];
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

  throw O.log.error(this, 'INVALID_ARGS', main);
};

// Private {{{1
function mainDetail(view, wrap) {  // {{{2
  view.li('row')
    .h3('Overall state', 'stretch')
    .tree('i', 'button text', wrap)
  ;

  view.li('row')
    .h3('Turn', 'stretch')
    .buttons('text', ['off', 'on', 'full'], {relation: 'single'}, function(val) {
      view.post('profile', val.value);
    })
  ;
}

function autoOffDetail(view, wrap) {  // {{{2
  var li = view.li();

  li.section('row')
    .section('stretch')
      .h3('Auto off')
      .p(undefined)
      .parent()
    .checkbox({
      field: wrap,
    })
  ;

  wrap.on('patch', function(patch) {
//    wrap.view.val(Boolean(patch));

    if (! wrap.value) {
      if (wrap.countdown) {
        clearInterval(wrap.countdown);
        wrap.countdown = undefined;
      }

      li.find('p').hide();
      return;
    }

    wrap.counttime = Math.round((wrap.value.wait + wrap.value.start + view.entry.shard.homeTimeOffset - Date.now()) / 1000);

    if (! wrap.countdown) {
      var span = li.find('p')
        .empty()
        .append2('Auto off in <span class="countdown">' + wrap.counttime + '</span> seconds')
        .show()
        .find('span.countdown')
      ;

      wrap.countdown = setInterval(function() {
        span.text(--wrap.counttime);
      }, 1000);
    }
  });
}

function channelsDetail(view, wrap) {  // {{{2
  var type;
  var ul = view.find('li.divider>ul');

  wrap.on('patch', function(patch) {
    type = view.entry.dval.pinType || 'dout';

    if (patch === null) {
      ul.eachChild(function(child) {
        clean(child);
      });
      return;
    }

    for (var key in patch) {
      displayKey(ul.find('li[mapkey="' + key + '"]'), key, patch[key]);
    }
    return;
  });

  function displayKey(li, key, patch) {
    if (! li) return;

    if (patch === null || ! wrap.value[key].synced) {
      clean(li);
      return;
    }

    li.find('p').hide();

    switch (type) {
    case 'dout':
      if ('value' in patch) {
        var buttons = li.find('.buttons') ||
          li.find('.row').tree('onoff', undefined, onButtons.bind(null, key))
        ;

        buttons.val(patch.value);
      }
      return;
    case 'pwm':
      if ('value' in patch) {
        var slider = li.find('.slider') ||
          li.tree('slider', undefined, onSlider.bind(null, key))
        ;

        slider.val(patch.value);
      }
      return;
    }
  };

  function clean(li) {
    var el = li.find('.slider');
    if (el) el.remove();

    el = li.find('.buttons');
    if (el) el.remove();

    li.find('p').show();
  }

  function onSlider(key, val) {
    var cmd = {};
    cmd[key] = {value: val.value};
    view.post('update', cmd);
  }

  function onButtons(key, val) {
    var cmd = {};
    cmd[key] = {value: val.value};
    view.post('update', cmd);
  }
}

function almostOff(entry) {  // {{{2
  switch (entry.sval.main) {
  case 'on':
    return false;
  case 'off':
    return true;
  case 'dim':
    var now = Date.now();
    for (var key in entry.sval.channels) {
      var c = entry.sval.channels[key];

      if ((c.aim === 0) && ((c.at + c.time - now) > 20000)) {
        return false;
      }
    }

    return true;
  }

  throw O.log.error(entry, 'INVALID_ARGS', 'Invalid main', entry.sval.main);
}

function clearOff(entry) {  // {{{2
  if (entry.offTimeout) {
    clearTimeout(entry.offTimeout);
    delete entry.offTimeout;
  }

  setAutoOffState(entry, null);
}

function setAutoOffState(entry, val) {
  if (entry.autoOffTimeout) {
    clearTimeout(entry.autoOffTimeout);
  }

  entry.autoOffTimeout = setTimeout(function() {
    delete entry.autoOffTimeout;
    entry.setState({autoOff: val});
  }, 1000);
}

function setupOff(entry, val) {  // {{{2
  clearOff(entry);

  if (entry.sval.main === 'off') {
    return;
  }

  var wait;
  var speed;

  if (! val) {
    val = entry.dval.autoOff;
    if (! val) {
      return;
    }
  }

  switch (typeof val) {
  case 'number':
    wait = val * 1000;
    speed = Consts.lightAutoOffSpeed;
    break;
  case 'boolean':
    wait = Consts.lightAutoOffWait;
    speed = Consts.lightAutoOffSpeed;
    break;
  case 'object':
    wait = val.wait * 1000;
    speed = val.speed;
    break;
  default:
    O.log.error(this, 'Invalid auto off', val);
    return;
  }

  entry.offTimeout = setTimeout(onTime, wait);
  setAutoOffState(entry, {
    start: Date.now(),
    wait: wait,
    speed: speed,
  });

  return;

  function onTime() {  // {{{3
//    console.log('LIGHT AUTOOFF', speed);

    delete entry.offTimeout;

    for (var key in entry.channels) {
      if (! L.canSend(entry.channels[key])) {
        continue;
      }

      var s = entry.sval.channels[key];
      if (s && (s.value || s.time)) {
        L.send(entry.channels[key], 'write', {
          value: 0,
          speed: speed,
        });
      }
    }
  };

  // }}}3
}

function testLock(src, socket) {  // {{{2
  if (src.entry.sval.locked) {
    L.close(socket, 'locked');
    return true;
  }

  return false;
}

