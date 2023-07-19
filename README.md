## Simple protocol router _/s_

### Supported Protocols
- http
- websocket
- osc (via udp and tcp)
- tcp
- udp
- mqtt
- midi

### How to use
- Install
    - prebuilt binaries (check the releases section)
    - build from source: clone and run `npm install && npm run package` to build binaries located at `dist/bin`
    - via npm: `npm install -g showbridge` or run directly with npx `npx showbridge@latest -c config.json`
- Create config file
    - sorry, this is the worst part [JSON Schema](https://showbridge.jwetzell.com/docs/schema/config)
    - good idea to start with [default.json](config/default.json)
- Run
    - `showbridge -c config.json`
    - if you would like to turn on debug logging use the `-d` or `--debug` flag
    - if no config file is specified then a [default config](config/default.json) will be used

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
- **any**: fires for any incoming message
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
- **osc-address**
    - address: the OSC address to match to incoming OSC messages. Supports address patterns according to the OSC spec.

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
- **cloud-output**
    - room(s): string or array of string representing the room(s) to send the incoming msg (post transforms) to

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


## Templating
Alright there is a lot of references to templating. There is no secret sauce it is simply [lodash templating](https://lodash.com/docs/4.17.15#template) which is compatible with JS template literals (backtick strings)
- **examples**: assume incoming message is a midi note on message on channel 1 with note value = 60 and velocity = 127
    - `"/midi/${msg.channel}/${msg.status}/${msg.note}"` -> `/midi/1/note_on/60`
    - `"${msg.velocity - 10}"` -> `117`
    - `"${msg.note + 12}"` -> `72`


## Message Properties

For templating purposes (any param starting with an underscore `_`) the incoming message is made available as `msg` and the properties available under this `msg` object are outlined below. See above for some examples using a midi message as an example of how these properties can be accessed in a template. 

- **http**
    - originalUrl: express.js req.originalUrl
    - baseUrl: express.js req.baseUrl
    - path: express.js req.path
    - body: express.js req.body
- **midi**
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
- **mqtt**
    - payload: the contents of the MQTT message either an object if parsable JSON or the raw contents as a string
    - topic: the topic of the published MQTT message
- **osc**
    - address: address of the incoming osc message /an/osc/address
    - addressParts: an array of address i.e. ["an","osc","address"] 
    - args: array of args of the incoming osc message [0,"1",2.0]
    - bytes: the osc message as bytes
- **tcp**
    - bytes: UInt8Array of the TCP packet
    - string: string representation of the TCP packet
- **udp**
    - bytes: UInt8Array of the UDP packet
    - string: string representation of the UDP packet
- **websocket**
    - payload: ws message content (if this is JSON it will be parsed into an object)

## Connecting instances remotely?
Remotely connecting two or more router instances is supported via the cloud config sections. The routers can send messages through the cloud server using the cloud-output action mentioned above. To control what messages routers are listening to when multiple routers are connected to the same cloud server the concept of rooms is used. A room is simply a string i.e 'room1', 'super-secret-room-name', etc. when a cloud-output action is used the configured room(s) property of that action controls what room(s) the message will be sent to. The room(s) property of the cloud params controls what room(s) a router is joined to. When a cloud-output sends a message to a room that a router is configured to be in then the router will receive the message sent and process it as if it was a native message.
### Cloud Example: not sure this will make things any more clear but....
- assume all routers are configure to connect to the same cloud server
- router1 is setup to join `room1` and log all midi-note-on messages
- router2 is setup to join `room1` and `room2` and log all midi-note-on messages
- router3 is not setup to be a part of any room
    - router3 is configured with a midi-note-on trigger with a cloud-output action that has rooms = ["room1","room2"]
- router3 now receives a midi note_on message the cloud-output action will cause the following
    - router1 will log a midi-note-on message
    - router2 will log 2 midi-note-on messages (this is because it is joined to 2 rooms and the cloud-output action was configured to send the message to both of the rooms that router2 was joined to)
