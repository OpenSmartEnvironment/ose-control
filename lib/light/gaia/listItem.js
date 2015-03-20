'use strict';

exports.displayLayout = function() {
  this.empty();

  this.append('div').add([
    this.new('h3').text(this.entry.data.name),
    this.new('p')
  ]);

  this.append('gaia-switch').on('change', onSwitch.bind(this));

  this.on('click', this.tapItem.bind(this))
};

exports.updateState = function(state) {
  if (state.main) {
    this.find('gaia-switch').val(state.main === 'off' ? false : true);
  }
};

function onSwitch(ev) {
  var that = this;

  this.stop(ev);

  if (! this.updatingState) {
    this.entry.post('profile', this.target(ev).val(), function() {
      that.updatingState = true;
      that.updateState(that.entry.state);
      delete that.updatingState;
    });
  }
};
