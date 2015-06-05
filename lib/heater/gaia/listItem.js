'use strict';

exports.displayLayout = function() {
  this.empty();
  this.append('div').append('h3').text(this.entry.dval.name);
  this.append('aside');
  this.on('click', this.tapItem.bind(this));
};

exports.updateState = function(state) {
  this.find('aside').text(this.entry.sval.value + ' / ' + Math.round(this.entry.sval.power * 100) / 100);
};

