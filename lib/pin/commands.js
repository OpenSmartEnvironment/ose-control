'use strict';

/** Doc {{{
 * @submodule control.pin
 */

/**
 * @caption Pin list commands
 *
 * @readme
 * Commands that are registered on [entry kinds] creating a list of
 * pins for their [entries].
 *
 * @class control.lib.pin.commands
 * @type extend
 */

// Public {{{1
exports.registerPin = function(req, socket) {  // {{{2
/**
 * [Command handler]
 * 
 * @param req {Object} Request relayed to [pin list `register`]
 * @param socket {Object} Slave socket
 *
 * @method registerPin
 */

  this.entry.pins.register(req, socket);
};

exports.updatePin = function(entry, action, cb) {  // Update PIC PIN value. {{{2
  M.log.todo();
  return;




  var pin = entry.pins.pins[action.data.index];

//  console.log('UPDATE PIN', action.data, typeof pin.write);

  if (
    pin &&
    ((action.source === pin.slave) || (action.source === entry)) &&
    (action.data.confirmed || ! pin.confirm)
  ) {
    if (pin.write) {
      pin.write(action.data);
      cb();  // TODO Call "cb()" after successfull write.
      return;
    }

    if (pin.type.write) {
      pin.type.write(entry, pin, action.data.value);
      cb();  // TODO Call "cb()" after successfull write.
      return;
    }
  }

  cb(Ose.error(this, 'INVALID_ARGS'));
  return;
};

// }}}1
