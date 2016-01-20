'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('control', 'blinds');

/* * Doc {{{1
 * @submodule control.room
 */

/* *
 * @caption Blinds kind
 *
 * @readme
 * [Entry kind] defining blinds behaviour.
 *
 * TODO
 *
 * @kind blinds
 * @class control.lib.blinds
 * @extend ose.lib.kind
 * @type class
 */

/* *
 * Controller entry identification object.
 *
 * The heater entry establishes a new link to the controller.
 *
 * @property dval.master
 * @type String | Object
 */

// Public {{{1
exports.role = ['updown', 'blinds'];

exports.homeInit = function(entry) {  // {{{2
  O.log.todo();
  return;

  entry.onActions(Actions, true);

  entry.shard.post(entry.dval.master, {register: {
    index: entry.dval.up,
    type: 'digital',
    direction: 'out',
    caption: entry.getCaption() + ' Up',
    conflict: entry.dval.down,
    entry: entry.identify()
  }});

  entry.shard.post(entry.dval.master, {register: {
    index: entry.dval.down,
    type: 'digital',
    direction: 'out',
    caption: entry.getCaption() + ' Down',
    conflict: entry.dval.up,
    entry: entry.identify()
  }});
};

var Actions = {};  // {{{1
Actions.pic = function(data) {  // {{{2
//  console.log('BLINDS ON PIC', data);

  if (data.registering && data.value) {
    var action = {};
    action[data.pin] = 0;

    this.shard.post(this.dval.master, action);

    return;
  }

  var direction = getDirection(data.pin, this.dval);

  if (this.timer) {
    clearTimeout(this.timer);
    delete this.timer;
  }

  if (
    this.request &&
    (this.request.state !== 'confirm') &&
    (this.request.direction !== direction) &&
    (Boolean(this.request.value) !== Boolean(data.value))
  ) {
    O.log.warning('Invalid request to confirm.', this.request);
    delete this.request;
  }

  if (data.value) {  // Blinds started to move. {{{3
    this.setState({moving: {
      direction: direction,
      start: Date.now()
    }});

    if (this.request) {  // There is pending request.
      confirmRequest(this);
    } else {  // This is not reaction to request.
      startRequest(this, {
        direction: direction,
        value: 1
      });
    }
  } else {  // Blinds stopped. {{{3
    if (this.sval.moving && (this.sval.moving.direction === direction)) {
      this.setState({
        moving: null,
      });
    }

    if (this.request) {
      startRequest(this, this.request.next);
    }
  }

  // }}}3

  return;
};

function confirmRequest(that) {  // {{{2
  that.request.state = 'do';

  if (that.timer) {
    clearTimeout(that.timer);
    delete that.timer;
  }

  var timer =
    that.timer =
    setTimeout(onTime, that.request.timeout || DefaultTimeout)
  ;

  function onTime() {
    if (timer === that.timer) {
      delete that.timer;

      if (that.request && that.request.value && (that.request.state === 'do')) {
        that.request.value = 0;

        sendRequest(that);
      } else {
        O.log.unhandled('Invalid request', that.request);
      }
    } else {
      O.log.unhandled('Timer was not cleared.');
    }
  }
};

/*
Actions.pic = function(data) {  // {{{2
  console.log('BLINDS ON PIC', data);

  var timer;
  var that = this;
  var direction = getDirection(data.pin, this.data);

  if (data.value) {  // Blinds started to move. {{{3
    if (this.timer) {
      O.log.unhandled('Previous request is in process.');
    } else {
      timer = this.timer = setTimeout(
        onTime,
        (this.request && this.request.timeout) || 6000
      );
    }

    this.setState({
      moving: {
        direction: direction,
        start: Date.now(),
      },
    });
  } else {  // Blinds stopped. {{{3
    if (data.registering) {
      return;
    }

    if (this.timer) {
      O.log.notice('Blinds timeout cleared by another request.');
      clearTimeout(this.timer);
      delete this.timer;
    }

    this.setState({
      moving: null,
    });
  }

  if (this.request) {
    if (
      (this.request.direction === direction) &&
      (Boolean(this.request.value) === Boolean(data.value))
    ) {
    } else {
      delete this.request;
    }
  }

  return;

  function onTime() {  // {{{3
    if (timer === that.timer) {
      delete that.timer;

      sendRequest(that, direction, 0);
    } else {
      O.log.unhandled('Timer was not cleared.');
    }
  };

  // }}}3
};
*/
Actions.move = function(data) {  // {{{2
//  console.log('BLINDS MOVE ACTION', data);

  if (data === 'stop') {
    if (this.sval.moving) {
      startRequest(this, {
        direction: this.sval.moving.direction,
        value: 0
      });
    }
  } else {
    startRequest(this, {
      direction: data,
      value: 1
    });
  }
};

// Private {{{1
var DefaultTimeout = 6000;

function startRequest(that, request) {  // {{{2
  if (that.timer) {
    clearTimeout(that.timer);
    delete that.timer;
  }

  if (! request) {
    delete that.request;

    return;
  }

  if (request.value) {
    if (that.sval.moving) {  // Blinds is already moving.
      if (that.sval.moving.direction === request.direction) {  // Blinds is moving requested direction.
        that.request = request;
        confirmRequest(that);

        return;
      } else {  // Blinds is moving oposite direction.
        that.request = {
          direction: that.sval.moving.direction,
          value: 0,
          next: request
        }
        sendRequest(that);

        return;
      }
    } else {
      that.request = request;
      sendRequest(that);

      return;
    }
  }

  that.request = request;
  sendRequest(that);

  return;
};

function sendRequest(that) {  // {{{2
  if (! that.request) {
    O.log.unhandled('There is no request to send.');
    return;
  }

  that.request.state = 'confirm';

  if (that.timer) {
    clearTimeout(that.timer);
    delete that.timer;
    O.log.unhandled('There is pending timer.');
  }

  var timer =
    that.timer =
    setTimeout(onTime, 1000)
  ;

  var action = {};
  action[that.data[that.request.direction]] = that.request.value;

//  console.log('BLINDS SEND MASTER', action);

  that.shard.post(that.data.master, action);

  function onTime() {
    O.log.unhandled('Master didn\'t fullfiled request');

    if (timer === that.timer) {
      delete that.timer;
    }
  };
};

function getDirection(pin, data) {  // {{{2
  if (pin === data.up) {
    return 'up';
  } else
  if (pin === data.down) {
    return 'down';
  } else {
    O.log.unhandled('Invalid pin.', pin);
    return;
  }
};

