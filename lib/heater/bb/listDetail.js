'use strict';

// Public
exports.displayLayout = function() {
  this.$().append([
    $('<p>').text(this.entry.data.name),
  ]);
};

exports.updateState = function(state) {
  // TODO
  //console.log('******** updateState ********\n', state);
  if (!state.length) return;

  if (! this.$().find('p.state').length) {
    this.$().append(
      $('<p>', {'class': 'state'})
    );
  }
  // TODO
};

