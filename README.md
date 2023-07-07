# oscee

### Simple OSC/MIDI router _/s_

### How to use
- Install
    - prebuilt binaries (coming soon)
    - via npm: `npm install -g oscee`
- Create config file
    - sorry, this is the worst part [JSON Schema](https://oscee.jwetzell.com/docs/schema/config)
    - good idea to start with [default.json](src/config/default.json)
- Run
    - `oscee config.json`
    - if no config file is specified then [default.json](src/config/default.json) will be used 

## The _Basics_
- triggers: when a message comes in triggers enforce some criteria on the incoming message. If a message "ticks all the boxes" the actions of the trigger are then performed. triggers do not stack each trigger in the array is evaluated in isolation.
- actions: actions are what should be done as a result of a trigger being well triggered, actions can transform the message that they act on using transforms
- transforms: transforms transform messages, the transformations are localized to the action the transform is a part of

## Structure
Every piece (triggers, actions, transforms) have a shared JSON structure
- type: string that denotes the type of the trigger/action/transform
- params: an object that holds the config for the trigger/action/transform
- enabled: boolean - if false the piece is skipped and so are the underlying pieces. i.e. if a trigger is disabled no actions under that trigger will be performed, if an action is disabled no transforms under that action will be performed

## Triggers
- **regex**
    - patterns: a list of regex patterns as strings
    - properties: a list of properties to test with their respective patterns, must be 1:1 
- **sender**
    - address: the ip address of the host that will trip this trigger
- **bytes-equal**
    - bytes: array of bytes to match to the bytes of the incoming message (supports midi, tcp, udp, osc messages)
- **midi-note-on**
    - note: optional note value 0-127 to match the incoming note on message to. if excluded all incoming notes will fire this trigger
    - velocity: optional note velocity to match the incoming note on message to
- **midi-note-off**
    - note: optional note value 0-127 to match the incoming note off message to. if excluded all incoming notes will fire this trigger
    - velocity: optional note velocity to match the incoming note off message to
- **midi-control-change**
    - control: optional control number 0-127 to match the incoming message to
    - value: optional control value 0-127 to match the incoming message to
- **midi-program-change**
    - program: optional program number 0-127 to match the incoming message to

## Actions
- **forward**
    - host: address of the server to forward the message,
    - protocol: udp or tcp,
    - port: port (number) to forward the message to,
- **osc-output**
    - protocol: udp or tcp,
    - host: address of the server to forward the message,
    - port: port (number) to forward the osc message to,
    - _address: a javascript literal string with msg available (i.e. "/routed${msg.address}"),
    - address: hardcoded address to send the message to, _address has priority
    - _args: an array of args all string will be interpreted as javascript templates like _address non-strings will be passed along as is
    - args: hardcoded array of args values i.e [0, "hello", 1.5], _args has priority
- **udp-output**
    - host: address of the server to send the message to,
    - port: port (number) to udp message on,
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - _string: templated string to send
    - string: static string to send
- **tcp-output**
    - host: address of the server to send the message to,
    - port: port (number) to tcp message on,
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - _string: templated string to send
    - string: static string to send
- **midi-output**
    - bytes: byte array of midi data [status + channel, data1, data2]
    - status: midi status (i.e note_on, note_off, program_change, etc.)
    - note: note value (note_off,, note_on, polyphonic_aftertouch)
    - velocity: velocity value (note_off, note_on)
    - control: control number (control_change)
    - program: program number (program_change)
    - pressure: pressure value (polyphonic_aftertouch, channel_aftertouch)
    - value: value (control_change, pitch_bend)
- **delay**
    - duration: time in ms to wait befor executing the defined actions
    - actions: array of actions to execute
- log: action takes no params and will simply log the incoming message out useful for debugging triggers
- **shell**
    - _command: JS literal template of shell command to run has access to msg properties
    - command: shell command to run _command has priority

## Transforms
- **scale**
    - property: the path to the property in the incoming msg object
    - inRange: the range of values for the incoming msg.property value i.e [0,100]
    - outRange: the range of values to scale msg.property value into [1,10]
- **round** 
    - property: the path to the property in the incoming msg object
- **floor**
    - property: the path to the property in the incoming msg object
- **log**
    - property: the path to the property in the incoming msg object
    - base: the base of the log
- **power**
    - property: the path to the property in the incoming msg object
    - exponent: the exponent to raise the value of msg.property to
- **map**
    - property: the path to the property in the incoming msg object
    - map: an object representing a mapping between incoming msg.property values and their output i.e {"MON":"Monday"} so if msg.property === "MON" then msg.property will be set to "Monday" and passed along
- **template**
    - property: the path to the property in the incoming msg object
    - template: the template that will be evaluated and then set as the value of the msg.property

## Message Properties

For templating purposes (any property starting with an underscore _) every message has some properties that might be good to know about

- http
    - originalUrl: express.js req.originalUrl
    - baseUrl: express.js req.baseUrl
    - path: express.js req.path
    - body: express.js req.body
- midi
    - port: the name of the midi port that the message came in on
    - status: midi status i.e. note_on, note_off, program_change, control_change, etc.
    - channel: midi channel 1-16
    - note: midi note 1-127
    - velocity: midi velocity 1-127
    - pressure: midi pressure 1-127
    - control: midi control number 1-127
    - value: value portion of control change and pitch_bend 
    - program: program number 1- 127
    - bytes: the 3 MIDI data bytes
- mqtt
    - payload: the contents of the MQTT message either an object if parsable JSON or the raw contents as a string
    - topic: the topic of the published MQTT message
- osc
    - address: address of the incoming osc message /an/osc/address
    - addressParts: an array of address i.e. ["an","osc","address"] 
    - args: array of args of the incoming osc message [0,"1",2.0]
    - bytes: the osc message as bytes
- tcp
    - bytes: UInt8Array of the TCP packet
    - string: string representation of the TCP packet
- udp
    - bytes: UInt8Array of the UDP packet
    - string: string representation of the UDP packet
- websocket
    - payload: ws message content (if this is JSON it will be parsed into an object)