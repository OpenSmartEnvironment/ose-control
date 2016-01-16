'use strict';

var O = require('ose').object(module, 'ose-level');

O.package = 'ose-control';

var Consts = O.consts('control');
Consts.counterThrottle = 1000;  // 1 second
Consts.heaterTimeout = 5 * 60 * 1000;  // 5 minutes
Consts.lightDefaultOn = 0.2;
Consts.lightDimSpeed = 5000;  // 5 seconds  TODO: rename to lightDimTime
Consts.lightAutoOffWait = 5 * 60;  // 5 minutes
Consts.lightAutoOffSpeed = 60 * 1000;  // 1 minute  TODO: rename to lightAutoOffTime
Consts.switchDebounce = 50;  // 50 ms
Consts.switchTap = 800;  // 0.8 second
Consts.switchHold = 1000;  // 1 second
Consts.green = 'rgb(58, 170, 53)';

exports = O.init('control');

O.content('../content');

/** Docs {{{1
 * @caption Control
 *
 * @readme
 * This package contains definitions of general [kinds of entries]
 * that role real objects found in most environments (lights,
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
 * @module control
 * @main control
 */

/**
 * @caption Control core
 *
 * @readme
 * Core singleton of ose-control npm package. Register [entry kinds]
 * defined by this package to the `"control"` [schema].
 *
 * @class control.lib
 * @type singleton
 */

// Public {{{1
exports.browserConfig = true;

exports.config = function(name, val, deps) {  // {{{2
  require('./blinds');
  require('./din');
  require('./distributor');
  require('./door');
  require('./flowMeter');
  require('./heater');
  require('./ippool');
  require('./light');
  require('./room');
  require('./sensor');
  require('./switch');
};

exports.map('name', {  // {{{2
  field: 'name',
  onePerEntry: true,
  map: function(entry, cb) {
    if (entry.dval.name && entry.kind.role) {
      cb([entry.dval.name, entry.id], entry.kind.role);
    }
  },
  getId: function(key, value) {
    return key[1];
  },
  filter: function(key, value, params) {
    if (params.role && value.indexOf(params.role) >= 0) return false;
    return true;
  },
});

exports.map('parent', {  // {{{2
  onePerEntry: true,
  map: function(entry, cb) {
    if (entry.dval.parent) {
      cb([entry.dval.parent, entry.dval.name, entry.id], entry.kind.name);
    }
  },
  getId: function(key, value) {
    return key[2];
  },
  filter: function(key, value, params, shard) {
    if (params.parent) {
      return shard.entryIdentMatch(key[0], params.parent);
    }

    return false;
  },
});

// }}}1
