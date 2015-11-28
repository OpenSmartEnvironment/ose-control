'use strict';

exports.displayLayout = function() {
  this.empty();

  this.append('div').add([
    this.new('h3').text(this.entry.dval.name),
    this.new('p')
  ]);

  this.append('gaia-switch').on('change', onSwitch.bind(this));

  this.on('click', this.tapItem.bind(this))
};

exports.updateState = function(sval) {
  if (sval.main) {
    this.find('gaia-switch').val(sval.main === 'off' ? false : true);
  }
};

function onSwitch(ev) {
  var that = this;

  this.stop(ev);

  if (! this.updating) {
    this.entry.post('profile', this.target(ev).val());
    /*
    , function() {
      that.updating = true;
      that.updateState(that.entry.sval);
      delete that.updating;
    });
    */
  }
};
