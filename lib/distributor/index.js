'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'distributor');

var Room = require('../room');

/** Doc {{{1
 * @caption Power distributors
 *
 * @readme
 *
 * TBD
 *
 * This component defines basic power distributor entry kinds. By
 * configuring entries of these kinds, it is possible to define the
 * power distributor configuration and behaviour.
 *
 * @module control
 * @submodule control.distributor
 * @main control.distributor
 * @aliases powerDistributor
 */

/**
 * @caption Power distributor kind
 *
 * @readme
 *
 * TBD
 *
 * [Entry kind] defining behaviour of power distributors.
 *
 * @kind distributor
 * @class control.lib.distributor
 * @extend ose.lib.kind
 * @type class
 */

// Public {{{1
exports.role = ['area'];

exports.layout('detail', Room.layouts.detail);

