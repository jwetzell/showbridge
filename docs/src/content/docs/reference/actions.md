---
title: Actions
sidebar:
  order: 6
---
## **cloud-output**
    - rooms\*: array of strings representing the room(s) to send the incoming msg (post transforms) to
## **delay**
    - duration: time in ms to wait before executing the defined actions
    - actions: array of actions to execute
## **forward**
    - host\*: address of the server to forward the message
    - protocol: udp or tcp
    - port\*: port (number) to forward the message to
## **http-request**
    - method: HTTP method to use i.e GET, POST, DELETE, etc.
    - url\*: the URL to make the call to
    - contentType: the value to set the Content-Type header to
    - body\*: value to use for the body of the HTTP request
## **http-response**
    - body\*: value to use for the body of the HTTP request
    - contentType: the value to set the Content-Type header to
## **log**: 
    the log action takes no params and will simply log the incoming message out useful for debugging triggers
## **midi-output**
    - port\*: optional name of the port to send the message to. defaults to virtual output
    - bytes: byte array of midi data [status + channel, data1, data2]
    - status: midi status (i.e note_on, note_off, program_change, etc.)
    - note: note value (note_off,, note_on, polyphonic_aftertouch)
    - velocity: velocity value (note_off, note_on)
    - control: control number (control_change)
    - program: program number (program_change)
    - pressure: pressure value (polyphonic_aftertouch, channel_aftertouch)
    - value: value (control_change, pitch_bend)
## **mqtt-output**
    - topic\*: the MQTT topic to publish the message to
    - payload\*: the payload of the mqtt message
## **osc-output**
    - protocol: udp or tcp,
    - host\*: address of the server to forward the message
    - port\*: port (number) to forward the osc message to
    - address\*: address to send the message to, _address has priority
    - args\*: array of args values i.e [0, "hello", 1.5], _args has priority
## **random**
    - actions: array of actions to randomly pick from
## **shell**
    - command\*: shell command to run _command has priority
## **store**
    - key\*: the key of the property to set use `.` for nested properties
    - value\*: the value to set that key to
## **tcp-output**
    - host\*: address of the server to send the message to
    - port\*: port (number) to tcp message on
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - string\*: string to send
## **udp-output**
    - host\*: address of the server to send the message to
    - port\*: port (number) to udp message on
    - bytes: hardcoded array of byte values i.e [0, 100, 200] to send over UDP
    - hex: hex string (i.e 6869, 68 69 , 0x68 0x69, etc) to turn into bytes and send
    - string\*: string to send