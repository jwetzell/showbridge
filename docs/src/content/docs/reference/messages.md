---
title: Messages
sidebar:
  order: 9
---
For templating purposes (any param starting with an underscore `_`) the incoming message is made available as `msg` and the properties available under this `msg` object are outlined below. See [templating](/reference/templating/) for some examples using a midi message as an example of how these properties can be accessed in a template. 

## **http**
    - originalUrl: express.js req.originalUrl
    - baseUrl: express.js req.baseUrl
    - path: express.js req.path
    - body: express.js req.body
## **midi**
    - port: the name of the midi port that the message came in on
    - status: midi status i.e. note_on, note_off, program_change, control_change, etc.
    - channel: midi channel 1-16
    - note: midi note 1-127
    - velocity: midi velocity 1-127
    - pressure: midi pressure 1-127
    - control: midi control number 1-127
    - value: value portion of control_change, pitch_bend, mtc messages
    - program: program number 1- 127
    - type: timecode type from mtc messages
    - song: song number from song_select messages
    - beats: MIDI beats for song_position mesages
    - bytes: the 3 MIDI data bytes
## **mqtt**
    - payload: the contents of the MQTT message either an object if parsable JSON or the raw contents as a string
    - topic: the topic of the published MQTT message
## **osc**
    - address: address of the incoming osc message /an/osc/address
    - addressParts: an array of address segments i.e. ["an","osc","address"] 
    - args: array of args of the incoming osc message [0,"1",2.0]
    - bytes: the osc message as bytes
## **tcp**
    - bytes: UInt8Array of the TCP packet
    - string: string representation of the TCP packet
## **udp**
    - bytes: UInt8Array of the UDP packet
    - string: string representation of the UDP packet
## **websocket**
    - payload: ws message content (if this is JSON it will be parsed into an object)