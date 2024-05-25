---
title: CLI
sidebar:
  order: 2
---
- create a config file (see [config](/reference/config/))
- optionally install globally: `npm install -g @showbridge/cli`
- run
  - if installed globally: `showbridge -c config.json`
  - via npx: `npx @showbridge/cli@latest -c config.json`
  - see below for all flags
- this method still has the web interface available via HTTP
- use the `-h` flag to see other available flags

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