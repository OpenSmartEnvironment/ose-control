'use strict';

var O = require('ose').module(module);
O.package = 'ose-control';
O.scope = 'control';

/** Docs {{{1
 * @caption Control
 *
 * @readme
 * This package contains definitions of general [kinds of entries]
 * that represent real objects found in most environments (lights,
 * switches, heaters, sensors etc.). Entries are configured by
 * defining `entry.dval` values. Communication between or among
 * entries is realized via [links].
 *
 * @features
 *
 * @planned
 *
 * - Home automation control application
 * - Controlling 230V appliances (wall sockets, underfloor heaters, window blinds etc.)
 * - Switching and dimming of LED light sources
 * - Magnetic door and windows sensors
 * - Activity-based ergonomics
 * - Environmental sensors (temperature, humidity, air quality, occupancy, etc.)
 * - Capacitance touch detection
 * - Security cameras
 * - Power consumption monitoring
 * - Voice commands using the Google Speech API
 * - Desktop remote control
 * - Sound and gesture commands recognition
 * - HVAC control
 * - Media centre and NAS
 * - Integration of other home automation protocols and products
 *   - xPL
 *   - Zigbee
 *   - Z-Wave
 *   - KNX
 * - Computer learning
 *
 * @scope control
 * @module control
 * @main control
 */

/**
 * @caption Control core
 *
 * @readme
 * Core singleton of ose-control npm package. Register [entry kinds]
 * defined by this package to the `"control"` [scope].
 *
 * @class control.lib
 * @type singleton
 */

// Public {{{1
exports.browserConfig = true;

exports.config = function(name, val, deps) {
  O.consts.counterThrottle = 1000;  // 1 second
  O.consts.heaterTimeout = 5 * 60 * 1000;  // 10 minutes
  O.consts.lightDefaultOn = 0.2;
  O.consts.lightDimSpeed = 5000;  // 5 seconds  TODO: rename to lightDimTime
  O.consts.lightAutoOffWait = 5 * 60;  // 5 minutes
  O.consts.lightAutoOffSpeed = 60 * 1000;  // 1 minute  TODO: rename to lightAutoOffTime
  O.consts.switchDebounce = 50;  // 50 ms
  O.consts.switchTap = 800;  // 0.8 second
  O.consts.switchHold = 1000;  // 1 second

  O.kind('./blinds', 'blinds', deps);
  O.kind('./din', 'din', deps);
  O.kind('./distributor', 'distributor', deps);
  O.kind('./door', 'door', deps);
  O.kind('./flowMeter', 'flowMeter', deps);
  O.kind('./heater', 'heater', deps);
  O.kind('./ippool', 'ippool', deps);
  O.kind('./light', 'light', deps);
  O.kind('./room', 'room', deps);
  O.kind('./switch', 'switch', deps);

  O.new('ose/lib/map/field')(O.scope, 'alias', {unique: true});

  O.content('../content');
};

// }}}1
