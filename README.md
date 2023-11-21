<div align="center">

# showbridge

![npm](https://img.shields.io/npm/v/%40showbridge/lib?label=lib)
![npm](https://img.shields.io/npm/v/%40showbridge/cli?label=cli)
![GitHub release (with filter)](https://img.shields.io/github/v/release/jwetzell/showbridge?label=launcher)
![npm](https://img.shields.io/npm/v/showbridge-cloud?label=cloud)



Simple protocol router _/s_

[Run](#how-to-run) •
[CLI Usage](#cli-usage) •
[Config File](#config-file) •
[Structure](#structure) •
[Templating](#templating) •
[Cloud](#cloud)

</div>

### Supported Protocols
- HTTP
- WebSocket
- OSC (via UDP and TCP)
- UDP
- TCP
- MQTT
- MIDI

### How to run
- Launcher
  - download/install [launcher](https://github.com/jwetzell/showbridge/releases) this is the easiest method to get up and running and includes the web interface and logging
  - run showbridge!
- NPM
  - create a config file (see below)
  - optionally install globally: `npm install -g @showbridge/cli`
  - run
    - if installed globally: `showbridge -c config.json`
    - via npx: `npx @showbridge/cli@latest -c config.json`
  - this method still has the web interface available via HTTP
  - use the `-h` flag to see other available flags
- Source
  - clone repo
  - install dependencies: `npm install && npm run install:all`
  - run: `npm run start -- -c config.json`
    - see [CLI Usage](#cli-usage) for more flags
    - if no config file is specified then a [default config](sample/config/default.json) will be used
  - if you would like the webui it will need to be built
    - `cd webui`
    - `npm run build`
  - to include the webui just relaunch showbridge by running: `npm run start -- -c config.json --webui webui/dist/webui`
  - to run the launcher (these steps will also build the webui)
    - `cd launcher`
    - `npm run start`
   
## CLI Usage
```
Usage: showbridge [options]

Simple protocol router /s

Options:
  -V, --version                            output the version number
  -c, --config <path>                      location of config file
  -v, --vars <path>                        location of file containing vars
  -w, --webui <path>                       location of webui html to serve
  --disable-action <action-type...>        action type(s) to disable
  --disable-protocol <protocol-type...>    protocol type(s) to disable
  --disable-trigger <trigger-type...>      trigger type(s) to disable
  --disable-transform <transform-type...>  transform type(s) to disable
  -l, --log-level <level>                  log level (choices: "trace", "debug", "info", "warn", "error", "fatal", default: "info")
  -h, --help                               display help for command
```

## Config File
The showbridge router's config is entirely controlled by a JSON config file. This file can be made by hand or edited via the web interface included with the launcher. The router WILL NOT start up with an invalid config file. I do provide some starter/example configs to look at to get a general idea of what one entails. 

Resources
- the [JSON Schema](https://docs.showbridge.io/schema/config) used to validate the config file
- good idea to start with [default.json](sample/config/default.json)
- [random examples](sample/config/)
- the [demo](https://demo.showbridge.io) site can be used to import/edit/create configs that can be downloaded
    

## The _Basics_
- router: throughout documentation I will use the term router to refer to configured/running instance of showbridge
- triggers: when a message comes in triggers enforce some criteria on the incoming message. If a message "ticks all the boxes" the actions of the trigger are then performed. Triggers can have subTriggers which are further evaluated if the trigger is "fired". Triggers do not stack each trigger in the array is evaluated in isolation.
- actions: actions are what should be done as a result of a trigger being well triggered, actions can transform the message that they act on using transforms
- transforms: transforms transform messages, the transformations are localized to the action the transform is a part of

# Structure
Every piece (triggers, actions, transforms) have a shared JSON structure
- type: string that denotes the type of the trigger/action/transform
- params: an object that holds the config for the trigger/action/transform
- enabled: boolean - if false the piece is skipped and so are the underlying pieces. i.e. if a trigger is disabled no actions under that trigger will be performed, if an action is disabled no transforms under that action will be performed

## Params
Each piece uses the params property to store its configurations as outlined below. An **\*** means the param can be [templated](#templating) by prefixing it with an underscore (`_`) (i.e `address` -> `_address`). You can assume that the templated param will take priority over its not templated version if they are both defined.

### Triggers
- **any**: fires for any incoming message
- **bytes-equal**
    - bytes: array of bytes to match to the bytes of the incoming message (supports midi, tcp, udp, osc messages)
- **midi-control-change**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - control: optional control number 0-127 to match the incoming message to
    - value: optional control value 0-127 to match the incoming message to
- **midi-note-off**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - note: optional note value 0-127 to match the incoming note off message to
    - velocity: optional note velocity to match the incoming note off message to
- **midi-note-on**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - note: optional note value 0-127 to match the incoming note on message to
    - velocity: optional note velocity to match the incoming note on message to
- **midi-program-change**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - program: optional program number 0-127 to match the incoming message to
- **osc-address**
    - address: the OSC address to match to incoming OSC messages. Supports address patterns according to the OSC spec.
- **regex**
    - patterns: a list of regex patterns as strings
    - properties: a list of properties to test with their respective patterns, must be 1:1 
- **sender**
    - address: the ip address of the host that will trip this trigger

### Actions
- **cloud-output**
    - rooms\*: array of strings representing the room(s) to send the incoming msg (post transforms) to
- **delay**
    - duration: time in ms to wait before executing the defined actions
    - actions: array of actions to execute
- **forward**
    - host\*: address of the server to forward the message
    - protocol: udp or tcp
    - port\*: port (number) to forward the message to
- **http**
    - method: HTTP method to use i.e GET, POST, DELETE, etc.
    - url\*: the URL to make the call to
    - contentType: the value to set the Content-Type header to
    - body\*: value to use for the body of the HTTP request
- **log**: action takes no params and will simply log the incoming message out useful for debugging triggers
- **midi-output**
    - port\*: optional name of the port to send the message to. defaults to virtual output
    - bytes: byte array of midi data [status + channel, data1, data2]
    - status: midi status (i.e note_on, note_off, program_change, etc.)
    - note: note value (note_off,, note_on, polyphonic_aftertouch)
    - velocity: velocity value (note_off, note_on)
    - control: control number (control_change)
    - program: program number (program_change)
    - pressure: pressure value (polyphonic_aftertouch, channel_aftertouch)
    - value: value (control_change, pitch_bend)
- **mqtt-output**
    - topic\*: the MQTT topic to publish the message to
    - payload\*: the payload of the mqtt message
- **osc-output**
    - protocol: udp or tcp,
    - host\*: address of the server to forward the message
    - port\*: port (number) to forward the osc message to
    - address\*: address to send the message to, _address has priority
    - args\*: array of args values i.e [0, "hello", 1.5], _args has priority
- **random**
    - actions: array of actions to randomly pick from
- **shell**
    - command\*: shell command to run _command has priority
- **store**
    - key\*: the key of the property to set use `.` for nested properties
    - value\*: the value to set that key to
- **tcp-output**
    - host\*: address of the server to send the message to
    - port\*: port (number) to tcp message on
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - string\*: string to send
- **udp-output**
    - host\*: address of the server to send the message to
    - port\*: port (number) to udp message on
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - string\*: string to send

### Transforms
- **floor**
    - property: the path to the property in the incoming msg object
- **log**
    - property: the path to the property in the incoming msg object
    - base: the base of the log
- **map**
    - property: the path to the property in the incoming msg object
    - map: an object representing a mapping between incoming msg.property values and their output i.e {"MON":"Monday"} so if msg.property === "MON" then msg.property will be set to "Monday" and passed along
- **power**
    - property: the path to the property in the incoming msg object
    - exponent: the exponent to raise the value of msg.property to
- **round** 
    - property: the path to the property in the incoming msg object
- **scale**
    - property: the path to the property in the incoming msg object
    - inRange: the range of values for the incoming msg.property value i.e [0,100]
    - outRange: the range of values to scale msg.property value into [1,10]
- **template**
    - property: the path to the property in the incoming msg object
    - template: the template that will be evaluated and then set as the value of the msg.property


# Templating
Alright there has been a some references to templating. There is no secret sauce it is simply [lodash templating](https://lodash.com/docs/4.17.15#template) which is compatible with JS template literals (backtick strings). The incoming `msg` and the global `vars` objects are available when templates are processed. For properties of incoming messages [see here](#message-properties). The `vars` object will contain the contents of the `vars.json` file passed in with `-v` flag or any value set using the `store` action.
- **examples**: assume an incoming message is a midi note_on message on channel 1 with note value = 60 and velocity = 127
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
    - addressParts: an array of address segments i.e. ["an","osc","address"] 
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

# Cloud

## Connecting instances remotely?
Remotely connecting two or more router instances is supported via [showbridge cloud](./cloud). The only configuration necessary is the url of the cloud server (for a **publicly** available server you can use https://cloud.showbridge.io) the other necessary configuration option is room(s) explained below.

Routers can send messages through the cloud server using the cloud-output action mentioned above. To control what messages routers are listening to when multiple routers are connected to the same cloud server the concept of rooms is used. A room is simply a string i.e 'room1', 'super-secret-room-name', etc. when a cloud-output action is used the configured room(s) property of that action controls what room(s) the message will be sent to. The room(s) property of the cloud params controls what room(s) a router is joined to. When a cloud-output sends a message to a room that a router is configured to be in then the router will receive the message sent and process it as if it was a native message.

### Cloud Example: not sure this will make things any more clear but....
- assume all routers are configured to connect to the same cloud server
- router1 is setup to join `room1` and log all midi-note-on messages
- router2 is setup to join `room1` and `room2` and log all midi-note-on messages
- router3 is not setup to be a part of any room
    - router3 is configured with a midi-note-on trigger with a cloud-output action that has rooms = ["room1","room2"]
- router3 now receives a midi note_on message. The cloud-output action will cause the following.
    - router1 will log a midi-note-on message
    - router2 will log 2 midi-note-on messages (this is because it is joined to 2 rooms and the cloud-output action was configured to send the message to both of the rooms that router2 was joined to)
