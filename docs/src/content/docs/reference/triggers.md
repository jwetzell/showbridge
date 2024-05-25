---
title: Triggers
sidebar:
  order: 5
---
## **any**: 
    fires for any incoming message
## **bytes-equal**
    - bytes: array of bytes to match to the bytes of the incoming message (supports midi, tcp, udp, osc messages
## **http-request**
    - path: the path to match the incoming HTTP requst agains i.e `index.html`, `/api/v1/test`, etc.
    - method: the HTTP method to match against the incoming HTTP request i.e GET, POST, DELETE, etc.
## **midi-control-change**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - control: optional control number 0-127 to match the incoming message to
    - value: optional control value 0-127 to match the incoming message to
## **midi-note-off**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - note: optional note value 0-127 to match the incoming note off message to
    - velocity: optional note velocity to match the incoming note off message to
## **midi-note-on**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - note: optional note value 0-127 to match the incoming note on message to
    - velocity: optional note velocity to match the incoming note on message to
## **midi-pitch-bend**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - value: optional pitch bend value 0-16384 to match the incoming message to
## **midi-program-change**
    - port: optional name of the MIDI device to match the incoming message to
    - channel: optional MIDI channel number 1-16 to match the incoming message to
    - program: optional program number 0-127 to match the incoming message to
## **mqtt-topic**
    - topic: the MQTT topic to match to incoming MQTT messages. Supports mqtt wildcards patterns like `+` and `#`.
## **osc-address**
    - address: the OSC address to match to incoming OSC messages. Supports address patterns according to the OSC spec.
## **regex**
    - patterns: a list of regex patterns as strings
    - properties: a list of properties to test with their respective patterns, must be 1:1 
## **sender**
    - address: the ip address of the host that will trip this trigger