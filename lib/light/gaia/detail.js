'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  },
};

exports.displayLayout = function () {  // {{{2
  var that = this;

  this.li('turn').section('row')
    .h3('Turn', 'stretch')
    .buttons(['off', 'on', 'full'], {relation: 'single'}, function(name) {
      that.post('profile', name);
    })
  ;

  this.li('autoOff').section('row')
    .section('stretch')
      .h3('Auto off')
      .p(null)
      .parent()
    .buttons(['on', 'off'], {char: true, relation: 'single', default: 'off'}, function(type) {
      that.post('autoOff', type === 'on');
    })
  ;

  this.li('locked').section('row')
    .section('stretch')
      .h3('Locked')
      .p(null)
    .parent()
    .buttons(['on', 'off'], {char: true, relation: 'single', default: 'off'}, function(type) {
      that.post('lock', type === 'on');
    })
  ;

  this.li('divider').h2('Channels:');
};

exports.updateStateKey = function(key, val) {  // {{{2
  switch(key) {
  case 'channels':
    for (var key in val) {
      var li = this.find('li[channelName="' + key + '"]') ||
        newLi(this, key, this.entry.sval.channels[key])
      ;

      updateLi(this, li, this.entry.sval.channels[key]);
    }
    return;
  case 'autoOff':
    var li = this.find('li.autoOff');

    li.find('.buttons').val(val ? 'on': 'off');

    clearInterval(this.countdown);

    if (val) {
      updateAutoOffCountdown(this, li.find('p'));
    } else {
      li.find('p').text(undefined);
    }

    return;
  case 'locked':
    this.find('li.locked .buttons').val(val ? 'on' : 'off');
    return;
  }
};

// }}}1
// Event Handlers {{{1
function onSwitch(name, val) {  // {{{2
  if (this.updating) return;

  var cmd = {};
  cmd[name] = {value: val === 'on'};
  this.entry.post('update', cmd);
  return;
}

function onSlider(name, ev) {  // {{{2
  this.stop(ev);

  if (this.updating) return;

  var cmd = {};
  cmd[name] = {
    value: this.target(ev).val() / 100,
    speed: 10,
  };

  /* TODO: how to distinguish click vs drag in gaia-slider?
//    var dragging = Boolean($(ev.currentTarget).prop('ose').dragging);
  if (! dragging) {
    cmd[name].speed = O.consts('control').lightDimSpeed;
  }
  */

  this.post('update', cmd);

  return;
}

// }}}1
// Private {{{1
function newLi(that, name, state) {  // {{{2
  var res = that.li({channelName: name});
  var row = res.section('row');

  row.h3(name, 'stretch');

  switch (state.type) {
  case 'dout':
    row.buttons(['on', 'off'], {char: true, relation: 'single'}, onSwitch.bind(that, name));
    break;
  case 'pwm':
    row.parent().slider({}, onSlider.bind(that, name), 50);
    break;
  default:
    throw O.log.error(that, 'INVALID_ARGS', state);
  }

  return res;
}

function updateLi(that, li, state) {  // {{{2
  switch (state.type) {
  case 'dout':
    li.find('.buttons').val(state.value ? 'on' : 'off');
    break;
  case 'pwm':
    li.find('gaia-slider').val(state.value * 100);
    break;
  default:
    O.log.error(that, 'INVALID_ARGS');
  }
}

function updateAutoOffCountdown(that, p) {  // {{{2
  // TODO: Synchronize time with server.
  var time = Math.floor((that.entry.sval.autoOff.wait - O._.now() + that.entry.sval.autoOff.start) / 1000);

  p.add('Auto off in <span class="countdown">' + time + '</span> seconds').show();
  var span = p.find('span.countdown');

  that.countdown = setInterval(function() {
    time = time - 1;
    span.text(time);
  }, 1000);
}

// }}}1
