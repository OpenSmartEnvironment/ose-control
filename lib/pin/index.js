'use strict';

var O = require('ose').module(module);

/** Doc {{{
 * @caption Pins
 *
 * @readme
 * This component allows to simply define an [entry kind] describing
 * some type of controller with individual physical or logical
 * pins, such as a [Raspberry Pi] with its GPIO pins.
 *
 * Each entry of a kind using this component can establish [links] to
 * individual pins. An example [entry kind] that establishes a link to a
 * controller switching some physical pin is the [heater].
 *
 * Communication between a client and a controller consists of the
 * following steps:
 *
 * 1. Define a [client socket] class with `update()` handler.
 * 2. Send `registerPin` [command] with request containing pin
 *    index, pin type, optional configuration data and a client
 *    socket instance.
 * 3. On the controller side, a new response socket is created and
 *    registered by a controllers entry [pin list], and the [link] is
 *    established.
 * 4. On the client side, the `open()` client socket handler is
 *    invoked.
 *
 * Now it is possible to send `read()` or `update()` requests from the
 * client side to read or change the physical or logical pin state of
 * the controller. The response socket calls the client's `update()`
 * handler when a pin value change is detected. Each pin can register
 * only one active [link] at a time.
 *
 * To create new entry kind describing some type of controller, follow
 * these steps:
 *
 * 1. Define a new [entry kind].
 * 2. Define the `read()`, `write()` and `setup()` methods for each
 *    pin type of the controller.
 * 3. Define list of pins describing which pin can be of which type.
 * 4. Create [pin list] instance for each entry in `homeInit()` method
 *    of such kind.
 *
 * This can be used to easily integrate, for example, Arduino boards
 * or other controllers into the OSE ecosystem. If someone wants to
 * put his effort into this challenge, don't hesitate to contact us
 * via [GitHub](https://github.com/OpenSmartEnvironment) for support.
 *
 *
 * @description
 *
 * ## Pin types
 *
 * Every pin has assigned a pin type, defined by the controller. Type
 * defines the `read()` and `write()` methods to read or update the
 * value of a physical pin on the controller. Pin type can have the
 * `setup()` method that is called during the pin is registered.
 *
 * The Raspberry Pi entry kind, for example, defines the `din` and
 * `dout` pin types. Both these types have the `setup()` method that
 * sets up a Gpio class instance from the
 * [onoff](https://www.npmjs.org/package/onoff) npm package for each
 * registered pin to read or write the pin's value.
 *
 * There are following pre-defined pin types:
 * - Digital input
 * - Digital output
 * - PWM
 *
 * ## Flavours
 *
 * Communication between a pin and a client can be changed using pin
 * flavours.  At registration time, the client can send a flavour
 * value with the `registerPin` request command.
 *
 * There are following predefined pin flavours:
 * - Counter
 * - Light
 * - Switch
 *
 * Examples are a [switch entry] that registers to the entry's pin
 * with `flavour: 'switch'` or a [light entry] that registers each
 * channel with `flavour: 'light'`.
 *
 * @module control
 * @submodule control.pin
 * @main control.pin
 */

/**
 * @caption Pin response socket
 *
 * @readme
 * Response socket representing one pin that handles the communication
 * with a client.
 *
 * @aliases controllerPin
 *
 * @class control.lib.pin
 * @type class
 */

/**
 * Owning [pin list] reference
 *
 * @property index
 * @type String
 */

/**
 * Pin index
 *
 * Pin index within entry [entry]
 *
 * @aliases pinIndex
 * @property index
 * @type String
 */

/**
 * Pin type
 *
 * Pin type reference
 *
 * @aliases pinType pinTypes
 * @property type
 * @type Object
 */

/**
 * Pin flavour
 *
 * Pin flavour name
 *
 * @aliases pinFlavour pinFlavours
 * @property flavour
 * @type String
 */

/**
 * Pin capabilities reference.
 *
 * Pin capabilities are defined by the entry entry for each pin and
 * pin type.
 *
 * @property caps
 * @type Object
 */

