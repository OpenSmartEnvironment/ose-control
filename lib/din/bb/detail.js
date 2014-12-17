'use strict';

// Public {{{1
exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  }
};

exports.displayLayout = function() {  // {{{2
  this.$('list').append(
    $('<li>').append([
      $('<p>').text('Digital Input'),
      $('<p>', {'class': 'state'})
    ])
  );
};

exports.updateState = function(state) {  // {{{2
  var p = this.$(' p.state');

  switch (state.on) {
    case true:
      p.text('On');
      break;
    case false:
      p.text('Off');
      break;
    default:
      p.text('unknown')
  }
};

// }}}1
