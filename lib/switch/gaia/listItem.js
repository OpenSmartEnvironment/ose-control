'use strict';

exports.displayLayout = function() {
  this
    .empty()
    .on('click', this.tapItem.bind(this))
  ;

  this.append('div').append('h3').text(this.entry.data.name);
  this.append('aside').append('gaia-button', {circular: 'circular', 'active': 'active'});
};

