---
title: Run
sidebar:
  order: 1
---
# Desktop
  - download/install [launcher](https://github.com/jwetzell/showbridge/releases) this is the easiest method to get up and running and includes the web interface and logging
  - run showbridge!

# CLI
  - create a config file (see [config](/reference/config/))
  - optionally install globally: `npm install -g @showbridge/cli`
  - run
    - if installed globally: `showbridge -c config.json`
    - via npx: `npx @showbridge/cli@latest -c config.json`
    - see [CLI Usage](/guides/cli-usage) for more flags
  - this method still has the web interface available via HTTP
  - use the `-h` flag to see other available flags

# Source
  - clone repo
  - install dependencies: `npm install && npm run install:all`
  - run: `cd cli && npm run start -- -c config.json`
    - see [CLI Usage](/guides/cli-usage) for more flags
    - if no config file is specified then a [default config](https://github.com/jwetzell/showbridge/blob/main/sample/config/default.json) will be used
  - to run the launcher
    - `cd launcher`
    - `npm run start`
