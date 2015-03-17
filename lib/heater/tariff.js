'use strict';

var O = require('ose').class(module, C);

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Heater-to-tariff client socket
 *
 * @readme
 * Establishes a link to the `data.tariff` entry.
 *
 * @class control.lib.heater.tariff
 * @type class
 */

// Public {{{1
function C(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Heater entry
 *
 * @method constructor
 */

  this.entry = entry;

  entry.linkTo(entry.data.tariff, false, true, this);
};

exports.open = function(req) {  // {{{2
/**
 * Open handler
 *
 * @param req {Object} Open request
 *
 * @method open
 */

  update(this, req);
};

exports.close = function(req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Object} Request data
 *
 * @method close
 */

  update(this);
};

exports.error = function(err) {  // {{{2
/**
 * Error handler
 *
 * @param err {Object} [Error] instance
 *
 * @method error
 */

  O.log.error(err);
  update(this);
};

exports.home = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method home
 */

  update(this);
};

exports.patch = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method patch
 */

  update(this);
};

// }}}1
// Private {{{1
function update(that) {  // {{{2
  if (! that.entry) {
    return;
  }

//  console.log('!!!!!!!!!!!!!!!!!!!!!!!! HIGH TARIFF UPDATE');

  var t = that._link && that._link.entry;
  if (! (t && t.isHome())) {
    tariff(that.entry, 'unknown');
    return;
  }

  if (that._link.entry.state.value === 0) {
    tariff(that.entry, 'low');
    return;
  }

  tariff(that.entry, 'high');
  return;
};

function tariff(entry, value) {  // {{{2
//  console.log('!!!!!!!!!!!!!!!! HEATER TARIFF', value);

  switch (value) {
  case 'low':
    entry.setState({enabled: true});
    break;
  case 'high':
  case 'unknown':
    entry.setState({enabled: false});
    break;
  default:
    throw O.error(entry, 'invalidTariff', value);
  }
};

// }}}1
