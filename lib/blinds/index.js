'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'blinds');

/** Doc {{{1
 * @submodule control.room
 */

/**
 * @caption Blinds kind
 *
 * @readme
 * [Entry kind] defining blinds behaviour.
 *
 * @kind blinds
 * @class control.lib.blinds
 * @extend ose.lib.kind
 * @type class
 */

// Public {{{1
exports.role = ['updown', 'blinds'];

exports.ddef = O.new('ose/lib/field/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('parent')  // {{{3
    .detail(10.5)
    .parent

  .entry('master')  // {{{3
    .detail(11)
    .parent

  .text('pin')  // {{{3
    .detail(12)
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/field/object')()  // {{{2
  .number('pos')  // {{{3
    .describe('Position', 'Blinds position in percentage')
    .params({
      unit: '%',
      min: 0,
      max: 1,
      decimal: 2,
    })
    .detail(1, {
      post: 'set',
      display: function(view, fieldWrap) {
        fieldWrap.field.displayDetail(view, fieldWrap);
        appendButtons(view.entry, view.li());
      }
    })
    .parent

  .object('pin')  // {{{3
    .describe('Master pin state')

    .integer('value')
      .describe('Master pin value')
      .detail(2)
      .parent

    .millitime('at')
      .describe('Master pin last change')
      .detail(3)
      .parent

    .parent

  .object('aim')  // {{{3
    .describe('Running change')
    .detail(100, function(view, wrap) {
      view.find('span.slider').params({aimWrap: wrap});
    })

    .number('value')
      .parent

    .millitime('at')
      .parent

    .parent

  // }}}3
;

exports.on('stop', function(req, socket) {  // {{{2
  var entry = this.entry;

  if (! O.link.canSend(entry.pin)) {
    return cb(O.error(entry, 'Master is not connected', {master: entry.dval.master, pin: entry.dval.pin}));
  }

  if (entry.aim) {
    clearTimeout(entry.aim.timer);
    O.async.setImmediate(entry.aim.cb);

    var current = entry.sval && entry.sval.pos || 0;
    if (entry.sval && entry.sval.aim) {
      current += (entry.sval.aim.value - current) * (Date.now() - entry.sval.aim.at) / entry.dval.time;
    }

    delete entry.aim;

    entry.setState({
      pos: current,
      aim: null,
    });
  }

  O.link.send(entry.pin, 'write', 0, socket);
});

exports.on('set', function(req, socket) {  // {{{2
/**
 * Set blinds to specific values
 *
 * @param req {Boolean | Number | String} Value between 0..1
 * @param [socket] {Object} Command response socket
 *
 * @method power
 * @handler
 */

  if (typeof req === 'string') {
    if (req === 'semi') {
      req = this.entry.dval.semi || 0.06;
    } else {
      req = parseFloat(req);
    }
  }

  if (typeof req !== 'number' || isNaN(req)) {
    return O.link.error(socket, 'INVALID_ARGS', 'request', req);
  }

  if (req < 0) {
    req = 0;
  } else if (req > 1) {
    req = 1;
  }

  switch (req) {
  case 0:
    return aim(this.entry, {delta: -1}, respond);
  case 1:
    return aim(this.entry, {delta: 1}, respond);
  }

  return aim(this.entry, {value: req}, respond);

  function respond(err) {
    if (! O.link.canClose(socket)) return;
    if (err) return O.link.error(socket, err);

    return O.link.close(socket, 'done');
  }
});

exports.on('move', function(req, socket) {  // {{{2
/**
 * Move blinds of some delta
 *
 * @param req {Boolean | Number | String} Value between 0..1
 * @param [socket] {Object} Command response socket
 *
 * @method power
 * @handler
 */

  if (typeof req === 'string') {
    req = parseFloat(req);
  }

  if (typeof req !== 'number' || isNaN(req)) {
    return O.link.error(socket, 'INVALID_ARGS', 'request', req);
  }

  aim(this.entry, {delta: req}, function(err) {
    if (! O.link.canClose(socket)) return;
    if (err) return O.link.error(socket, err);

    return O.link.close(socket, 'done');
  });
});

exports.homeInit = function(entry) {  // {{{2
  entry.on('remove', onRemove.bind(entry));

  /*
  entry.onStates({
    'enabled': onEnabled,
    'power': onPower,
    'value': onValue,
  });

  if (entry.dval.tariff) {
    entry.tariff = new Tariff(entry);
  } else {
    O.log.error(entry, 'INVALID_CONFIG', 'The heater entry can\'t be turned on without `dval.tariff`.');
  }
*/

  if (entry.dval && entry.dval.time && entry.dval.master && entry.dval.pin) {
    entry.pin = O.new('../pin/client')(entry, 'tri');
    /*
  } else {
    O.log.error(entry, 'Can\'t connect to the master controller, "blinds" configuration is not valid.');
    */
  }
};

exports.layout('listItem', {  // {{{2
  displayLayout: function() {
    this
      .empty()
      .on('tap', this.tapItem.bind(this))
      .section('row')
        .h3(this.entry.getCaption(), 'stretch')
        .span(formatPos(this.entry))
        .style('padding-bottom', '10px')
    ;

    appendButtons(this.entry, this);
  },
  patch: function(val) {
    if (! val) return;

    val = val.spatch;

    if (val === null) {
      this.find('span').text();
      return;
    }

    if (! val) return;

    if ('pos' in val) {
      this.find('span').text(formatPos(this.entry));
    }
  },
});

// Private {{{1
function aim(entry, req, cb) {  // Take appropriate actions to change blind position based on req {{{2
/*
 * @param req {Object} Parameter should contain one of the following keys:
 *   value: {Number} 0 .. 1,  // Desired value
 *   delta: {Number} -1 .. 1,  // Desired change
 */

  if (! O.link.canSend(entry.pin)) {
    return cb(O.error(entry, 'Master is not connected', {master: entry.dval.master, pin: entry.dval.pin}));
  }

  req.current = entry.sval && entry.sval.pos || 0;
  if (entry.aim) {
    clearTimeout(entry.aim.timer);
    O.async.setImmediate(entry.aim.cb);

    if (entry.sval && entry.sval.aim) {
      req.current += (entry.sval.aim.value - req.current) * (Date.now() - entry.sval.aim.at) / entry.dval.time;
    }
  }

  if ('delta' in req) {
    req.value = req.current + req.delta;

    if (! req.delta) {
      return off();
    }

    req.time = req.delta;
  } else {
    if (req.value === req.current) {
      return off();
    }

    req.time = req.value - req.current;
  }

  req.direction = req.time > 0 ? 1 : -1;
  req.time = Math.abs(req.time) * entry.dval.time;

  entry.setState({aim: {
    value: req.value,
    at: Date.now(),
  }});

  entry.aim = {
    cb: cb,
  };

  entry.aim.timer = setTimeout(off, req.time);
  O.link.send(entry.pin, 'write', req.direction);
  return;

  /*
  if (req.value > req.current) {
    entry.aim.timer = setTimeout(off, (req.value - req.current) * entry.dval.time);
    O.link.send(entry.pin, 'write', 1);
    return;
  }

  entry.aim.timer = setTimeout(off, (req.current - req.value) * entry.dval.time);
  O.link.send(entry.pin, 'write', -1);
  return;
  */

  function off() {
    if (req.value < 0) req.value = 0;
    if (req.value > 1) req.value = 1;

    delete entry.aim;

    entry.setState({
      pos: req.value,
      aim: null,
    });

    O.link.send(entry.pin, 'write', 0);
    cb();
  }
}

function onRemove() {  // {{{2
  if (this.aim) {
    if (O.link.canSend(this.pin)) {
      O.link.send(this.pin, 'write', 0);
      O.link.close(this.pin);
    }
    clearTimeout(this.aim.timer);
  }
}

function appendButtons(entry, parent) {  // Append control buttons to parent {{{2
  return parent.tree('buttons', 'row center no-child-padding', {
    type: 'char',
    buttons: ['stop', 'grid', 'select', 'right', 'left', 'pause'],

    input: function onInput(ev) {  // {{{3
      switch (ev.value) {
      case 'stop':  // Close
        entry.post('set', 0);
        return false;
      case 'grid':  // Semi-open
        entry.post('set', 'semi');
        return false;
      case 'select':  // Open
        entry.post('set', 1);
        return false;
      case 'right':  // Go up
        entry.post('move', 0.01);
        return false;
      case 'left':  // Go down
        entry.post('move', -0.005);
        return false;
      case 'pause':  // Stop
        entry.post('stop');
        return false;
      }

      throw O.log.error(wrap, 'Invalid value', ev);
    },

    setup: function(wrap) {  // Up and down buttons act on hold and release events {{{3
      ['right', 'left'].forEach(function(name) {
        wrap.find('i[data-icon="' + name + '"]')
          .addClass('anticlockwise')
          .params({holdTimeout: 100})
          .on('hold', function() {
            switch (name) {
            case 'right':
              entry.post('set', 1);
              return false;
            case 'left':
              entry.post('set', 0);
              return false;
            }
            throw O.log.error(entry, 'Invalid name', name);
          })
          .on('release', function() {
            entry.post('stop');
            return false;
          });
      });
    },

    // }}}3
  });
}

function formatPos(entry) {  // {{{2
  switch (entry.sval.pos) {
  case undefined:
    return 'Unknown';
  case 0:
    return 'Closed';
  case 1:
    return 'Opened';
  default:
    return  Math.trunc(entry.sval.pos * 100) + ' %';
  }
}
