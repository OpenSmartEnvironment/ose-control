'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  }
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
        that.find('li.autoOff gaia-checkbox').val(that.entry.state.autoOff);
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

exports.updateStateKey = function(key, data) {  // {{{2
  switch(key) {
  case 'channels':
    for (var key in data) {
      var li = this.find('li[channelName="' + key + '"]');

      if (li) {
        updateLi(this, li, this.entry.state.channels[key]);
      } else {
        this.append(newLi(this, key, this.entry.state.channels[key]));
      }
    }
    return;
  case 'autoOff':
    this.find('li.autoOff gaia-checkbox').val(data);

    clearInterval(this.countdown);

    var p = this.find('li.autoOff p').empty();

    if (data) {
      updateAutoOffCountdown(this, p);
    }

    return;
  case 'locked':
    this.find('li.locked gaia-checkbox').val(data);
    return;
  }
};

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
        .on('change', onSwitch)
    ]);
    return li;
  case 'pwm':
    li.append('div').add([
      that.new('h3').text(name),
      that.new('gaia-slider').on('input', onSlider)
    ]);
    return li;
  }

  throw O.error(that, 'Invalid arguments', state);

  function onSwitch(ev) {  // {{{3
    that.stop(ev);

    if (that.updatingState) return;

    var cmd = {};
    cmd[name] = {value: ev.currentTarget.checked ? 1 : 0};
    that.entry.post('update', cmd, function() {
      updateLi(that, li, state);
    });
    return;
  }

  function onSlider(ev) {  // {{{3
    O.log.todo();
    return;

    var dragging = Boolean($(ev.currentTarget).prop('ose').dragging);

    if (that.updatingState) return false;

    var cmd = {};

    cmd[name] = {value: that.widget(name)};

    if (! dragging) {
      cmd[name].speed = O.consts.lightDimSpeed;
    }

    that.entry.post('update', cmd);

    if (ev.gesture) ev.gesture.preventDefault();
    ev.preventDefault();
    return false;
  }

  // }}}3
}

function updateLi(that, li, state) {  // {{{2
  switch (state.type) {
  case 'dout':
    li.find('gaia-switch').val(state.value);
    break;
  case 'pwm':
    O.log.todo();
    break;
  default:
    O.log.error(that, 'Invalid arguments');
  }
}

function updateAutoOffCountdown(that, p) {  // {{{2
  // TODO: Synchronize time with server.
  var time = Math.floor((that.entry.state.autoOff.wait - O._.now() + that.entry.state.autoOff.start) / 1000);

  p.add('Auto off in <span class="countdown">' + time + '</span> seconds');
  var span = p.find('span.countdown');

  that.countdown = setInterval(function() {
    time = time - 1;
    span.text(time);
  }, 1000);
}

// }}}1
