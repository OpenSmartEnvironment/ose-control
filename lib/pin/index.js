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
 * For each entry of the Raspberry Pi [entry kind], a new [pin list]
 * is created. The [pin list] constructor receives an entry
 * representing a Raspberry Pi, a list of pin types and a list of pins
 * that can be controlled.
 *
 * Each Raspberry Pi entry is then ready to receive `registerPin` commands.
 *
 * An example [entry kind] that establishes a link to a Raspberry Pi
 * entry is the [switch kind]. After it is created, each entry of the
 * [switch kind] sends a `registerPin` command with a new client
 * socket to the controller entry defined by `entry.dval.master`.
 *
 * Based on this request, a new response socket controlling a
 * requested pin is created and set up by the Raspberry Pi entry. As a
 * response to the `registerPin` command, the current state of the
 * given switch is sent to the `open()` handler of the corresponding
 * client socket.
 *
 * Each time a physical pin changes its state, the `press` or
 * `release` commands of the client socket are invoked.
 *
 * The [light entry kind] or [heater entry kind], for example, are
 * implemented in a similar way
 *
 *
 * @description
 *
 * ## Communication
 *
 * Communication between a client and a controller consists of the
 * following steps:
 *
 * 1. Define a [client socket] with `update()` handler.
 *
 * 2. Send `registerPin` [command] with request containing pin index,
 *    pin type, optional [pin flavour],  configuration data and a
 *    client socket instance.
 *
 * 3. On the controller side, a new response socket is created and
 *    registered by a controllers entry, and the [link] is
 *    established.
 *
 * 4. On the client side, the `open()` client socket handler is
 *    invoked.
 *
 * Now it is possible to send `write()` requests from the client side
 * to change the physical or logical pin state of the controller. The
 * response socket calls the client's `update()` handler when a pin
 * value change is detected. Each pin can register only one active
 * [link] at a time.
 *
 *
 * ## How to use pins
 *
 * To create new entry kind describing some type of controller, follow
 * these steps:
 *
 * 1. Define a new [entry kind].
 *
 * 2. Define the `read()`, `write()`, `setup()` and `release()`
 *    methods for each pin type of the controller.
 *
 * 3. Define a list of pins with their capabilities.
 *
 * 4. Create a [pin list] instance for each entry in the `homeInit()`
 *    method of the given [entry kind].
 *
 * This can be used to easily integrate, for example, Arduino boards
 * or other controllers into the OSE ecosystem. If you wish to put
 * your effort into this challenge, don't hesitate to contact us via
 * [GitHub](https://github.com/OpenSmartEnvironment) for support.
 *
 *
 * ## Pin types
 *
 * Every pin has assigned a pin type, defined by the controller. The
 * type defines the `read()` and `write()` methods to read or update
 * the value of a physical pin on the controller. Each pin type can
 * have the `setup()` method that is called during the pin is
 * registered and te `release()` method called when the link to the
 * pin is disconnected.
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
 *
 * ## Pin flavours
 *
 * Communication between a pin and a client can be changed using pin
 * flavours. At registration time, the client can send a flavour value
 * with the `registerPin` request command. A new socket is created
 * based on `pin.flavour || pin.type`. Each flavour class is a
 * descendant of the [pin response socket] class.
 *
 * One example is the `switch` flavour. Client sockets connected to
 * standard pins receive `update` messages, but client sockets
 * connected to pins of the `switch` flavour receive `press`,
 * `release`, `tap` and `hold` messages instead.
 *
 * The following pin flavours are currently predefined:
 * - Counter
 * - Light
 * - Switch
 *
 *
 * ## Dummy pins
 * TODO
 *
 * @aliases pinFlavour
 * @module control
 * @submodule control.pin
 * @main control.pin
 */

/**
 * @caption Pin response socket
 *
 * @readme
 * Response socket representing a pin which handles communication with
 * a client.
 *
 * @aliases controllerPin
 *
 * @class control.lib.pin
 * @type class
 */

/**
 * Caption sent by client request
 *
 * @property caption
 * @type String
 */

/**
 * Path to flavour class
 *
 * @property path
 * @type String
 */

/**
 * Owning [pin list] reference
 *
 * @property pins
 * @type Object
 */

/**
 * Pin index
 *
 * Pin index of a controller entry.
 *
 * @aliases pinIndex
 * @property index
 * @type String
 */

/**
 * Pin type
 *
 * Pin type reference defined by controller entry
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
 * Pin capabilities are defined by the controller entry for each pin
 * and pin type.
 *
 * @property caps
 * @type Object
 */

// Public {{{1
exports.init = function(pins, req, socket) {  // {{{2
/**
 * Response pin socket initialization method (can be overwritten by
 * descendant flavours)
 *
 * @param pins {Object} [Pin list]
 * @param req {Object} Pin register request
 * @param socket {Object} Client socket
 *
 * @method init
 */

//  console.log('NEW PIN', req.index, pins.entry.toString());

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
  if (req.cease) this.cease = req.cease;

  var state = {
    type: req.type,
    caps: this.caps,
    flavour: req.flavour || null,
    path: req.path || null,
    caption: req.caption || null,
    entry: req.entry || null,
    cease: req.cease || null,
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

  this.setup(req, resp, state, function(err) {
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
  });
  return;

  function open() {  // {{{3
//    console.log('PIN OPEN', that.index, resp);

    var patch = {};
    patch[that.index] = state;
    that.pins.entry.setState({pins: patch});
    O.link.open(that, socket, resp);
    return;
  }

  // }}}3
};

exports.setupDummy = function(req, resp, state) {  // {{{2
/**
 * Set up dummy pin
 *
 * Can't be asynchronous
 * Can be overridden by flavour
 *
 * @param req {Object} Client request
 * @param resp {Object} Prepared response to client request
 * @param state {Object} Prepared state object
 *
 * @method setupDummy
 * @internal
 */

  resp.value = state.raw = 0;
  resp.at    = state.at  = O._.now();
};

exports.setup = function(req, resp, state, cb) {  // {{{2
/**
 * Set up physical pin
 *
 * On success, `cb()` gets called with current pin value.
 *
 * @param req {Object} Client request
 * @param resp {Object} Prepared response to client request
 * @param state {Object} Prepared sval patch object
 * @param cb {Function} Callback to be called after pin setup
 *
 * @method setup
 * @async
 * @internal
 */

//  console.log('PIN SETUP', this.index);

  var that = this;

  if (this.type.setup) {
    this.type.setup(this, done);
    return;
  }

  if (this.type.read) {
    this.type.read(this, done);
    return;
  }

  throw O.log.error(this.pins, 'Pin type must have `setup()` or `read()` defined', req);

  function done(err, val) {
//    console.log('PIN SETUP RESPONSE', that.index, val, err);

    if (err) {
      cb(err);
      return;
    }

    if (typeof val !== 'number' || isNaN(val)) {
      throw O.log.error(that, 'Invalid value', val);
    }

    resp.value = state.raw = val;
    resp.at    = state.at  = O._.now();

//    console.log('PIN SETUP RESPONSE', that.index, resp);

    cb();
    return;
  }
};

exports.update = function(val) {  // {{{2
/**
 * Called on change of physical pin state
 *
 * @param val {Number} New value
 *
 * @method update
 * @internal
 */

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
 * @copyMethod socketClose
 * @method close
 */

  var e = this.pins.entry;
  if (e && ! e.isGone()) {
    var s = {};
    s[this.index] = null;
    e.setState({pins: s});
  }

  var p = this.pins;

  delete p.pins[this.index];
  delete this.pins;

  if (! p.dummy && this.type && this.type.release) {
    this.type.release(this, O._.noop);
  }
};

exports.error = function(err) {  // {{{2
/**
 * @copyMethod socketError
 * @method error
 */

  this.close();
};

// }}}1
