'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Digital input-to-controller pin client socket
 *
 * @readme
 * Client socket connecting to a controller pin. Updates digital input
 * entry sval.
 *
 * @class control.lib.din.pin
 * @type class
 */

// Public {{{1
function init(entry) {  // {{{2
  O.inherited(this)(
    entry,
    entry.dval.master,
    'registerPin',
    {
      index: entry.dval.pin,
      type: 'din',
      debounce: entry.sval.debounce,
    }
  );
};

exports.synced = function(val, data) {  // {{{2
  if (val) {
    this.entry.setState({
      value: data.value,
      at: data.at,
      synced: true,
    });
  } else {
    this.entry.setState({
      value: null,
      at: Date.now(),
      synced: false,
    });
  }
};

exports.update = function(req) {  // {{{2
/**
 * Update handler called when the state of a pin changes on
 * the controller
 *
 * @param req {Object} Update request data
 *
 * @method update
 * @handler
 */

  this.entry.setState({
    value: req.value,
    at: req.at,
  });
};

// }}}1
