'use strict';

// Public {{{1
exports.profile = {  // {{{2
  parent: 1
  /*
  name: {
    place: 'caption',
    required: true
  }
  */
};

exports.displayLayout = function() {  // {{{2
  this.append('li', 'power').add([
    this.new('div').add([
      '<h3>Power: <span></span></h3>',
      this.new('gaia-slider', 'power').on('input', onPowerSliderInput.bind(this))
    ])
  ]);

  this.append('li', 'state').add([
    '<div>',
      '<h3>Current state</h3>',
      '<p><span></span> and <span></span></p>',
    '</div>'
  ].join(''));  
};

exports.updateStateKey = function(key, data) {  // {{{2
  switch (key) {
    case 'power':
      //this.widget('slider', state[key]);
      this.find('li.power > div > h3 > span').text(data);
      this.find('li gaia-slider.power').val(data * 100);
      break;
    case 'enabled':
      this.find('li.state > div > p > span:first-child').text(data ? 'Enabled' : 'Disabled');
      break;
    case 'value':
      this.find('li.state > div > p > span:last-child').text(data ? 'on' : 'off');
      break;
  }
};

// }}}1
// Private {{{1
function onPowerSliderInput(ev) {  // {{{2
  this.stop(ev);

  if (! this.updatingState) {
    this.post('power', this.find('gaia-slider').val() / 100);
  }
};

// }}}1
