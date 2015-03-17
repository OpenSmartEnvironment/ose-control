'use strict';

exports.displayLayout = function() {
  this.empty();
  this.append('div').append('h3').text(this.entry.data.name);
  this.append('aside');
  this.on('click', this.tapItem.bind(this));
};

exports.updateState = function(state) {
  this.find('aside').text(this.entry.state.value + ' / ' + Math.round(this.entry.state.power * 100) / 100);
};

