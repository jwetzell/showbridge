<div align="center">

# showbridge

![npm](https://img.shields.io/npm/v/%40showbridge/lib?label=lib)
![npm](https://img.shields.io/npm/v/%40showbridge/cli?label=cli)
![GitHub release (with filter)](https://img.shields.io/github/v/release/jwetzell/showbridge?label=launcher)
![npm](https://img.shields.io/npm/v/%40showbridge/cloud?label=cloud)
![npm](https://img.shields.io/npm/v/%40showbridge/webui?label=webui)



Simple protocol router _/s_

[Run](#how-to-run) •
[CLI Usage](#cli-usage) •
[Config File](#config-file) •
[Docs](#docs)

</div>

### Supported Protocols
- HTTP & WebSocket
- OSC (via UDP and TCP)
- UDP
- TCP
- MQTT
- MIDI

### How to run
- Launcher
  - download/install [launcher](https://github.com/jwetzell/showbridge/releases) this is the easiest method to get up and running and includes the web interface and logging
  - run showbridge!
- NPM
  - create a config file (see below)
  - optionally install globally: `npm install -g @showbridge/cli`
  - run
    - if installed globally: `showbridge -c config.json`
    - via npx: `npx @showbridge/cli@latest -c config.json`
  - this method still has the web interface available via HTTP
  - use the `-h` flag to see other available flags
- Source
  - clone repo
  - install dependencies: `npm install && npm run install:all`
  - run: `cd cli && npm run start -- -c config.json`
    - see [CLI Usage](#cli-usage) for more flags
    - if no config file is specified then a [default config](sample/config/default.json) will be used
  - to run the launcher
    - `cd launcher`
    - `npm run start`
   
## CLI Usage
```
Usage: @showbridge/cli [options]

Simple protocol router /s

Options:
  -V, --version                            output the version number
  -c, --config <path>                      location of config file
  -v, --vars <path>                        location of file containing vars
  -w, --webui <path>                       location of webui html to serve
  --disable-action <action-type...>        action type(s) to disable
  --disable-protocol <protocol-type...>    protocol type(s) to disable
  --disable-trigger <trigger-type...>      trigger type(s) to disable
  --disable-transform <transform-type...>  transform type(s) to disable
  -l, --log-level <level>                  log level (choices: "trace", "debug", "info", "warn", "error", "fatal", default: "info")
  -h, --help                               display help for command

```

## Config File
The showbridge router's config is entirely controlled by a JSON config file. This file can be made by hand or edited via the web interface included with the launcher. The router WILL NOT start up with an invalid config file. I do provide some starter/example configs to look at to get a general idea of what one entails. 

Resources
- the [JSON Schema](https://docs.showbridge.io/schema/config) used to validate the config file
- good idea to start with [default.json](sample/config/default.json)
- [random examples](sample/config/)
- the [demo](https://demo.showbridge.io) site can be used to import/edit/create configs that can be downloaded
    

## Docs
For more information about showbridge and its inner workings check out the [documention](https://docs.showbridge.io)
