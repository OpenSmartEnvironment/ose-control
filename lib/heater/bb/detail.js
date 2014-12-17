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
  this.$(' > ul').append(
    $('<li>').append([
      $('<p>').text(this.entry.id),
      this.newWidget('slider', 'slider', {
        min: 0,
        max: 1,
        change: onChange.bind(this)
      })
    ])
  );
};

exports.updateState = function(state) {  // {{{2
  for (var key in state) {
    switch (key) {
      case 'power':
        this.widget('slider', state[key]);
        break;
    }
  }
};

// }}}1
// Private {{{1
function onChange(ev, isTriggered) {  // {{{2
  if (this.updatingState || isTriggered) {
    return false;
  }

  this.post('power', this.widget('slider'));

  if (ev.gesture) ev.gesture.preventDefault();
  ev.preventDefault();

  return false;
};

// }}}1
