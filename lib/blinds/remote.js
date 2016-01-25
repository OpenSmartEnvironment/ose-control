'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule control.remote
 */

/**
 * @caption Remote controller command group class for blinds
 *
 * @readme
 * Facilitates configuration of controlling blinds with remote
 * controllers.
 *
 * See the [control.remote] component.
 *
 * @class control.lib.blind.remote
 * @type class
 */

// Public {{{1
function init() {  // {{{2
/**
 * Class constructor
 *
 * @method constructor
 */

  this.timeout = 60 * 1000;

  this.targets = {};

  this.actions = {
    stop: stop,
    volumeup: deltaUp,
    volumedown: deltaDown,
  };
};

exports.add = function(index, target) {  // {{{2
/**
 * Call to add a blind to this group of commands.
 *
 * @param index {Number} Index of blind
 * @param target {Number | String | Object} Blinds entry identification
 *
 * @method constructor
 */

  this.targets[index] = target;
};

exports.selected = function() {  // {{{2
  delete this.blind;
};

exports.number = function(entry, val) {  // {{{2
  if (! this.blind) {
    this.blind = this.targets[val.number];
    return;
  }

  switch (val.number) {
  case 1:  // Close blinds
    entry.shard.post(this.blind, 'set', 0);
    return;
  case 2:  // Close blinds, let visible space
    entry.shard.post(this.blind, 'set', 'semi');
    return;
  case 3:  // Open blinds
    entry.shard.post(this.blind, 'set', 1);
    return;
  }

  return;
};

// Private {{{1
function stop(entry) {  // {{{2
  var that = entry.group;

  if (that.blind) {
    entry.shard.post(that.blind, 'stop');
  }
};

function deltaUp(entry) {  // {{{2
  delta(entry, 0.01);
};

function deltaDown(entry) {  // {{{2
  delta(entry, -0.005);
};

function delta(entry, delta) {  // {{{2
  var that = entry.group;

  if (that.blind) {
    entry.shard.post(that.blind, 'move', delta);
  }
};

