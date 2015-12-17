'use strict';

var O = require('ose').object(module, Init, 'ose/lib/http/content');
exports = O.init();

/** Docs  {{{1
 * @module control
 */

/**
 * @caption Control content
 *
 * @readme
 * Provides files of [ose-control] package to the browser.
 *
 * @class control.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public {{{1
function Init() {  // {{{2
  O.super.call(this);

  this.addModule('node_modules/ip/lib/ip.js', 'ip');

  this.addModule('lib/blinds/index');
//  this.addModule('lib/blinds/gaia/detail');
//  this.addModule('lib/blinds/gaia/listDetail');
//  this.addModule('lib/din/gaia/detail');
//  this.addModule('lib/din/gaia/listDetail');
  this.addModule('lib/din/html5/detail');
  this.addModule('lib/din/index');
  this.addModule('lib/din/pin');
  this.addModule('lib/distributor/index');
//  this.addModule('lib/distributor/gaia/detail');
//  this.addModule('lib/door/gaia/detail');
//  this.addModule('lib/door/gaia/listDetail');
  this.addModule('lib/door/index');
  this.addModule('lib/door/pin');
  this.addModule('lib/flowMeter/index');
  this.addModule('lib/heater/html5/detail');
//  this.addModule('lib/heater/gaia/listItem');
  this.addModule('lib/heater/index');
  this.addModule('lib/heater/pin');
  this.addModule('lib/heater/tariff');
  this.addModule('lib/index');
  this.addModule('lib/ippool/index');
  this.addModule('lib/light/html5/detail');
//  this.addModule('lib/light/gaia/listItem');
  this.addModule('lib/light/index');
  this.addModule('lib/light/remote');
  this.addModule('lib/light/pin');
  this.addModule('lib/light/switch');
  this.addModule('lib/pin/commands.js');
  this.addModule('lib/pin/html5/din.js');
  this.addModule('lib/pin/html5/dout.js');
  this.addModule('lib/pin/html5/light.js');
  this.addModule('lib/pin/html5/list.js');
  this.addModule('lib/pin/html5/pwm.js');
  this.addModule('lib/pin/html5/switch.js');
  this.addModule('lib/remote.js');
  this.addModule('lib/room/index');
//  this.addModule('lib/room/gaia/detail');
  this.addModule('lib/switch/index');
  this.addModule('lib/switch/pin');
  this.addModule('lib/switch/relay');
  this.addModule('lib/switch/html5/detail');
//  this.addModule('lib/switch/gaia/listItem');
};

