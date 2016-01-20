'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule control.remote
 */

/**
 * @caption Remote controller command group class for lights
 *
 * @readme
 * Facilitates configuration of controlling lights with remote
 * controllers.
 *
 * See the [control.remote] component.
 *
 * @class control.lib.light.remote
 * @type class
 */

// Public {{{1
function init() {  // {{{2
/**
 * Class constructor
 *
 * @method constructor
 */

  this.timeout = 10000;

  this.targets = {};

  this.actions = {
    volumeup: deltaUp,
    volumedown: deltaDown,
  };
};

exports.add = function(index, target) {  // {{{2
/**
 * Call to add a light to this group of commands.
 *
 * @param index {Number} Index of light
 * @param target {Number | String | Object} Light entry identification
 *
 * @method constructor
 */

  this.targets[index] = target;
};

exports.selected = function() {  // {{{2
  delete this.light;
};

exports.number = function(entry, val) {  // {{{2
//  console.log('LIGHTS NUMBER', val, this.light);

  if (this.light) {
    entry.shard.post(this.light, 'update', val.number / 9);
  } else {
    this.light = this.targets[val.number];
    if (this.light) {
      entry.shard.post(this.light, 'profile', {name: 'switch', speed: 20000});
    }
  }
};

// }}}1
// Private {{{1
function deltaUp(entry) {  // {{{2
  delta(entry, 0.02);
};

function deltaDown(entry) {  // {{{2
  delta(entry, -0.02);
};

function delta(entry, delta) {  // {{{2
  var that = entry.group;

  if (that.light) {
    entry.shard.post(that.light, 'delta', {speed: 10000, value: delta});
  }
};

// }}}1
