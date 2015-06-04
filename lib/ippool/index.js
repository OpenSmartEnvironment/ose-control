'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var Ip = require('ip');

/** Doc {{{1
 * @module control
 */

/**
 * @caption IP pool kind
 *
 * @readme
 * IP address pool. Respond to "getIp" commands by providing a new IP
 * address from a pool defined by the `dval.start` .. `dval.end`
 * interval. Used by the [ose-dvb] package to assign multicast group
 * addresses to DVB channels.
 *
 * @kind ippool
 * @class control.lib.ippool
 * @extend ose.lib.kind
 * @type singleton
 */

// Public {{{1
exports.init = function() {  // {{{2
  this.on('getIp', getIp);
};

// }}}1
// Private {{{1
function getIp(req, socket) {
/**
 * Handler for getIp commands
 *
 * @param req {Undefined}  Request
 * @param socket {Object} Client socket
 *
 * @method getIp
 * @handler
 */
  var r;
  var e = this.entry;

  if (e.lastIp) {
    r = ++e.lastIp;

    if (r >= Ip.toLong(e.dval.end)) {
      r = undefined;
    }
  }

  if (! r) {
    r = Ip.toLong(e.dval.start);
  }

  e.lastIp = r;

  O.link.close(socket, Ip.fromLong(r));
};

// }}}1
