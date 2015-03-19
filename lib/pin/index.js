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
 * @param req {Object} Pin register request
 *
 * @method init
 */

//  console.log('NEW PIN', req.index, pins.entry.identify());

  var that = this;

  if (! req.index && req.index !== 0) {
    O.link.error(socket, O.error(pins, 'Pin index is not specified', req));
    return;
  }

  if (req.index in pins.pins) {
    O.link.error(socket, O.error(pins, 'Pin was already registered', req));
    return;
  }

  this.caps = pins.caps[req.index];
  if (this.caps) this.caps = this.caps[req.type];
  if (! this.caps) {
    O.link.error(socket, O.error(pins, 'Pin was not found', req));
    return;
  }

  pins.pins[req.index] = this;

  this.pins = pins;
  this.index = req.index;
  this.type = pins.types[req.type];
  if (req.flavour) this.flavour = req.flavour;
  if (req.path) this.path = req.path;
  if (req.caption) this.caption = req.caption;
  if (req.entry) this.entry = req.entry;

  var state = {
    type: req.type,
    flavour: req.flavour,
    path: req.path,
    caption: req.caption,
    entry: req.entry,
    caps: this.caps,
  };

  var resp = {
    caps: this.caps,
  };

  if (pins.dummy) {
    state.dummy = true;
    resp.dummy = true;
    this.setupDummy(req, resp, state);
    open();
    return;
  }

  this.setup(req, resp, state, open);
  return;

  function onState(err) {  // {{{3
    if (! O.link.canOpen(socket)) {
      that.close();
      return;
    }

    if (err) {
      that.close();
      O.link.error(socket, err);
      return;
    }

    open();
    return;
  }

  function open() {  // {{{3
    var s = {};
    s[that.index] = state;
    that.pins.entry.setState({pins: s});
    O.link.open(that, socket, resp);
    return;
  }

  // }}}3
};

exports.identify = function() {  // {{{2
  var res = this.pins && this.pins.entry.identify() || {};
  res.pin = this.index;
  return res;
};

exports.setupDummy = function(req, resp, state) {  // {{{2
/**
 * Can't be asynchronous
 * TODO
 *
 */

  resp.value = state.raw = 0;
  resp.at    = state.at  = O._.now();
};

exports.setup = function(req, resp, state, cb) {  // {{{2
/**
 * `pin.setup()` calls cb with current pin value.
 * TODO
 *
 */

  if (this.type.setup) {
    this.type.setup(this, done);
    return;
  }

  if (this.type.read) {
    this.type.read(this, done);
    return;
  }

  throw O.error(this.pins, 'Pin type must have `setup()` or `read()` defined', req);

  function done(err, val) {
    if (err) {
      cb(err);
      return;
    }

    resp.value = state.raw = val;
    resp.at    = state.at  = O._.now();

    cb(null);
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
