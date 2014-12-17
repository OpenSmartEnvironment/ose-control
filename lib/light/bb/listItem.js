'use strict';

exports.displayData = function() {
  var slideswitch = this.newWidget('slideswitch', 'onOff', {
    change: onSwitch.bind(this)
  });

  this.$()
    .empty()
    .append([
      $('<aside>', {'class': 'pack-end'}).append(
        slideswitch
      ),
      $('<p>').text(this.entry.data.name)
    ])
  ;
};

exports.updateState = function(state) {
  if (state.main) {
    this.widget('onOff', state.main === 'on' ? true : false)
  }
};

function onSwitch(ev) {
//  var checked = $(ev.currentTarget).find('input').prop('checked');
  this.entry.post('switch');
};

