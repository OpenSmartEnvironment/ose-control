'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Heater-to-tariff client socket
 *
 * @readme
 * Establishes a link to the `dval.tariff` entry.
 *
 * @class control.lib.heater.tariff
 * @type class
 */

// Public {{{1
function init(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Heater entry
 *
 * @method constructor
 */

  this.heater = entry;

  entry.shard.track(entry.dval.tariff, this);
};

exports.open = function(entry) {  // {{{2
  this.tariff = entry;
  update(this);
};

exports.close = function() {  // {{{2
  delete this.tariff;
  update(this);
};

exports.error = function(err) {  // {{{2
  O.log.suppressError(err, this, 'Heater hight tariff can\'t be reached', 2);

  delete this.tariff;
  update(this);
};

exports.home = function() {  // {{{2
  update(this);
};

exports.patch = function() {  // {{{2
  update(this);
};

// Private {{{1
function update(that) {  // {{{2
  if (! that.heater) return;

  if (
    that.tariff &&
    that.tariff.canReachHome() &&
    that.tariff.sval.value === 0
  ) {
    return that.heater.setState({enabled: true});
  }

  return that.heater.setState({enabled: false});
};

