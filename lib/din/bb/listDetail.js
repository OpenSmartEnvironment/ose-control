'use strict';

// Public
exports.displayLayout = function() {
  this.$().append([
    $('<p>').text(this.entry.data.name)
  ]);
};

exports.updateState = function(state) {
  if (! 'on' in state) return;

  if (! this.$().find('p.state').length) {
    this.$().append(
      $('<p>', {'class': 'state'})
    );
  }

  var p = this.$(' p.state');

  if (state.on) {
    p.text('On');
  } else {
    p.text('Off');
  }
};

