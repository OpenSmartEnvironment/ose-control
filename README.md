# Open Smart Environment Control package

This package contains definitions of general [kinds of entries]
that represent real objects found in most environments (lights,
switches, heaters, sensors etc.). Entries are configured by
defining `entry.data` values. Communication between or among
entries is realized via [links].

## Status
- Pre-alpha stage (insecure and buggy)
- Unstable API
- Gaps in the documentation
- No test suite

This is not yet a piece of download-and-use software. Its important
to understand the basic principles covered by this documentation.

Use of this software is currently recommended only for users that
wish participate in the development process (see Contributions).

TODO: Make contribution a link

## Getting started
To get started with OSE, refer to the [ose-bundle] package and
[Media player example application].

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

Read more about [Power distributors] ...


### Pins
This component allows to simply define an [entry kind] describing
some type of controller with individual physical or logical
pins, such as a [Raspberry Pi] with its GPIO pins.

Each entry of a kind using this component can establish [links] to
individual pins. An example [entry kind] that establishes a link to a
controller switching some physical pin is the [heater].

Communication between a client and a controller consists of the
following steps:

1. Define a [client socket] class with `update()` handler.
2. Send `registerPin` [command] with request containing [pin
   index], [pin type], optional configuration data and a client
   socket instance.
3. On the controller side, a new response socket is created and
   registered by a controllers entry [pin list], and the [link] is
   established.
4. On the client side, the `open()` client socket handler is
   invoked.

Now it is possible to send `read()` or `update()` requests from the
client side to read or change the physical or logical pin state of
the controller. The response socket calls the client's `update()`
handler when a pin value change is detected. Each pin can register
only one active [link] at a time.

To create new entry kind describing some type of controller, follow
these steps:

1. Define a new [entry kind].
2. Define the `read()`, `write()` and `setup()` methods for each
   pin type of the controller.
3. Define list of pins describing which pin can be of which type.
4. Create [pin list] instance for each entry in `homeInit()` method
   of such kind.

This can be used to easily integrate, for example, Arduino boards
or other controllers into the OSE ecosystem. If someone wants to
put his effort into this challenge, don't hesitate to contact us
via GitHub for support.

Read more about [Pins] ...


### Rooms
This component defines basic room entry kinds. By configuring
entries of these kinds, it is possible to define an indoor
environment and its behaviour.

Read more about [Rooms] ...


### Remote control
This component makes it possible to specify what individual remote
controller commands do with OSE entries. An example of using this
component is the [ose-lirc] package.

The remote controller can be easily configured to control
multimedia, lights, etc. It is possible to define commands and
groups of commands.

Example:
TODO

Read more about [Remote control] ...


## Modules
Open Smart Environment Control package consists of the following modules:
- OSE Control core
- OSE Control content

### OSE Control core
Core singleton of ose-control npm package. Register [entry kinds]
defined by this package to the `"control"` [scope].

Module [OSE Control core] reference ... 

### OSE Control content
Provides files of OSE Control package to the browser.

Module [OSE Control content] reference ... 

## Contributions
To get started contributing or coding, it is good to read about the
two main npm packages [ose] and [ose-bb].

This software is in the pre-alpha stage. At the moment, it is
premature to file bugs. Input is, however, much welcome in the form
of ideas, comments and general suggestions.  Feel free to contact
us via
[github.com/opensmartenvironment](https://github.com/opensmartenvironment).

## License
This software is licensed under the terms of the [GNU GPL version
3](../LICENCE) or later
