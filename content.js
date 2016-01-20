'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/http/content')
;

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
exports.addModule('node_modules/ip/lib/ip.js', 'ip');

exports.addModule('lib/blinds/index');
exports.addModule('lib/din/index');
exports.addModule('lib/din/pin');
exports.addModule('lib/distributor/index');
exports.addModule('lib/door/index');
exports.addModule('lib/door/pin');
exports.addModule('lib/flowMeter/index');
exports.addModule('lib/heater/index');
exports.addModule('lib/heater/pin');
exports.addModule('lib/heater/tariff');
exports.addModule('lib/index');
exports.addModule('lib/ippool/index');
exports.addModule('lib/light/index');
exports.addModule('lib/light/remote');
exports.addModule('lib/light/pin');
exports.addModule('lib/light/switch');
exports.addModule('lib/pin/client.js');
exports.addModule('lib/pin/commands.js');
exports.addModule('lib/pin/counter.js');
exports.addModule('lib/pin/din.js');
exports.addModule('lib/pin/dout.js');
exports.addModule('lib/pin/index.js');
exports.addModule('lib/pin/light.js');
exports.addModule('lib/pin/list.js');
exports.addModule('lib/pin/orm.js');
exports.addModule('lib/pin/pwm.js');
exports.addModule('lib/pin/switch.js');
exports.addModule('lib/remote.js');
exports.addModule('lib/room/index');
exports.addModule('lib/sensor');
exports.addModule('lib/switch/index');
exports.addModule('lib/switch/pin');
exports.addModule('lib/switch/relay');

