'use strict';

var O = require('ose').module(module);

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
 * For examples, see the [ose-example-lirc] package
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
 * @type module
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
    O.log.warn('Overwriting REMOTE group!', {key: key, entry: entry.toString(), group: group});
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

exports.add = function(group, key, val) {  // {{{2
/**
 * Adds an action to the group assigned to the remote command
 *
 * @param group {Object} Group of remote commands
 * @param key {Number} Remote command name
 * @param val {Object} Action to be taken
 *
 * @method add
 */

//  console.log('ADD ITEM', group.key, key, val);

  if (key in group.actions) {
    O.log.warning('Overwriting remote group action', {group: group.key, key: key, data: val});
  }

  group.actions[key] = val;

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

exports.receive = function(entry, val) {  // {{{2
/**
 * Called by remote controller receiver entry when a key is pressed
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param val {Object} Data object
 * @param val.key {String} Key name
 * @param val.count {Number} Number of repeats
 *
 * @method receive
 */

  var group;
  var action;

  var number = parseInt(val.key);
  if (! isNaN(number)) {
    val.number = number;
  }

//  console.log('REMOTE RECEIVE', val);

  if (entry.groupTimeout) {
    clearTimeout(entry.groupTimeout);
    delete entry.groupTimeout;
  }

  callAction(entry, val);
  return;
};

exports.next = function(entry, val) {  // {{{2
/**
 * Next channel handler
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param val {Object} Data object
 * @param val.key {String} Key name
 * @param val.count {Number} Number of repeats
 * @param val.number {Number} Resulting decimal number
 *
 *
 * @method next
 */

  offset(entry, val, 1);
};

exports.prev = function(entry, val) {  // {{{2
/**
 * Previous channel handler
 *
 * @param entry {Object} Remote controller receiver entry
 *
 * @param val {Object} Data object
 * @param val.key {String} Key name
 * @param val.count {Number} Number of repeats
 * @param val.number {Number} Resulting decimal number
 *
 * @method prev
 */

  offset(entry, val, -1);
};

// }}}1
// Private {{{1
function offset(entry, val, offset) {  // {{{2
  val.offset = offset;

  val.number = (entry.group.lastNumber || 0) + offset;
  if (val.number < 0) val.number = 0;
  val.key = val.number;

  callAction(entry, val);
  return;
};

function groupTimeout(entry, timeout) {  // {{{2
/**
 * Reset current group after timeout to last group without timeout.
 */

  if (entry.groupTimeout) {
    clearTimeout(entry.groupTimeout);
    delete entry.groupTimeout;
  }

  entry.groupTimeout = setTimeout(function() {
//    console.log('GROUP RESET', entry.lastGroup.key);

    delete entry.groupTimeout;
    entry.group = entry.lastGroup;
  }, timeout);
}

function callAction(entry, val) {  // {{{2
//  console.log('REMOTE CALL ACTION', val, entry.group.lastNumber);

  var g = entry.group;
  if (g.timeout) {
    groupTimeout(entry, g.timeout);
  }

  exec(g.actions[val.key]);

  g.lastData = val;

  if (typeof val.number === 'number') {
    g.lastNumber = val.number;
  }

  return;

  function exec(action) {
//    console.log('EXEC', action);

    switch (typeof action) {
    case 'function':
      action(entry, val);
      return;
    case 'object':
      if (action.firstOnly && val.count >= 1) {
        return;
      }

      var t = action.target || g.target;
      if (t && (typeof action.command === 'string')) {
        entry.shard.post(t, action.command, action.data);
        return;
      }

      O.log.error(entry, 'UNEXPECTED', 'Action without target or command', action);
      return;
    case 'undefined':
      if (('number' in val) && (typeof g.number === 'function')) {
        g.number(entry, val);
        return;
      }

      if (entry.default !== g) {
        action = entry.default.actions[val.key];
        if (action) {
          exec(action);
        }
      }

      return;
    }

    throw O.log.error(entry, 'Invalid action', action);
  }
};

// }}}1
