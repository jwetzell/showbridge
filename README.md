# oscee

### Simple OSC/MIDI router /s

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
- tcp-output
    - host: address of the server to send the message to,
    - port: port (number) to tcp message on,
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
- midi-output
    - bytes: byte array of midi data [status, data1, data2]
- log: action takes no params and will simply log the incoming message out useful for debugging triggers
- shell:
    - _command: JS literal template of shell command to run has access to msg properties
    - command: shell command to run _command has priority