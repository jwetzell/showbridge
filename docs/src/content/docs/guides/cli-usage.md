---
title: CLI Usage
sidebar:
  order: 2
---

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