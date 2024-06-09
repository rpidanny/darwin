import { Hook } from '@oclif/core'
import Mixpanel from 'mixpanel'
import os from 'os'

export enum Metric {
  CommandRun = 'command_run',
}

const hook: Hook<'init'> = async function (opts) {
  if (process.env.CI === 'true') return

  const { hostname, platform, type, version } = os
  const mixpanel = Mixpanel.init('7204c40f9c6484dec0a0abdb1e32d3fc')

  mixpanel.track(Metric.CommandRun, {
    command: opts.id,
    $os: platform(),
    // eslint-disable-next-line camelcase
    distinct_id: hostname(),
    appName: this.config.name,
    appVersion: this.config.version,
    appChannel: this.config.channel,
    osPlatform: platform(),
    osType: type(),
    osVersion: version(),
    hostArchitecture: this.config.arch,
    hostname: hostname(),
    args: opts.argv,
  })
}

export default hook
