---
title: Dictionary
sidebar:
  order: 1
---

- **router**: throughout documentation I will use the term router to refer to configured/running instance of showbridge
- **triggers**: when a message comes in triggers enforce some criteria on the incoming message. If a message "ticks all the boxes" the actions of the trigger are then performed. Triggers can have subTriggers which are further evaluated if the trigger is "fired". Triggers do not stack each trigger in the array is evaluated in isolation.
- **actions**: actions are what should be done as a result of a trigger being well triggered, actions can transform the message that they act on using transforms
- **transforms**: transforms transform messages, the transformations are localized to the action the transform is a part of
- **message**: any incoming communication into showbridge bundled into a message object i.e HTTP Request, MIDI Note On, UDP Packet, etc.