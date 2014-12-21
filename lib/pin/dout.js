'use strict';

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Digital output pin type
 *
 * @readme
 * Setup of digital output pin.
 *
 * @class control.lib.pin.dout
 * @type extend
 */

// Public {{{1
module.exports = function(pin, req, state, resp, cb) {
  // TODO rewrite update to check whether update is confirmed or not.
  if (req.confirm) {
    pin.confirm = req.confirm;
    state.confirm = req.confirm;
  }

  cb();
};

