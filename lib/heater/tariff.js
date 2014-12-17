'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

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

  Ose.link.prepare(this);

  entry.linkTo(
    entry.data.tariff,
    {
      srev: 1,
      strack: true,
    },
    this
  );
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

  M.log.error(err);
  update(this);
};

exports.update = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method update
 */

  update(this);
};

// }}}1
// Private {{{1
function update(that) {  // {{{2
  if (! that.entry) {
    return;
  }

//  console.log('HIGH TARIFF UPDATE', that.link.entry.state);

  if (
    that.link &&
    that.link.entry &&
    that.link.entry.isSynced()
  ) {
    if (that.link.entry.state.value === 0) {
      tariff(that.entry, 'low');
      return;
    }

    tariff(that.entry, 'high');
    return;
  }

  tariff(that.entry, 'unknown');
  return;
};

function tariff(entry, value) {  // {{{2
//  console.log('HEATER TARIFF', value);

  switch (value) {
  case 'low':
    entry.setState({enabled: true});
    break;
  case 'high':
  case 'unknown':
    entry.setState({enabled: false});
    break;
  default:
    throw Ose.error(entry, 'invalidTariff', value);
  }
};

// }}}1
