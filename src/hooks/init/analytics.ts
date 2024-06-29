/* eslint-disable @typescript-eslint/no-namespace */
import { Config, Hook } from '@oclif/core'
import Mixpanel from 'mixpanel'
import moment from 'moment'
import os from 'os'
import { performance } from 'perf_hooks'

import { Metric } from '../../utils/analytics/metric.js'

const hook: Hook<'init'> = async function (opts) {
  if (process.env.CI === 'true') return

  const { hostname, platform, type, version } = os
  const mixpanel = Mixpanel.init('7204c40f9c6484dec0a0abdb1e32d3fc', {
    geolocate: true,
  })
  const now = new Date()

  const metadata = {
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
    startTime: moment(now).format('YYYY-MM-DD HH:mm:ss'),
    startTimestamp: now.getTime(),
  }

  // Inject custom data into the config object
  ;(opts.config as Config).customData = {
    startTime: performance.now(),
    mixpanel,
    metadata,
  }

  mixpanel.track(Metric.CommandRun, { ...metadata })
}

export default hook
