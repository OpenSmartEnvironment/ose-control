'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.pin
 */

/**
 * @caption Pin entry client socket
 *
 * @readme
 * Client socket connecting to a controller pin. Updates entry sval.
 *
 * @class control.lib.pin.client
 * @type class
 */

// Public {{{1
function init(entry, type, flavour, prefix) {  // {{{2
/**
 * Pin client socket constructor
 *
 * @param entry {Object} [Entry] to be notified about pin changes
 * @param type {String} Controller [pin type]
 * @param [flavour] {String} [Pin flavour]
 * @param [prefix] {String} Entry pin name prefix
 */

  this.prefix = prefix || 'pin';

  O.inherited(this)(
    entry,
    entry.dval.master,
    'registerPin',
    {
      index: entry.dval[this.prefix],
      type: type,
      flavour: flavour,
      debounce: entry.sval && entry.sval.debounce,
    }
  );
};

exports.synced = function(val, data) {  // {{{2
  var resp = {};
  resp[this.prefix] = val ? data.value : null;
  this.entry.setState(resp);

    /*
    this.entry.setState({pin: {
      value: data.value,
      at: data.at,
    }});
  } else {
    this.entry.setState({pin: null});
  }
    */
};

exports.update = function(req) {  // {{{2
  var resp = {};
  resp[this.prefix] = val ? req.value : null;
  this.entry.setState(resp);

  /*
  this.entry.setState({
    value: req.value,
    at: req.at,
  });
  */
};

