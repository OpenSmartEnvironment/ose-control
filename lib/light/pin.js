'use strict';

const O = require('ose')(module)
  .class(init, 'ose/lib/entry/command')
;

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Light channel-to-controller pin client socket
 *
 * @readme
 * Establishes a link for a channel to the `dval.master`
 * controller.
 *
 * @class control.lib.light.pin
 * @type class
 */

// Public {{{1
function init(entry, name, type, index) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  if (name in entry.channels) {
    throw O.log.error(this, 'Duplicit channel', name);
  }
  entry.channels[name] = this;
  this.name = name;

  O.inherited(this)(entry, entry.dval.master, 'registerPin', {
    caption: entry.getCaption() + ' ' + name,
    type: type,
    flavour: 'light',
    index: index,
  });
};

exports.synced = function(val, data) {  // {{{2
  if (val) {
    var s = {};
    s[this.name] = {
      synced: true,
      caps: data.caps,
    };
    this.entry.setState({channels: s});

    this.update(data);
  } else {
    var s = {};
    s[this.name] = {synced: false};
    this.entry.setState({channels: s});
  }
};

exports.update = function(req) {  // {{{2
/**
 * Invoked on controller pin change
 *
 * @param req {Object} Update request
 *
 * @method update
 * @handler
 */

//  console.log('LIGHT PIN UPDATE', req);

  if (
    (typeof req.value !== 'number') ||
    (req.value < 0) ||
    (req.value > 1) ||
    isNaN(req.value)
  ) {
    O.link.error(this, O.error(this, 'INVALID_ARGS', req));
    return;
  }

  var e = this.entry;

  var patch = {};
  patch[this.name] = {
    value: req.value,
    at: req.at,
    aim: req.aim,
    time: req.time,
  };

  e.setState({channels: patch});
  return;
};

// }}}1
