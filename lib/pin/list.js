'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Docs  // {{{1
 * @submodule control.pin
 */

/**
 * @caption Pin List
 *
 * @readme
 * List of pins registered in the owning entry.
 *
 * @class control.lib.pin.list
 * @type class
 */

/**
 * If `dummy` is truish, states of physical pins are not changed
 *
 * @property dummy
 * @type Boolean
 */

/**
 * Controller entry
 *
 * @property entry
 * @type Object
 */

/**
 * List of connected sockets to individual pins
 *
 * @property pins
 * @type Object
 */

/**
 * List of pin types
 *
 * @property types
 * @type Object
 */

/**
 * List of available pins with their capabilities
 *
 * @property caps
 * @type Object
 */

// Public {{{1
function init(entry, types, caps, dummy) {  // {{{2
/**
 * Constructor
 *
 * @param entry {Object} Controller entry
 * @param types {Object} List of pin types
 * @param caps {Object} List of all pins with their capabilities
 * @param dummy {Boolean} If `dummy` is truish, states of physical pins are not changed
 *
 * @method constructor
 */

  var s = {};

  this.pins = {};

  this.entry = entry;
  entry.pins = this;

  s.pins = {};
  s.pinTypes = {};

  this.types = {};
  for (var key in types) {
    var type = types[key];

    if (! ('name' in type)) {
      type.name = key;
    }

    this.types[key] = type;

    s.pinTypes[key] = {name: key};
  }

  this.caps = caps;
  this.dummy = dummy;

  this.onRemove = onRemove.bind(this);
  entry.once('remove', this.onRemove);

  entry.setState(s);
};

exports.toString = function() {  // {{{2
/**
 * Return short description
 *
 * @return {String} Description
 *
 * @method toString
 */

  return 'Pin list: ' + this.entry && this.entry.toString();
};

exports.cleanup = function() {  // {{{2
/**
 * Called when this object is destroyed
 *
 * @method cleanup
 * @internal
 */

  if (this.onRemove) {
    this.entry.removeListener('remove', this.onRemove);
    delete this.onRemove;
  }

  for (var key in this.pins) {
    var p = this.pins[key];
    if (O.link.canSend(p)) {
      O.link.close(p);
    }
  }

  if (this.entry) {
    delete this.entry.pins;
    delete this.entry;
  }
};

exports.readAll = function() {  // {{{2
/**
 * Read values of all registered pins
 *
 * @method readAll
 */

  for (var key in this.pins) {
    var pin = this.pins[key];

    if (this.dummy) {
      pin.update(0);
      continue;
    }

    if (! pin.type) continue;  // Pin is not yet configured

    pin.type.read(pin, (function(p, err, val) {
      if (err) {
        O.log.error(err);
        return;
      }

      p.update(val);
      return;
    }).bind(null, pin));
  }
};

// Private {{{1
function onRemove() {  // {{{2
  // `this` is bound to list

  delete this.onRemove;

  this.cleanup();
}