// Public {{{1
exports.init = function(pins, req, socket) {  // {{{2
/**
 * TODO
 *
 * @param pins {Object} [Pin list]
 * @param index {String} Pin index
 * @param type {Object} Pin type
 * @param caps {Object} Pin capabilities
 *
 * @method init
 */

  var that = this;

  if (! req.pin && req.pin !== 0) {
    O.link.error(socket, O.error(pins, 'Pin index is not specified', req));
    return;
  }

  if (req.pin in pins.pins) {
    O.link.error(socket, O.error(pins, 'Pin was already registered', req));
    return;
  }

  this.index = req.pin;
  this.caps = pins.caps[this.index];
  if (this.caps) this.caps = this.caps[req.type];
  if (! this.caps) {
    O.link.error(socket, O.error(pins, 'Pin was not found', req));
    return;
  }

  this.req = req;
  this.pins = pins;
  pins.pins[this.index] = this;

  var state = {
    type: req.type,
    caps: this.caps,
    path: req.path,
    flavour: req.flavour,
    caption: req.caption,
    entry: req.entry,
  };

  this.setup(state, function(err, resp) {
    if (! O.link.canOpen(socket)) {
      that.close();
      return;
    }

    if (err) {
      that.close();
      O.link.error(socket, err);
      return;
    }

    var s = {};
    s[that.index] = state;
    that.pins.entry.setState({pins: s});
    O.link.open(that, socket, resp);
    return;
  });
  return;
};

exports.setup = function(state, cb) {  // {{{2
  if (this.pins.dummy) {
    state.raw = 0;
    cb(null, {
      value: 0,
      at: O._.now(),
      caps: this.caps,
    });
    return;
  }

  var t = this.pins.types[this.req.type];

  if (! t.setup) {
    if (! t.read) {
      throw O.error(this.pins.entry, 'Pin type must have `setup()` or `read()` defined', this.req);
    }

    t.read(this, done);
    return;
  }

  t.setup(this, done);
  return;
  
  function done(err, val) {
    if (err) {
      cb(err);
      return;
    }

    state.raw = val;
    state.at = O._.now();

    that.type = t;
    cb(null, {
      value: val,
      at: state.at,
      caps: this.caps,
    });
    return;
  }
};

exports.update = function(val) {  // {{{2
  var s = {};
  s[this.index] = {
    at: O._.now(),
    raw: val,
  };
  this.pins.entry.setState({pins: s});

  if (! O.link.canSend(this)) return;

  O.link.send(this, 'update', {
    value: val,
    at: s[this.index].at,
  });
  return;
};

exports.close = function() {  // {{{2
/**
 * Close handler
 *
 * @method close
 */

  var e = this.pins.entry;
  if (e && ! e.isRemoved()) {
    var s = {};
    s[this.index] = null;
    e.setState({pins: s});
  }

  delete this.pins.pins[this.index];
  delete this.pins;

  if (this.type && this.type.release) {
    this.type.release(this);
  }
};

exports.error = function(err) {  // {{{2
/**
 * Error handler
 *
 * @param err {Object} [Error] object
 *
 * @method error
 */

  this.close();
};

// }}}1




/* CHECK{{{1
exports.read = function(req, socket) {  // {{{2
/ **
 * Read request handler
 *
 * @param req {Object} Request data
 * @param [socket] {Object} Optional response socket only for this
 *   request. After the read request is processed, `socket.close()` is
 *   invoked with the response. Pin changes are always sent to the
 *   client by a `link.update()` call.
 *
 * @method read
 * /

//  console.log('PIN READ', this.index, req);

  if (this.pins.dummy) {
    done(this.value);
    this.send(this.value);
    return;
  }

  if (this.type.read) {
    this.type.read(this, req, socket);
    return;
  }

  O.link.error(
    socket || this,
    O.error(this, 'Read not implemented', req)
  );
  return;

  function done() {};
};

exports.write = function(req, socket) {  // {{{2
/ **
 * Update request handler, calls `this.type.write()` to change
 * physical pin value.  This method can be overridden by individual pin
 * flavours.
 *
 * @param req {Object} Request data
 *
 * @method write
 * /

//  console.log('PIN UPDATE', this.index, req);

  var that = this;

  if (this.pins.dummy) {
    this.value = req;
    done(null, true);
    return;
  }

  if (this.type.write) {
    this.type.write(this, req, done);
    return;
  }

  O.link.error(socket || this, O.error(this, 'Update not implemented', req));
  return;

  function done(err, update) {  // {{[3
    if (err) {
      O.log.error(err);
      return;
    }

    if (! update) return;

    var d = {
      at: O._.now(),
      value: req,
    };
    O.link.send(that, 'update', d);

    var s = {};
    s[that.index] = {
      at: d.at,
      value: d.value,
    };

    that.pins.entry.setState({pins: s});
    return;
  }

  // }}}3
};

// }}}1*/
