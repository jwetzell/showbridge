# oscee

### *Simple OSC/MIDI router _/s_

## Triggers
- regex
    - patterns: a list of regex patterns as strings
    - properties: a list of properties to test with their respective patterns, must be 1:1 
- sender
    - address: the ip address of the host that will trip this trigger
- bytes-equal
    - bytes: array of bytes to match to the bytes of the incoming message (supports midi, tcp, udp, osc messages)
- midi-note-on
    - note: optional note value 0-127 to match the incoming note on message to. if excluded all incoming notes will fire this trigger
    - velocity: optional note velocity to match the incoming note on message to
- midi-note-off
    - note: optional note value 0-127 to match the incoming note off message to. if excluded all incoming notes will fire this trigger
    - velocity: optional note velocity to match the incoming note off message to
- midi-control-change
    - control: optional control number 0-127 to match the incoming message to
    - value: optional control value 0-127 to match the incoming message to
- midi-program-change
    - program: optional program number 0-127 to match the incoming message to

## Actions
- forward
    - host: address of the server to forward the message,
    - protocol: udp or tcp,
    - port: port (number) to forward the message to,
- osc-output
    - protocol: udp or tcp,
    - host: address of the server to forward the message,
    - port: port (number) to forward the osc message to,
    - _address: a javascript literal string with msg available i.e. "/routed${msg.address}",
    - address: hardcoded address to send the message to, _address has priority
    - _args: an array of args all string will be interpreted as javascript templates like _address non-strings will be passed along as is
    - args: hardcoded array of args values i.e [0, "hello", 1.5], _args has priority
- udp-output
    - host: address of the server to send the message to,
    - port: port (number) to udp message on,
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - _string: templated string to send
    - string: static string to send
- tcp-output
    - host: address of the server to send the message to,
    - port: port (number) to tcp message on,
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - _string: templated string to send
    - string: static string to send
- midi-output
    - bytes: byte array of midi data [status + channel, data1, data2]
    - status: midi status (i.e note_on, note_off, program_change, etc.)
    - note: note value (note_off,, note_on, polyphonic_aftertouch)
    - velocity: velocity value (note_off, note_on)
    - control: control number (control_change)
    - program: program number (program_change)
    - pressure: pressure value (polyphonic_aftertouch, channel_aftertouch)
    - value: value (control_change, pitch_bend)
- delay
    - duration: time in ms to wait befor executing the defined actions
    - actions: array of actions to execute
- log: action takes no params and will simply log the incoming message out useful for debugging triggers
- shell:
    - _command: JS literal template of shell command to run has access to msg properties
    - command: shell command to run _command has priority