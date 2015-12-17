'use strict';

var O = require('ose').class(module);
var Pin = require('./index');
O.prepend(Pin);

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Digital output pin response socket
 *
 * @readme
 * Setup of digital output pin.
 *
 * @class control.lib.pin.dout
 * @type extend
 */

// Public {{{1
exports.setup = function(req, resp, state, cb) {  // {{{2
  if (! ('write' in req)) {
    Pin.setup.call(this, req, resp, state, cb);
    return;
  }

  var that = this;

  Pin.setup.call(this, req, resp, state, function(err) {
    if (err) {
      cb(err);
      return;
    }

    if (resp.value !== req.write) {
      that.type.write(that, req.write, onWrite);
      return;
    }

    cb();
    return;
  });

  function onWrite(err, val) {  // {{{3
    if (err) {
      cb(err);
      return;
    }

    if (val !== req.write) {
      cb(O.error(that, 'Invalid value', req.write));
      return;
    }

    resp.value = state.raw = val;
    cb();
    return;
  }

  // }}}3
};

exports.setupDummy = function(req, resp, state) {  // {{{2
  resp.value = state.raw = 'write' in req ? req.write : 0;
  resp.at    = state.at  = Date.now();
};

exports.write = function(req, socket) {  // {{{2
/**
 * Change pin state
 *
 * @param req {Number|Boolean} Requested value of a pin
 * @param socket {Object} Client socket
 *
 * @method write
 * @handler
 */

  switch (req) {
  case false:
    req = 0;
    break;
  case true:
    req = 1;
    break;
  case 0:
  case 1:
    break;
  default:
    O.link.error(socket, O.error(this, 'INVALID_ARGS', 'Expecting "true, false, 0 or 1"', req));
    return;
  }

  var that = this;

  if (this.pins.dummy) {
    this.update(req);
    O.link.close(socket);
    return;
  }

  this.type.write(this, req, function(err) {
    if (! O.link.canClose(socket)) return;
    if (err) {
      O.link.error(socket, err);
      return;
    }

    O.link.close(socket);
    that.update(req);
    return;
  });
  return;
};

// }}}1
