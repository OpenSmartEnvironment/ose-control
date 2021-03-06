'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Switch relay response socket
 *
 * @readme
 * [Response socket] relaying the switch entry events to the client socket.
 *
 * @class control.lib.switch.relay
 * @type class
 */

// Public {{{1
function init(entry, socket, req) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Switch entry
 *
 * @method constructor
 */

  this.entry = entry;

  relay(this, 'press');
  relay(this, 'release');
  relay(this, 'tap');
  relay(this, 'hold');

  O.link.open(this, socket);
};

exports.close = function(req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Object}
 *
 * @method close
 */

  this.entry.removeListener('press', this.press);
  this.entry.removeListener('release', this.release);
  this.entry.removeListener('tap', this.tap);
  this.entry.removeListener('hold', this.hold);
};

exports.error = function(err) {  // {{{2
/**
 * Error handler
 *
 * @param err {Object} [Error] instance
 *
 * @method error
 */

  O.log.error(err);

  this.close(err.message);
};

// Private {{{1
function relay(that, ev) {  // {{{2
  that[ev] = that.entry.on(ev, function(val) {
    O.link.send(that, ev, val);
  });
};

