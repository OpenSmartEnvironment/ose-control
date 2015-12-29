'use strict';

var O = require('ose').class(module, './index');

var Dout = O.class('./dout');

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Light pin flavour response socket
 *
 * @readme
 * Flavour controlling pins to which one light channel is connected as
 * a client. This flavour allows smooth light dimming.
 *
 * @class control.lib.pin.light
 * @type extend
 */

// Public {{{1
exports.setup = function(req, resp, state, cb) {  // {{{2
  if (this.type.name === 'dout') {
    Dout.prototype.setup.call(this, req, resp, state, cb);
    return;
  }

  var that = this;

  O.inherited(this, 'setup')(req, resp, state, function(err) {
    if (err) {
      cb(err);
      return;
    }

    resp.raw = resp.value;
    that.value = resp.value = state.value = tout(resp.raw, that.caps);

    cb();
    return;
  });
  return;
};

exports.setupDummy = function(req, resp, state) {  // {{{2
  if (this.type.name === 'dout') {
    Dout.prototype.setupDummy.call(this, req, resp, state);
  } else {
    resp.raw = resp.value = state.raw = 0;
    this.value = resp.value = state.value = tout(resp.raw, this.caps);
  }
}

exports.write = function(req, socket) {  // {{{2
/**
 * Set state of light channel connected to the pin controlled by this socket
 *
 * @param req {Object|Number} Requested parameters or value
 * @param [req.value] {Number} Final requested value
 * @param [req.speed] {Number} Dimming speed in milliseconds
 *
 * @param socket {Object} Client socket
 *
 * @method write
 */
//  console.log('PIN LIGHT WRITE', req, this.type.name);

  switch (typeof req) {
  case 'boolean':
    req = {value: req ? 1 : 0};
    break;
  case 'number':
    req = {value: req};
    break;
  case 'object':
    if (req) break;
  default:
    O.link.error(this, O.error(this, 'INVALID_ARGS', req));
    return;
  }

  if (this.type.name === 'dout') {
    Dout.prototype.write.call(this, req.value ? 1 : 0, socket);
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
    O.link.error(O.error(this, 'Invalid value', {val: val, type: typeof val}));
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

  // write PWM entry.sval and send state write to light
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
  this.value = tout(val, this.caps);

  setState(this, val, this.value, Date.now());
};

// Private {{{1
function setState(that, rval, val, at, raim, aim, time) {  // {{{2
/**
 * Call to write PWM board entry.sval of individual pin and invoke
 * `link.update()`
 *
 * @param that {Object} Pin
 * @param rval {Number} Raw value of controller pin
 * @param val {Number} Value between 0 and 1
 * @param at {Number} Timestamp of request
 * @param raim {Number} Requested raw value of controller pin
 * @param aim {Number} Requested value between 0 and 1
 * @param time {Number} Time in milliseconds the change should take
 */

  if (raim === undefined) raim = null;
  if (aim === undefined) aim = null;
  if (time === undefined) time = null;

  var s = {};
  s[that.index] = {
    raw: rval,
    value: val,
    at: at,
    aim: aim,
    raim: raim,
    time: time,
  };
  that.pins.entry.setState({pins: s});

  O.link.send(that, 'update', {
    value: val,
    at: at,
    aim: aim,
    time: time,
  });
};

function dim(that, state) {  // {{{2
/**
 * Dim light from `state.last.raw` to `stat.raw`.
 *
 * @param state {Object} Contain change info. Do not change this object
 */

//  console.log('PIN LIGHT DIM', typeof that.pins.entry, state);

  if (isNaN(state.time)) {
    O.link.error(that, O.error(that, 'Invalid time', state));
    return;
  }

  var timeout = state.time / that.caps;
  if (timeout < 10) timeout = 10;

  that.interval = setInterval(doIt, timeout);

  return;

  function doIt() {  // {{{3
    var val;
    var raw;
    var now = Date.now();

    if ((now - state.at) >= state.time)  {
      raw = state.raw;
    } else {
      val = state.last.value + (state.value - state.last.value) * (now - state.at) / state.time;
      raw = tin(val, that.caps);
    }

    if (raw === state.raw) {  // Dimming is finished
      clearInterval(that.interval);
      delete that.interval;

      val = state.value;
      setState(that, raw, val, now);
    }

    if (that.raw !== raw) {
      that.raw = raw;
      that.type.write(that, raw);
    }
    that.value = val;
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

// Class {{{1
O.ctor.displayControl = function(wrap, li, key, val) {
  switch (val.type) {
  case 'dout':
    Dout.displayControl(wrap, li, key);
    return;
  case 'pwm':
    Pwm.displayControl(wrap, li, key);
    return;
  }

  throw O.log.error(wrap, 'INVALID_ARGS', val.type);
};

O.ctor.patchControl = function(wrap, li, patch, val) {
  switch (val.type) {
  case 'dout':
    Dout.patchControl(wrap, li, patch, val);
    return;
  case 'pwm':
    Pwm.patchControl(wrap, li, patch, val);
    return;
  }

  throw O.log.error(wrap, 'INVALID_ARGS', val.type);
};

