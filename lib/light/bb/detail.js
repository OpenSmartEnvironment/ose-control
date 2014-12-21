'use strict';

var Ose = require('ose');
var M = Ose.module(module);

// Public {{{1
exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  }
};

exports.displayLayout = function () {  // {{{2
  var that = this;

  this.$(' > ul').append($('<li>', {role: 'oseToolbar'})
    .append(this.newWidget('button', 'off', {
      label: 'Off',
      tap: function() {
        that.post('profile', 'off');
        return false;
      }
    }))
    .append(this.newWidget('button', 'on', {
      label: 'On',
      tap: function() {
        that.post('profile', 'on');
        return false;
      }
    }))
    .append(this.newWidget('button', 'full', {
      label: 'Full',
      tap: function() {
        that.post('profile', 'full');
        return false;
      }
    }))
    .append(this.newWidget('button', 'autoOff', {
      label: 'Auto off',
      tap: function() {
        that.post('autoOff', that.entry.state.autoOff ? false : true);
      }
    }))
    .append(this.newWidget('button', 'locked', {
      label: 'Locked',
      tap: function() {
        that.post('lock', !that.entry.state.locked);
        return false;
      }
    }))
  );
};

exports.updateStateKey = function(key, data, state) {  // {{{2
  switch(key) {
  case 'profile':
    break;
  case 'channels':
    for (var key in state.channels) {
      if (! this.$(key).length) {
        this.$(' > ul').append(newLi(this, key, state.channels[key]));
      }
      this.widget(key, state.channels[key]);
    }
    break;
  case 'autoOff':
    this.widget('autoOff', data ? 1 : 0);
    break;
  case 'locked':
    this.widget('locked', data ? 1 : 0);
    break;
  }
};

// }}}1
// Private {{{1
function newLi(that, name, state) {  // {{{2
  switch (state.type) {
  case 'dout':
    var el = that.newWidget('slideswitch', name, {
      change: onSwitch.bind(this)
    });

    var li = $('<li>').append([
      $('<aside>', {class: 'pack-end'}).append(el),
      $('<p>').text(name)
    ]);

    break;
  case 'pwm':
    var el = that.newWidget('slider', name, {
      min: 0,
      max: 1,
      change: onChange
    });

    var li = $('<li>').append([
      $('<p>').text(name),
      el
    ]);

    break;
  default:
    throw Ose.error(that, 'INVALID_ARGS', state);
  }

  return li;

  function onSwitch(ev, isTriggered) {  // {{{3
    if (that.updatingState || isTriggered) return false;

    var cmd = {};

    console.log('onSwitch widget state: ', that.widget(name));
    cmd[name] = {value: that.widget(name)};

    that.entry.post('update', cmd);

    return false;

  }

  function onChange(ev, isTriggered) {  // {{{3
    var dragging = Boolean($(ev.currentTarget).prop('ose').dragging);

    if (that.updatingState || isTriggered) return false;

    var cmd = {};

    cmd[name] = {value: that.widget(name)};

    if (! dragging) {
      cmd[name].speed = M.consts.lightDimSpeed;
    }

    that.entry.post('update', cmd);

    if (ev.gesture) ev.gesture.preventDefault();
    ev.preventDefault();
    return false;
  }

  // }}}3
};

// }}}1
