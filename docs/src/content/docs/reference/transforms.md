---
title: Transforms
sidebar:
  order: 7
---
## **floor**
    - property: the path to the property in the incoming msg object
## **log**
    - property: the path to the property in the incoming msg object
    - base: the base of the log
## **map**
    - property: the path to the property in the incoming msg object
    - map: an object representing a mapping between incoming msg.property values and their output i.e {"MON":"Monday"} so if msg.property === "MON" then msg.property will be set to "Monday" and passed along
## **power**
    - property: the path to the property in the incoming msg object
    - exponent: the exponent to raise the value of msg.property to
## **round** 
    - property: the path to the property in the incoming msg object
## **scale**
    - property: the path to the property in the incoming msg object
    - inRange: the range of values for the incoming msg.property value i.e [0,100]
    - outRange: the range of values to scale msg.property value into [1,10]
## **template**
    - property: the path to the property in the incoming msg object
    - template: the template that will be evaluated and then set as the value of the msg.property