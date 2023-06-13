# oscee

### Simple OSC/MIDI router /s

## Triggers

- osc-regex
    - patterns: a list of regex patterns as strings
    - properties: a list of properties to test with their respective patterns to must be 1:1
- host
    - host: the address of the host that will trip this trigger
- midi-bytes-equals
    - data: array of 3 bytes [status, data1, data2]
- midi-note-on
    - note: optional note value 0-127 to match the incoming note on message to. if excluded all incoming notes will fire this trigger
- midi-note-off
    - note: optional note value 0-127 to match the incoming note off message to. if excluded all incoming notes will fire this trigger

## Actions
- osc-forward
    - protocol: udp or tcp (not implemented yet),
    - host: address of the server to forward the message,
    - port: port (number) to forward the osc message to,
- osc-output
    - protocol: udp or tcp (not implemented yet),
    - host: address of the server to forward the message,
    - port: port (number) to forward the osc message to,
    - _address: a javascript literal string with msg available i.e. "/routed${msg.address}",
    - address: hardcoded address to send the message to, _address has priority
    - _args: an array of args all string will be interpreted as javascript templates like _address non-strings will be passed along as is
    - args: hardcoded array of args values i.e [0, "hello", 1.5], _args has priority
- midi-output
    - port: the midi port number to output this message on (see output table on program launch for list of output ports)
    - data: byte array of midi data [status, data1, data2]
- log: action takes no params and will simply log the incoming message out useful for debugging triggers
