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
/**
 * Class constructor
 *
 * @param entry {Object} Digital input entry
 *
 * @method constructor
 */

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

exports.end = function(err, resp) {  // {{{2
/**
 * Broken link handler
 *
 * @method end
 */

//  console.log('SWITCH LINK END');

  this.entry.setState({
    value: null,
    at: Ose._.now(),
  });

  if (err) {
    M.log.error(err);
  } else {
    M.log.notice('Digital input link to master pin was permanently closed', resp);
  }
};

exports.sync = function(value) {  // {{{2
/**
 * Sync handler
 *
 * @method sync
 */

  if (! value) {
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
