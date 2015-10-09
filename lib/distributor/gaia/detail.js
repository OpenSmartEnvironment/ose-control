'use strict';

var O = require('ose').module(module);

// Public
exports.profile = {
  name: {
    place: 'caption',
    required: true
  },
};

exports.displayLayout = function() {
  var list = this.view2({
    view: 'list',
    ident: {
      scope: 'control',
      space: this.entry.shard.space.name
    },
    filter: {
      parent: this.entry.id,
    }
  });

  this.add(list);

  list.loadData();
};
