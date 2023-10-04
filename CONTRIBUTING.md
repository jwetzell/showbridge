# showbridge


## Running for development
After cloning the repo and running `npm install` it would be useful to run `npm run install:all` this will install the dependencies for all the sub projects (see below) that need them. This gets things into a good starting place for development.


I have done my best to include a dev script for all of the folders below where it makes sense. So simply running `npm run dev` should get you into a running state. This will either be a live-reload process where changes will be detected and rebuilt or the current piece will be built with what is in your working directory and launched (launcher). The script should also take care of the linking for the libraries (showbridge, showbridge-lib) where necessary. 

# Summary of folders
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
