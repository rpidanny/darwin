import { Config, Hook } from '@oclif/core'
import moment from 'moment'
import prettyMilliseconds from 'pretty-ms'

import { Metric } from '../../utils/analytics/metric.js'

const hook: Hook<'postrun'> = async function (opts) {
  if (process.env.CI === 'true') return

  const { customData } = opts.config as Config

  if (!customData) return

  const now = new Date()
  const { metadata, mixpanel, startTime } = customData

  const endTime = performance.now()
  const durationMs = endTime - (startTime || 0)

  const payload = {
    ...metadata,
    endTime: moment(now).format('YYYY-MM-DD HH:mm:ss'),
    endTimestamp: now.getTime(),
    duration: prettyMilliseconds(durationMs),
  }

  mixpanel.track(Metric.CommandComplete, payload)
}

export default hook
