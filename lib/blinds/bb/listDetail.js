'use strict';

// Public
exports.displayLayout = function() {
  this.$().append([
    $('<p>').text(this.entry.data.name),
  ]);
};

exports.updateState = function(state) {
  // TODO
  if (!state.length) return;

  if (! this.$().find('p.state').length) {
    this.$().append(
      $('<p>', {'class': 'state'})
    );
  }

  if (state.pos === 'up'/* TODO */) {
    this.$().find('p.state>').text('Up')
  } else if (state.pos === 'down'/* TODO */){
    this.$().find('p.state>').text('Down')
  }
};
