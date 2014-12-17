'use strict';

var Ose = require('ose');
var M = Ose.module(module);

/** Doc // {{{1
 * @caption Remote control
 *
 * @readme
 * This component makes it possible to specify what individual remote
 * controller commands do with OSE entries. An example of using this
 * component is the [ose-lirc] package.
 *
 * The remote controller can be easily configured to control
 * multimedia, lights, etc. It is possible to define commands and
 * groups of commands.
 *
 * Example:
 * TODO
 *
 * @module control
 * @submodule control.remote
 * @main control.remote
 */

/**
 * @caption Remote control module
 *
 * @readme
 * Methods allowing the setup of remote controller
 *
 * @class control.lib.remote
 */

// Public {{{1
exports.defaults = function(entry, key, group) {  // {{{2
/**
 * Sets up default command group
 *
 * @param entry {Object} Remote controller receiver entry
 * @param key {String} Remote command name
 * @param group {Number} Group of remote commands
 *
 * @method defaults
 */

  entry.default = entry.group = entry.lastGroup = group;

  this.addGroup(entry, key, group);
  this.groupKey(entry, group, key, group);
};

exports.addGroup = function(entry, key, group) {  // {{{2
/**
 * Adds new command group
 *
 * @param entry {Object} Remote controller receiver entry
 * @param key {String} Remote command name
 * @param group {Number} Group of remote commands
 *
 * @method addGroup
 */

  if (! entry.groups) {
    entry.groups = {};
  }

  if (typeof key === 'string') {
    key = key.toLowerCase();
  }

  if (key in entry.groups) {
    M.log.warn('Overwriting REMOTE group!', {key: key, entry: entry.identify(), group: group});
  }

  if (! group) {
    group = {};
  }

  if (! group.key) {
    group.key = key;
  }

  if (! group.actions) {
    group.actions = {};
  }

  entry.groups[key] = group;

  return group;
};

exports.add = function(group, key, data) {  // {{{2
/**
 * Adds an action to the group assigned to the remote command
 *
 * @param group {Object} Group of remote commands
 * @param key {Number} Remote command name
 * @param data {Object} Action to be taken
 *
 * @method add
 */

//  console.log('ADD ITEM', group.key, key, data);

  if (key in group.actions) {
    M.log.warning('Overwriting remote group action', {group: group.key, key: key, data: data});
  }

  group.actions[key] = data;

  return group;
};

exports.groupKey = function(entry, master, key, group) {  // {{{2
/**
 * Assigns key to group
 *
 * @param entry {Object} Remote controller receiver entry
 * @param master {Object} Master group
 * @param key {String} Remote command name
 * @param group {Number} Group of remote commands
 *
 * @method groupKey
 */

  switch (arguments.length) {
  case 2:
    group = master;
    master = entry.default;
    key = group.key;
    break;
  case 3:
    group = key;
    if (typeof master === 'string') {
      key = master;
      master = entry.default;
    } else {
      key = group.key;
    }
    break;
  }

  this.add(master, key, this.selectGroup.bind(this, entry, group));
};

exports.selectGroup = function(entry, group) {  // {{{2
/**
 * Activates group
 *
 * @param entry {Object} Remote controller receiver entry
 * @param group {Number} Group of remote commands
 *
 * @method selectGroup
 */

//  console.log('SELECT GROUP', group.key);

  if (group.timeout) {
    groupTimeout(entry, group.timeout);
  } else {
    entry.lastGroup = group;
  }

  entry.group = group;
  if (typeof group.selected === 'function') {
    group.selected();
  }

//  console.log('GROUP SELECTED', group.key);
  return
};

exports.receive = function(entry, data) {  // {{{2
/**
 * Called by remote controller receiver entry when a key is pressed
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param data {Object} Data object
 * @param data.key {String} Key name
 * @param data.count {Number} Number of repeats
 *
 * @method receive
 */

  var group;
  var action;

  var number = parseInt(data.key);
  if (! isNaN(number)) {
    data.number = number;
  }

//  console.log('REMOTE RECEIVE', data);

  if (entry.groupTimeout) {
    clearTimeout(entry.groupTimeout);
    delete entry.groupTimeout;
  }

  callAction(entry, data);
  return;
};

exports.next = function(entry, data) {  // {{{2
/**
 * Next channel handler
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param data {Object} Data object
 * @param data.key {String} Key name
 * @param data.count {Number} Number of repeats
 * @param data.number {Number} Resulting decimal number
 *
 *
 * @method next
 */

  offset(entry, data, 1);
};

exports.prev = function(entry, data) {  // {{{2
/**
 * Previous channel handler
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param data {Object} Data object
 * @param data.key {String} Key name
 * @param data.count {Number} Number of repeats
 * @param data.number {Number} Resulting decimal number
 *
 * @method prev
 */

  offset(entry, data, -1);
};

// }}}1
// Private {{{1
function offset(entry, data, offset) {  // {{{2
  data.offset = offset;

  data.number = (entry.group.lastNumber || 0) + offset;
  if (data.number < 0) data.number = 0;
  data.key = data.number;

  callAction(entry, data);
  return;
};

function groupTimeout(entry, timeout) {  // {{{2
/**
 * Reset current group after timeout to last group without timeout.
 */

  if (entry.groupTimeout) {
    clearTimeout(entry.groupTimeout);
  }

  entry.groupTimeout = setTimeout(function() {
//    console.log('GROUP RESET', entry.lastGroup.key);

    delete entry.groupTimeout;
    entry.group = entry.lastGroup;
  }, timeout);
}

function callAction(entry, data) {  // {{{2
//  console.log('REMOTE CALL ACTION', data, entry.group.lastNumber);

  var g = entry.group;
  if (g.timeout) {
    groupTimeout(entry, g.timeout);
  }

  exec(g.actions[data.key]);

  g.lastData = data;

  if (typeof data.number === 'number') {
    g.lastNumber = data.number;
  }

  return;

  function exec(action) {
//    console.log('EXEC', action);

    switch (typeof action) {
    case 'function':
      action(entry, data);
      return;
    case 'object':
      var t = action.target || g.target;
      if (t && (typeof action.command === 'string')) {
        entry.postTo(t, action.command, action.data);
      } else {
        M.log.error(Ose.error(entry, 'UNEXPECTED', 'Action without target', action));
      }
      return;
    case 'undefined':
      if (('number' in data) && (typeof g.number === 'function')) {
        g.number(entry, data);
        return;
      }

      if (entry.default !== g) {
        action = entry.default.actions[data.key];
        if (action) {
          exec(action);
        }
      }

      return;
    }

    throw Ose.error(entry, 'INVALID_ACTION', action);
  }
};

// }}}1
