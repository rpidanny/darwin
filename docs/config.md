`darwin config`
===============

Manage the app config

* [`darwin config get`](#darwin-config-get)
* [`darwin config set`](#darwin-config-set)

## `darwin config get`

Get currently set config

```
USAGE
  $ darwin config get [--log-level TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

GLOBAL FLAGS
  --log-level=<option>  [default: INFO] Specify level for logging.
                        <options: TRACE|DEBUG|INFO|WARN|ERROR|FATAL>

DESCRIPTION
  Get currently set config

EXAMPLES
  $ darwin config get
```

_See code: [src/commands/config/get.ts](https://github.com/rpidanny/darwin/blob/v1.16.0/src/commands/config/get.ts)_

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

_See code: [src/commands/config/set.ts](https://github.com/rpidanny/darwin/blob/v1.16.0/src/commands/config/set.ts)_
