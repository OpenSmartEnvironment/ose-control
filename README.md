# Open Smart Environment Control package

This package contains definitions of general [kinds of entries](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html)
that represent real objects found in most environments (lights,
switches, heaters, sensors etc.). Entries are configured by
defining `entry.data` values. Communication between or among
entries is realized via [links](http://opensmartenvironment.github.io/doc/modules/ose.link.html).

## Status
- Pre-alpha stage (insecure and buggy)
- Unstable API
- Gaps in the documentation
- No test suite

This is not yet a piece of download-and-use software. Its important
to understand the basic principles covered by this documentation.

Use of this software is currently recommended only for users that
wish participate in the development process, see
[Contributions](#contributions).

## Getting started
To get started with OSE, refer to the [ose-bundle](http://opensmartenvironment.github.io/doc/modules/bundle.html) package and
[Media player example application](http://opensmartenvironment.github.io/doc/modules/bundle.media.html). You can read the entire OSE
documentation [here]( http://opensmartenvironment.github.io/doc).

## Components
Open Smart Environment Control package consists of the following components:
- Power distributors
- Pins
- Rooms
- Remote control

### Power distributors
This component defines basic power distributor entry kinds. By
configuring entries of these kinds, it is possible to define the
power distributor configuration and behaviour.

Read more about [Power distributors](http://opensmartenvironment.github.io/doc/modules/control.distributor.html) ...


### Pins
This component allows to simply define an [entry kind](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html) describing
some type of controller with individual physical or logical
pins, such as a [Raspberry Pi](http://opensmartenvironment.github.io/doc/modules/rpi.html) with its GPIO pins.

Each entry of a kind using this component can establish [links](http://opensmartenvironment.github.io/doc/modules/ose.link.html) to
individual pins. An example [entry kind](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html) that establishes a link to a
controller switching some physical pin is the [heater](http://opensmartenvironment.github.io/doc/classes/control.lib.heater.html).

Communication between a client and a controller consists of the
following steps:

1. Define a [client socket](http://opensmartenvironment.github.io/doc/modules/ose.link.html) class with `update()` handler.
2. Send `registerPin` [command](http://opensmartenvironment.github.io/doc/modules/ose.data.html) with request containing [pin
   index](http://opensmartenvironment.github.io/doc/classes/control.lib.pin.html), [pin type](http://opensmartenvironment.github.io/doc/classes/control.lib.pin.html), optional configuration data and a client
   socket instance.
3. On the controller side, a new response socket is created and
   registered by a controllers entry [pin list](http://opensmartenvironment.github.io/doc/classes/control.lib.pin.list.html), and the [link](http://opensmartenvironment.github.io/doc/modules/ose.link.html) is
   established.
4. On the client side, the `open()` client socket handler is
   invoked.

Now it is possible to send `read()` or `update()` requests from the
client side to read or change the physical or logical pin state of
the controller. The response socket calls the client's `update()`
handler when a pin value change is detected. Each pin can register
only one active [link](http://opensmartenvironment.github.io/doc/modules/ose.link.html) at a time.

To create new entry kind describing some type of controller, follow
these steps:

1. Define a new [entry kind](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html).
2. Define the `read()`, `write()` and `setup()` methods for each
   pin type of the controller.
3. Define list of pins describing which pin can be of which type.
4. Create [pin list](http://opensmartenvironment.github.io/doc/classes/control.lib.pin.list.html) instance for each entry in `homeInit()` method
   of such kind.

This can be used to easily integrate, for example, Arduino boards
or other controllers into the OSE ecosystem. If someone wants to
put his effort into this challenge, don't hesitate to contact us
via [GitHub](https://github.com/OpenSmartEnvironment) for support.

Read more about [Pins](http://opensmartenvironment.github.io/doc/modules/control.pin.html) ...


### Rooms
This component defines basic room entry kinds. By configuring
entries of these kinds, it is possible to define an indoor
environment and its behaviour.

Read more about [Rooms](http://opensmartenvironment.github.io/doc/modules/control.room.html) ...


### Remote control
This component makes it possible to specify what individual remote
controller commands do with OSE entries. An example of using this
component is the [ose-lirc](http://opensmartenvironment.github.io/doc/modules/lirc.html) package.

The remote controller can be easily configured to control
multimedia, lights, etc. It is possible to define commands and
groups of commands.

Example:
TODO

Read more about [Remote control](http://opensmartenvironment.github.io/doc/modules/control.remote.html) ...


## Modules
Open Smart Environment Control package consists of the following modules:
- OSE Control core
- OSE Control content

### OSE Control core
Core singleton of ose-control npm package. Register [entry kinds](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html)
defined by this package to the `"control"` [scope](http://opensmartenvironment.github.io/doc/classes/ose.lib.scope.html).

Module [OSE Control core](http://opensmartenvironment.github.io/doc/classes/control.lib.html) reference ... 

### OSE Control content
Provides files of OSE Control package to the browser.

Module [OSE Control content](http://opensmartenvironment.github.io/doc/classes/control.content.html) reference ... 

## <a name="contributions"></a>Contributions
To get started contributing or coding, it is good to read about the
two main npm packages [ose](http://opensmartenvironment.github.io/doc/modules/ose.html) and [ose-bb](http://opensmartenvironment.github.io/doc/modules/bb.html).

This software is in the pre-alpha stage. At the moment, it is
premature to file bugs. Input is, however, much welcome in the form
of ideas, comments and general suggestions.  Feel free to contact
us via
[github.com/opensmartenvironment](https://github.com/opensmartenvironment).

## Licence
This software is released under the terms of the [GNU General
Public License v3.0](http://www.gnu.org/copyleft/gpl.html) or
later.
