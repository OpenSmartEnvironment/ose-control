'use strict';

exports.displayData = function() {
  this.$()
    .empty()
    .append([
      $('<aside>', {'class': 'pack-end'}),
      $('<p>').text(this.entry.data.name),
    ])
  ;
};

exports.updateState = function(state) {
  this.$(' aside').text(this.entry.state.value + ' / ' + this.entry.state.power);
};

