'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Digital input-to-controller pin client socket
 *
 * @readme
 * Client socket connecting to a physical device pin. Updates digital
 * input entry state.
 *
 * @class control.lib.din.pin
 * @type class
 */

// Public {{{1
function C(entry) {  // {{{2
  M.super.call(this,
    entry,
    entry.data.master,
    'registerPin',
    {
      caption: entry.getCaption(),
      entry: entry.identify(),
      index: entry.data.pin,
      type: 'din',
      debounce: entry.state.debounce,
    }
  );
};

exports.error = function(err) {  // {{{2
  M.log.error(err);

  this.close();
};

exports.close = function(resp) {  // {{{2
  this.sync(false);

  M.log.notice('Digital input link to master pin was permanently closed', {entry: this.entry.identify(), resp: resp});
};

exports.sync = function(value) {  // {{{2
/**
 * Sync handler
 *
 * @method sync
 */

  if (value) {
    this.link.read();
  } else {
    this.entry.setState({
      value: null,
      at: Ose._.now(),
    });
  }
};

exports.update = function(req) {  // {{{2
/**
 * Update handler called when the state of a physical pin changes on
 * the master side
 *
 * @param req {Object} Update request data
 *
 * @method update
 */

  this.entry.setState({
    value: req.value,
    at: req.at,
  });
};

// }}}1
