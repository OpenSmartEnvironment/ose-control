'use strict';

var Ose = require('ose');

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Digital input pin type
 *
 * @readme
 * Setup of digital input pin.
 *
 * @class control.lib.pin.din
 * @type extend
 */

// Public {{{1
module.exports = function(pin, req, state, resp, cb) {
  if (req.debounce) {
    pin.send = Ose._.debounce(pin.send.bind(pin), req.debounce);
  }

  cb();
};

