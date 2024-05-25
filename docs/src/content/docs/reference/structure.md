---
title: Structure
sidebar:
  order: 3
---
Every piece (triggers, actions, transforms) have a shared JSON structure
- **comment**: string used only for future reference
- **type**: string that denotes the type of the trigger/action/transform
- **params**: an object that holds the config for the trigger/action/transform
- **enabled**: boolean - if false the piece is skipped and so are the underlying pieces. i.e. if a trigger is disabled no actions under that trigger will be performed, if an action is disabled no transforms under that action will be performed