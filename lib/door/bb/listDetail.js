'use strict';

// Public
exports.displayLayout = function() {
  this.$().append([
    $('<p>').text(this.entry.data.name)
  ]);
};

exports.updateState = function(state) {
  if (! ('open' in state)) return;

  if (! this.$().find('p.state').length) {
    this.$().append(
      $('<p>', {'class': 'state'})
    );
  }

  var p = this.$(' p.state');

  if (state.open) {
    p.text('Open');
  } else {
    p.text('Shut');
  }
};

