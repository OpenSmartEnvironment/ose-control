'use strict';

var Ose = require('ose');
var M = Ose.package(module);
exports = M.init();

/** Docs {{{1
 * @caption Control
 *
 * @readme
 * This package contains definitions of general [kinds of entries]
 * that represent real objects found in most environments (lights,
 * switches, heaters, sensors etc.). Entries are configured by
 * defining `entry.data` values. Communication between or among
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

M.content();

M.consts.counterThrottle = 1000;
//M.consts.heaterTimeout = 10 * 60;  // TODO Remove
M.consts.heaterTimeout = 10 * 1000 * 60;
M.consts.lightDefaultOn = 0.2;
M.consts.lightDimSpeed = 5000;
M.consts.lightAutoOffWait = 5 * 60;
M.consts.lightAutoOffSpeed = 60 * 1000;
M.consts.switchDebounce = 50;
M.consts.switchTap = 800;
M.consts.switchHold = 1000;

M.scope = 'control';
M.kind('./blinds', 'blinds');
M.kind('./din', 'din');
M.kind('./distributor', 'distributor');
M.kind('./door', 'door');
M.kind('./flowMeter', 'flowMeter');
M.kind('./heater', 'heater');
M.kind('./light', 'light');
M.kind('./room', 'room');
M.kind('./switch', 'switch');
