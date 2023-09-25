# showbridge

## [lib](./lib/)
lib is the actual meat of showbridge defining a library that is than wrapped up and fronted by other sections

published as [showbridge-lib](https://npmjs.com/package/showbridge-lib)

## [main.js](./main.js)
main.js at the root of this repo is a script using [commander.js](https://github.com/tj/commander.js) that wraps the library above into an executable script with options for where to load a config from, log levels, node process messaging, etc.

published as [showbridge](https://npmjs.com/package/showbridge)

## [launcher](./launcher/)
the launcher is an electron app that wraps the main.js script into a desktop app setting up things like config directory, logs, quick settings, etc.

## [webui](./webui/)
an angular web interface for managing a running instance of the main.js executable this is bundled into the launcher and served on whatever port the user has configured for the http protocol

## [scripts](./scripts/)
general build/dev scripts

## [schema](./schema/)
schema for the router config JSON file
- would be nice to split this up

## [cloud](./cloud/)
source for cloud server portion of showbridge
