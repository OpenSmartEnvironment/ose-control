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
 *
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
  var r;
  var e = this.entry;

  if (e.lastIp) {
    r = ++e.lastIp;

    if (r >= Ip.toLong(e.data.end)) {
      r = undefined;
    }
  }

  if (! r) {
    r = Ip.toLong(e.data.start);
  }

  e.lastIp = r;

  O.link.close(socket, Ip.fromLong(r));
};

// }}}1
