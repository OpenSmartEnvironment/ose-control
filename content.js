'use strict';

exports = require('ose')
  .singleton(module, 'ose/lib/http/content')
  .exports
;

/** Docs  {{{1
 * @module control
 */

/**
 * @caption OSE Control content
 *
 * @readme
 * Provides files of OSE Control package to the browser.
 *
 * @class control.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public  {{{1
exports.addFiles = function() {
  this.addModule('lib/blinds/index');
  this.addModule('lib/blinds/bb/detail');
  this.addModule('lib/blinds/bb/listDetail');
  this.addModule('lib/din/bb/detail');
  this.addModule('lib/din/bb/listDetail');
  this.addModule('lib/din/index');
  this.addModule('lib/din/pin');
  this.addModule('lib/distributor/index');
  this.addModule('lib/door/bb/detail');
  this.addModule('lib/door/bb/listDetail');
  this.addModule('lib/door/index');
  this.addModule('lib/door/pin');
  this.addModule('lib/flowMeter/index');
  this.addModule('lib/heater/bb/detail');
  this.addModule('lib/heater/bb/listDetail');
  this.addModule('lib/heater/index');
  this.addModule('lib/heater/pin');
  this.addModule('lib/heater/tariff');
  this.addModule('lib/index');
  this.addModule('lib/light/bb/detail');
  this.addModule('lib/light/bb/listItem');
  this.addModule('lib/light/index');
  this.addModule('lib/light/remote');
  this.addModule('lib/light/pin');
  this.addModule('lib/light/switch');
  this.addModule('lib/pin/bb/din.js');
  this.addModule('lib/pin/bb/dout.js');
  this.addModule('lib/pin/bb/list.js');
  this.addModule('lib/pin/bb/pwm.js');
  this.addModule('lib/pin/commands.js');
  this.addModule('lib/remote.js');
  this.addModule('lib/room/index');
  this.addModule('lib/room/bb/detail');
  this.addModule('lib/switch/index');
  this.addModule('lib/switch/pin');
  this.addModule('lib/switch/relay');
};

