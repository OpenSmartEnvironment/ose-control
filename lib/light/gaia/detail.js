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

  this.append('li', 'lightToolbar').add([
    this.new('gaia-button')
      .text('Off')
      .on('click', function(ev) {
        that.stop(ev);
        that.post('profile', 'off')
      }),
    this.new('gaia-button')
      .text('On')
      .on('click', function(ev) {
         that.stop(ev);
         that.post('profile', 'on');
       }),
    this.new('gaia-button')
      .text('Full')
      .on('click', function(ev) {
        that.stop(ev);
        that.post('profile', 'full');
      }),
  ]);

  this.append('li', 'autoOff').add([
    '<div><h3>Auto off</h3><p></p></div>',
    this.new('gaia-checkbox').on('click', function(ev) {
      that.stop(ev);
      that.post('autoOff', ev.currentTarget.checked, function() {
        that.find('li.autoOff gaia-checkbox').val(that.entry.sval.autoOff);
      })
    }),
  ]);

  this.append('li', 'locked').add([
    '<div><h3>Locked</h3><p></p></div>',
    this.new('gaia-checkbox').on('click', function(ev) {
      that.stop(ev);
      that.post('lock', ev.currentTarget.checked);
    })
  ]);

  this.append('gaia-sub-header').text('Channels');
};

exports.updateStateKey = function(key, val) {  // {{{2
  switch(key) {
  case 'channels':
    for (var key in val) {
      var li = this.find('li[channelName="' + key + '"]');

      if (li) {
        updateLi(this, li, this.entry.sval.channels[key]);
      } else {
        this.append(newLi(this, key, this.entry.sval.channels[key]));
      }
    }
    return;
  case 'autoOff':
    this.find('li.autoOff gaia-checkbox').val(val);

    clearInterval(this.countdown);

    var p = this.find('li.autoOff p').empty();

    if (val) {
      updateAutoOffCountdown(this, p);
    }

    return;
  case 'locked':
    this.find('li.locked gaia-checkbox').val(val);
    return;
  }
};

// }}}1
// Event Handlers {{{1
function onSwitch(name, ev) {  // {{{2
  this.stop(ev);

  if (this.updatingState) return;

  var cmd = {};
  cmd[name] = {value: ev.currentTarget.checked ? 1 : 0};
  this.entry.post('update', cmd);
  return;
}

function onSlider(name, ev) {  // {{{2
  this.stop(ev);

  if (this.updatingState) return;

  var cmd = {};
  cmd[name] = {
    value: this.target(ev).val() / 100,
    speed: 10,
  };

  /* TODO: how to distinguish click vs drag in gaia-slider?
//    var dragging = Boolean($(ev.currentTarget).prop('ose').dragging);
  if (! dragging) {
    cmd[name].speed = O.consts.lightDimSpeed;
  }
  */

  this.post('update', cmd);

  return;
}

// }}}1
// Private {{{1
function newLi(that, name, state) {  // {{{2
  var li = that.new('li', {channelName: name});

  switch (state.type) {
  case 'dout':
    li.add([
      that.new('div').add([
        that.new('h3').text(name),
        '<p>',
      ]),
      that.new('gaia-switch')
        .prop('checked', state.value)
        .on('change', onSwitch.bind(that, name))
      ,
    ]);
    break;
  case 'pwm':
    li.append('div').add([
      that.new('h3').text(name),
      that.new('gaia-slider').on('input', onSlider.bind(that, name))
    ]);
    break;
  default:
    throw O.error(that, 'Invalid arguments', state);
  }

  updateLi(that, li, state);
  return li;
}

function updateLi(that, li, state) {  // {{{2
  switch (state.type) {
  case 'dout':
    li.find('gaia-switch').val(state.value);
    break;
  case 'pwm':
    li.find('gaia-slider').val(state.value * 100);
    break;
  default:
    O.log.error(that, 'Invalid arguments');
  }
}

function updateAutoOffCountdown(that, p) {  // {{{2
  // TODO: Synchronize time with server.
  var time = Math.floor((that.entry.sval.autoOff.wait - O._.now() + that.entry.sval.autoOff.start) / 1000);

  p.add('Auto off in <span class="countdown">' + time + '</span> seconds');
  var span = p.find('span.countdown');

  that.countdown = setInterval(function() {
    time = time - 1;
    span.text(time);
  }, 1000);
}

// }}}1
