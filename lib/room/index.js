'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'room');

/** Doc {{{1
 * @caption Rooms
 *
 * @readme
 * This component defines basic room entry kinds. By configuring
 * entries of these kinds, it is possible to define an indoor
 * environment and its behaviour.
 *
 * For a simple example of how to control a light using a switch, see
 * the [Raspberry Pi example].
 *
 * @module control
 * @submodule control.room
 * @main control.room
 */

/**
 * @caption Room kind
 *
 * @readme
 * [Entry kind] defining behaviour of rooms.
 *
 * Various activities can be defined for each room. Activities govern
 * the behaviour of rooms. When an activity is selected, it sends
 * commands to entries and trigger scheduled actions.
 *
 * Each activity is identified by its name and can be selected by a
 * command sent to the room entry. Each activity should be a
 * descendant of the [activity class].
 *
 * Example:
 *
 * The living room may have the following activities defined:
 *
 * - watching TV (lights dimmed, TV on, blinds down if dark outside,
     etc.)
 * - tidying (lights fully on, radio on)
 * - reading (lights half on, multimedia off)
 *
 * Another example:
 *
 * The house may have the following activities:
 * - at home (full comfort)
 * - empty house (detection of intruders, heating down, etc.)
 * - vacation (random actions simulating the presence of inhabitants)
 *
 * @kind room
 * @schema control
 * @class control.lib.room
 * @extend ose.lib.kind
 * @type class
 */

/**
 * Activity
 *
 * Currently selected room activity
 *
 * @property sval.activity
 * @type Object
 */

/**
 * Activity name
 *
 * Currently selected room activity name
 *
 * @property sval.activity.name
 * @type String
 */

/**
 * Configurations of activities for current room. Keys are names, and
 * values are optional configuration objects.
 *
 * @property dval.activities
 * @type Object
 */

/**
 * Initialization methods for activities. Keys are names, and values
 * are functions.
 *
 * @property activities
 * @type {Object}
 */

// Public {{{1
exports.role = ['area', 'room'];

exports.ddef = O.new('ose/lib/field/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('parent')  // {{{3
    .detail(11)
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/field/object')()  // {{{2
  .text('activity')  // {{{3
    .detail(1)
    .parent

  // }}}3

exports.on('activity', function(req, socket) {  // {{{2
/**
 * Change room activity.
 *
 * @param req {String | Object} Request object or activity name
 * @param req.name {String} Activity name
 * @param [socket] {Object} Optional response socket
 */

//  console.log('ACTIVITY RECEIVED', req);

  if (typeof req !== 'object') {
    req = {name: req};
  }

  var result;
  var e = this.entry;

  result =
    e.activities[req.name] ||
    e.dval && e.dval.activities && e.dval.activities[req.name]
  ;

  switch (typeof result) {
  case 'object':
    break;
  case 'string':
    result = new (O.getClass(result))(req.name, e);
    break;
  case 'undefined':
    O.link.error(socket, O.error(this.entry, 'Activity not found', req.name));
    return;
  default:
    O.link.error(socket, O.error(e, 'Invalid request', req));
    return;
  }

  if (e.sval.activity === req.name) {
    result.update(req, socket);
    return;
  }

  var old = e.activities[e.sval.activity];
  old && old.stop();

  result.start(req, socket);

  e.setState({activity: req.name});

  return;
});

exports.homeInit = function(entry) {  // {{{2
  if (! entry.sval) entry.sval = {};
  if (! entry.activities) entry.activities = {};
};

exports.layout('detail', function() {  // {{{2
  var view = this.view2({
    view: 'list',
    listItems: true,
    ident: {
      schema: 'control',
      query: 'parent',
      space: this.entry.shard.space.name,
    },
    filter: {
      parent: this.entry.getLookupIdent(),
    },
  });

  this.li('divider')
    .h2('Contains:')
    .append2(view)
  ;

  view.loadData(this.bindUpdate());

  this.on('removed', function() {
    view.remove();
  });
});
