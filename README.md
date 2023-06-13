# oscee

### Simple OSC/MIDI router /s

## Triggers

- osc-regex
    - pattern: regex pattern
    - matchProperty: the property of the inbound msg the pattern will be applied to
- host
    - host: the address of the host that will trip this trigger
- midi-bytes-equals
    - data: array of 3 bytes [status, data1, data2]
- midi-note-on
    - note: optional note value 0-127 to match the incoming note on message to. if excluded all incoming notes will fire this trigger
- midi-note-off
    - note: optional note value 0-127 to match the incoming note off message to. if excluded all incoming notes will fire this trigger
