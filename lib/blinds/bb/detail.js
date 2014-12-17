'use strict';

// Public {{{1
exports.profile = {  // {{{2
  parent: 1
  /*
  name: {
    place: 'caption',
    required: true
  }
  */
};

exports.displayLayout = function() {  // {{{2
  this.$('').append([
    $('<br>'),

    $('<button>')
    .attr('action', 'up')
    .text('up')
    .on('click', onTap.bind(this, 'move', 'up'))
    .on('hold', onHold.bind(this, 'move', 'up'))
    .on('release', onRelease.bind(this, 'move')),

    $('<button>')
    .text('down')
    .attr('action', 'down')
    .on('click', onTap.bind(this, 'move', 'down'))
    .on('hold', onHold.bind(this, 'move', 'down'))
    .on('release', onRelease.bind(this, 'move')),

    $('<button>').text('+')
    .on('click', onTap.bind(this, 'rotate', 'up'))
    .on('hold', onHold.bind(this, 'rotate', 'up'))
    .on('release', onRelease.bind(this, 'rotate')),

    $('<button>').text('-')
    .on('click', onTap.bind(this, 'rotate', 'down'))
    .on('hold', onHold.bind(this, 'rotate', 'down'))
    .on('release', onRelease.bind(this, 'rotate'))
  ]);
};

exports.updateState = function(state) {  // {{{2
  for (var key in state) {
    switch (key) {
      case 'moving':
        if (state[key]) {
          this.$('').find('button[action="' + state[key] + '"]').addClass('active');
//          this.$('').find('button').not('.pressed').attr('disabled', 'disabled');
        } else {
          this.$('').find('button[action="' + state[key] + '"]').removeClass('active');
//          this.$('').find('button').not('.pressed').removeAttr('disabled');
        }

        break;
      case 'pos':
        break;
      case 'angle':
        break;
    }
  }
};

// }}}1
// Private {{{1
function onTap(action, direction, ev) {  // {{{2
  var obj = {};
  obj[action] = direction;

  this.entry.sendAction(obj);
};

function onHold(action, direction, ev) {  // {{{2
  this.hold  = true;

  var obj = {};
  obj[action] = direction;

  this.entry.sendAction(obj);
};

function onRelease(action, ev) {  // {{{2
//  $(ev.currentTarget).removeClass('pressed');
  if (this.hold) {
    var obj = {};
    obj[action] = 'stop';
    this.entry.sendAction(obj);
  }

  this.hold = false;
};

// }}}1
/* COMMENTS {{{1
function onDoubletap(action, direction, ev) {
  var that = this;

  this.doubletap = true;


  var obj = {};
  obj[action] = direction;

  this.entry.sendAction(obj);

  setTimeout(function() {
    that.doubletap = false;
  }, 200);
};
*/

/*
function onMousedown(action, direction, ev) {
  var that = this;
//  $(ev.currentTarget).addClass('pressed');

  setTimeout(function() {
    if (that.doubletap) return;

    var obj = {};
    obj[action] = direction;

    that.entry.sendAction(obj);
  }, 200);
};
*/

/*
function onChange(ev, isTriggered) {  // {{{2
  if (this.updatingState || isTriggered) return false;

//x  this.entry.sendAction({power: this.slider('slider')});

  if (ev.gesture) ev.gesture.preventDefault();
  ev.preventDefault();
  return false;
};
*/

// }}}1
