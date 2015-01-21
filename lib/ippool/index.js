'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

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
    r = e.lastIp++;

    if (Ip.toLong(e.data.end) >= r) {
      r = undefined;
    }
  }

  if (! r) {
    r = Ip.toLong(e.data.start);
  }

  e.lastIp = r;

  Ose.link.close(socket, r);
};

// }}}1
