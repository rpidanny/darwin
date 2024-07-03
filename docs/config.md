`darwin config`
===============

Manage application configurations.

* [`darwin config get`](#darwin-config-get)
* [`darwin config set`](#darwin-config-set)

## `darwin config get`

Get currently set config

```
USAGE
  $ darwin config get [-l TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

GLOBAL FLAGS
  -l, --log-level=TRACE|DEBUG|INFO|WARN|ERROR|FATAL  [default: INFO] Specify logging level.

DESCRIPTION
  Get currently set config

EXAMPLES
  $ darwin config get
```

_See code: [src/commands/config/get.ts](https://github.com/rpidanny/darwin/blob/v1.29.4/src/commands/config/get.ts)_

## `darwin config set`

Set config

```
USAGE
  $ darwin config set

DESCRIPTION
  Set config

EXAMPLES
  $ darwin config set
```

_See code: [src/commands/config/set.ts](https://github.com/rpidanny/darwin/blob/v1.29.4/src/commands/config/set.ts)_
