'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

var Schedule = require('node-schedule');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Activity class
 *
 * @readme
 * Ancestor for activity definintions
 *
 * @class control.lib.activity
 * @type class
 */

// Public {{{1
function C(name, entry) {
/**
 * Class constructor
 *
 * @param name {String} Activity name
 * @param entry {Object} Room entry
 *
 * @method constructor
 */

  this.jobs = {};

  this.name = name;
  this.entry = entry;

  entry.activities[name] = this;
};

exports.job = function(name, rule, cb) {
/**
 * Creates a new scheduled job
 *
 * @param name {String} Name of job
 * @param rule {Object} Schedule information
 * @param cb {Function} Callback
 *
 * @method job
 */

  var job = Schedule.scheduleJob(name, rule, cb);
  this.jobs[job.name] = job;

  console.log('ADDED DAILY JOB', job.name);

  return job;
}

exports.daily = function(name, hour, minute, cb) {
/**
 * Creates a new daily job
 *
 * @param name {String} Name of job
 * @param hour {Number} Hour
 * @param minute {Number} Minute
 * @param cb {Function} Callback
 *
 * @method daily
 */

  switch (arguments.length) {
  case 2:
    cb = hour;
    hour = name;
    minute = 0;
    name = null;
    break;
  case 3:
    cb = minute;
    minute = hour;
    hour = name;
    name = Ose._.uniqueId('job');
    break;
  case 4:
    break;
  default:
    throw Ose.error('INVALID_ARGS', arguments);
  }

  var rule = new Schedule.RecurrenceRule();
  rule.hour = hour;
  rule.minute = minute;

  return this.job(name || Ose._.uniqueId('job'), rule, cb);
};

exports.start = function(req, socket) {
/**
 * Called when an activity is selected
 *
 * @param req {*} Request data
 * @param socket {Object} Client socket
 *
 * @method start
 */

  this.update(req, socket);
};

exports.stop = function() {
/**
 * Called when another activity is selected
 *
 * @method stop
 */

  var j = this.jobs;
  this.jobs = {};

  for (var key in j) {
    Schedule.cancelJob(j[key]);
  }
};

exports.update = function(req, socket) {
/**
 * Called when an activity is selected or updated
 *
 * @param req {*} Request data
 * @param socket {Object} Client socket
 *
 * @method update
 */

  Ose.link.close(socket);
};

// }}}1
