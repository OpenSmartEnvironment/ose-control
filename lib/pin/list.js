'use strict';

var O = require('ose').class(module, C);

/** Docs  // {{{1
 * @submodule control.pin
 */

/**
 * @caption Pin List
 *
 * @readme
 * List of pins registered to the owning entry.
 * 
 * @class control.lib.pin.list
 * @type class
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
function C(entry, types, caps, dummy) {  // {{{2
/**
 * Constructor
 *
 * @param entry {Object} Controller entry
 * @param types {Object} List of pin types
 * @param caps {Object} List of all pins with their capabilities
 *
 * @method init
 */

  this.pins = {};

  this.entry = entry;
  this.entry.pins = this;

  if (! entry.state) {
    entry.state = {};
  }
  entry.state.pins = {};
  entry.state.pinTypes = {};

  this.types = {};
  for (var key in types) {
    var type = types[key];

    if (! ('name' in type)) {
      type.name = key;
    }

    this.types[key] = type;

    entry.state.pinTypes[key] = {
      name: key,
    };
  }

  this.caps = caps;
  this.dummy = dummy;

  this.onRemove = onRemove.bind(this);
  entry.once('remove', this.onRemove);
};

exports.cleanup = function(pin) {  // {{{2
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

  delete this.entry.pins;
  delete this.pins;
};

// }}}1
// Private {{{1
function onRemove() {  // {{{2
  // `this` is bound to list

  delete this.onRemove;

  this.cleanup();
};
// }}}1



/* CHECK {{{1
exports.update = function(index, value) {  // {{{2
/ **
 * Called from entry entry (device), when a pin value change is
 * detected
 *
 * @param index {String} Index of pin to be updated
 * @param value {Number} Value of physical pin
 *
 * @method update
 * /

//  console.log('PIN UPDATE');

  var pin = this.pins[index];
  if (pin) {
    if (pin.flavour.update) {
      pin.flavour.update(pin);
      return;
    }

    O.link.send(pin, 'update', value, true);
    return;
  }

  if (index in this.caps) {
    var s = {};
    s[index] = {
      value: value,
      at: new Date().getTime()
    };
    this.entry.setState({pins: s});
    return;
  }

  O.log.error(O.error(this, 'Invalid pin', {index: index, value: value}));
  return;
};

exports.register = function(req, socket) {  // {{{2
/ **
 * Register a pin.
 * 
 * @param req {Object} TODO request
 * @param req.index {String} Index of pin to be registered
 * @param req.type {String} Pin type
 * @param req.flavour {String} Pin flavour
 * @param socket {Object} TODO socket
 *
 * @returns {Object} Pin instance
 *
 * @method register
 * /

//  console.log('REGISTER PIN', req);

  var that = this;

  if (req.index in this.pins) {
    O.link.error(socket, O.error(this, 'Pin was already registerd', req));
    return;
  }

  var type = this.types[req.type];
  if (! type) {
    O.link.error(socket, O.error(this, 'Caps was not found', req));
    return;
  }

  var caps = this.caps[req.index];
  if (! caps) {
    O.link.error(socket, O.error(this, 'Pin was not found', req));
    return;
  }

  if (! (req.type in caps)) {
    O.link.error(socket, O.error(this, 'Caps was not found', req));
    return;
  }

  var path = req.flavour || req.type;
  if (path.indexOf('/') < 0) {
    path = 'ose-control/lib/pin/' + path;
  }

  new Pin(this, type, caps[req.type], require(path), req, socket);
  return;

  /* TODO
  if (! result.send) {
    result.send = pinSend;
  }

  setup(result, req, state, resp, function(err, val) {  // {{{3
    if (err) {
      done(err);
      return;
    }

    that.raw = val;
    if (that.dummy) {
      done();
      return;
    }

    if (type.setup) {
      type.setup(result, resp, done);
      return;
    }

    done();
    return;
  });

  return;

  function done(err) {  // {{{3
    if (! O.link.canClose(socket)) {
      O.link.error(result, O.error(result, 'Socket was closed in the meantime'));
      return;
    }

    if (err) {
      O.link.error(result, err);
      O.link.error(socket, err);
      return;
    }

    var s = that.entry.state.pins[result.index];
    if (s) {
      O._.extend(state, s);
    }

    // Write pin state info to "entry.state".
    s = {};
    s[result.index] = state;
    that.entry.setState({pins: s});

    O.link.open(result, socket, resp);
    return;
  }

  // }}}3

* /

};

exports.remove = function(pin) {  // {{{2
/ **
 * Removes pin
 *  
 * @param {Object} Pin to be removed
 *
 * @method remove
 * /

  if (! (pin.req.index in this.pins)) {
    throw O.error(this, 'invalidPin', pin.req.index);
  }

  delete this.pins[pin.req.index];
  delete pin.pins;

  if (pin.type.release && ! this.dummy) {
    pin.type.release(pin, O.dummyFn);
  }

  // Remove everything from pin state except `value` and `at`
  var c = this.entry.state.pins[pin.req.index];  // Current pin state
  if (c) {
    var s = {};  // New pin state
    for (var key in c) {
      switch(key) {
      case 'value':
      case 'at':
        break;
      default:
        s[key] = null;
      }
    }
    var n = {};  // New state
    n[pin.index] = s;

    this.entry.setState({pins: n});
  }

  if (O.link.canClose(pin)) {
    O.link.close(pin);
    return;
  }
};

function pinSend(value) {  // {{{2
  // "this" is bound to pin.

  var d = {
    value: value,
    at: O._.now()
  };
  this.link.update(d);

  var s = {};
  s[this.index] = {
    value: d.value,
    at: d.at,
  };
  this.pins.entry.setState({pins: s});
};

exports.readAll = function() {  // {{{2
/ **
 * Read raw values of all registered pins
 * 
 * @method readAll
 * /

  for (var key in this.pins) {
    var pin = this.pins[key];

    if (this.dummy) {

      continue;
    }

    if (pin.type && pin.type.read) {
      pin.type.read(pin);
    }
  }
};

}}}1 */
