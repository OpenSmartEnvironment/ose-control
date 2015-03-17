'use strict';

var O = require('ose').class(module);
var Pin = require('./index');
O.prepend(Pin);

var Dout = require('./dout');

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Light pin flavour
 *
 * @readme
 * Flavour controlling pins to which one light channel is connected as
 * a slave. This flavour allows smooth light dimming.
 *
 * @class control.lib.pin.light
 * @type extend
 */

// Public {{{1
exports.setup = function(state, cb) {  // {{{2
  var that = this;

  switch (this.req.type) {
  case 'pwm':
  case 'dout':
    break;
  default:
    cb(O.error(pin, 'Invalid arguments', this.req));
    return;
  }

  Pin.setup.call(this, state, function(err, val) {
    if (err) {
      cb(err);
      return;
    }

    if (that.req.type === 'dout') {
      state.value = val.value;
    } else {
      state.value = val.value = tout(val.value);
    }

    cb(err, val);
    return;
  });
  return;
};

exports.write = function(req, socket) {  // {{{2
  if (this.req.type === 'dout') {
    Dout.write.call(this, req.value ? 1 : 0, socket);
    return;
  }

  if (this.interval) {
    clearInterval(this.interval);
    delete this.interval;
  }

  var val;  // 0 .. 1
  switch (req.value) {
  case true:
  case 'true':
  case 'on':
    val = 1;
    break;
  case false:
  case 'false':
  case 'off':
    val = 0;
    break;
  case 'stop':
    val = this.value;
    break;
  default:
    val = req.value
  }

  if (typeof val === 'string') {
    val = parseInt(val);
  }

  if (typeof val !== 'number') {
    O.link.error(O.error(this, 'invalidValue', {val: val, type: typeof val}));
    return;
  }

  if (val < 0) {
    val = 0;
  } else if (val > 1) {
    val = 1;
  }

  var ps = {  // Pin state, do not change this object
    value: val,
    raw: tin(val, this.caps),
    last: {
      value: this.value,
      raw: this.raw
    },
    at: new Date().getTime(),
    time: null
  };

  // Check whether write PWM and call propper write method
  if (ps.raw === ps.last.raw) {  // Raw values are same, do not write PWM
    if (this.value !== ps.value) {  // write LIGHT values
      this.value = ps.value;
    }
  } else {  // `raw` value changed, write PWM
    if (req.speed) {  // Request contain dim `speed`, use dimming
      ps.time = Math.floor(Math.abs(ps.value - ps.last.value) * req.speed);
      dim(this, ps);
    } else {  // Immediate change request do not forget to setup `pin.value`
      if (this.raw !== ps.raw) {
        this.raw = ps.raw;
        this.type.write(this, ps.raw);
      }

      if (this.value !== ps.value) {
        this.value = ps.value;
      }
    }
  }

  // write PWM entry state and send state write to light
  if (ps.time) {
    setState(this, ps.last.raw, ps.last.value, ps.at, ps.raw, ps.value, ps.time);
  } else {
    setState(this, ps.raw, ps.value, ps.at);
  }
  return;

  function done(err, resp) {
    if (err) {
      O.link.error(socket || this, err, true);
      return;
    }

    O.link.close(socket, resp, true);
    return;
  }
};

exports.update = function(val) {  // {{{2
  this.raw = val;
  this.val = tout(val, this.caps);

  setState(this, val, this.val, O._.now());
};

// }}}1
// Private {{{1
function setState(pin, rval, val, at, raim, aim, time) {  // {{{2
/**
 * Call to write PWM board entry state of individual pin and invoke
 * `link.update()`
 *
 * @param pin {Object} Pin instance
 * @param rval {Number} Raw value of controller pin
 * @param val {Number} Value between 0 and 1
 * @param at {Number} Timestamp of request
 * @param raim {Number} Requested raw value of controller pin
 * @param aim {Number} Requested value between 0 and 1
 * @param time {Number} Time in milliseconds the change should take
 */

  if (raim === 'undefined') raim = null;
  if (aim === 'undefined') aim = null;

  var s = {};
  s[pin.index] = {
    raw: rval,
    value: val,
    at: at,
    aim: raim,
    time: time || null,
  };
  pin.pins.entry.setState({pins: s});

  O.link.send(pin, 'update', {
    value: val,
    at: at,
    aim: aim,
    time: time || null,
  });
};

function dim(pin, state) {  // {{{2
/**
 * Dim light from `state.last.raw` to `stat.raw`.
 *
 * @param state {Object} Contain change info. Do not change this object
 */

//  console.log('PIN LIGHT DIM', state);

  if (isNaN(state.time)) {
    O.link.error(state, O.error(pin, 'Invalid time', pin.index, state));
    return;
  }

  var timeout = state.time / pin.caps;
  if (timeout < 10) timeout = 10;

  pin.interval = setInterval(doIt, timeout);

  return;

  function doIt() {  // {{{3
    var val;
    var raw;
    var now = O._.now();

    if ((now - state.at) >= state.time)  {
      raw = state.raw;
    } else {
      val = state.last.value + (state.value - state.last.value) * (now - state.at) / state.time;
      raw = tin(val, pin.caps);
    }

    if (raw === state.raw) {  // Dimming is finished
      clearInterval(pin.interval);
      delete pin.interval;

      val = state.value;
      setState(pin, raw, val, now);
    }

    if (pin.raw !== raw) {
      pin.raw = raw;
      pin.type.write(pin, raw);
    }
    pin.value = val;
  };

  // }}}3
};

function tin(val, steps) {  // {{{2
/**
 * Transform val comming from a light.
 */

  var result = Math.floor(val * val * steps);

  if (result < (steps * 0.002)) {
    return 0;
  }

  if (result > (steps * 0.990)) {
    return steps;
  }

  return result;
};

function tout(val, steps) {  // {{{2
/**
 * Transform val before sending to a light.
 */

  return Math.sqrt(val / steps);
};

// }}}1
