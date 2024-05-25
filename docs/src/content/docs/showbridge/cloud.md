---
title: Cloud
sidebar:
  order: 99
---

## Connecting instances remotely?
Remotely connecting two or more router instances is supported via [showbridge cloud](https://github.com/jwetzell/showbridge/tree/main/cloud). The only configuration necessary is the url of the cloud server (a **public** cloud server is available by using https://cloud.showbridge.io) the other necessary configuration option is rooms explained below.

Routers can send messages through the cloud server using the cloud-output action mentioned in [actions](/reference/actions/#cloud-output). To control what messages routers are listening to when multiple routers are connected to the same cloud server the concept of rooms is used. A room is simply a string i.e 'room1', 'super-secret-room-name', etc. when a cloud-output action is used the configured room(s) property of that action controls what room(s) the message will be sent to. The room(s) property of the cloud params controls what room(s) a router is joined to. When a cloud-output sends a message to a room that a router is configured to be in then the router will receive the message sent and process it as if it was a native message.

### Cloud Example: not sure this will make things any more clear but....
- assume all routers are configured to connect to the same cloud server
- router1 is setup to join `room1` and log all midi-note-on messages
- router2 is setup to join `room1` and `room2` and log all midi-note-on messages
- router3 is not setup to be a part of any room
    - router3 is configured with a midi-note-on trigger with a cloud-output action that has rooms = ["room1","room2"]
- router3 now receives a midi note_on message. The cloud-output action will cause the following.
    - router1 will log a midi-note-on message
    - router2 will log 2 midi-note-on messages (this is because it is joined to 2 rooms and the cloud-output action was configured to send the message to both of the rooms that router2 was joined to)