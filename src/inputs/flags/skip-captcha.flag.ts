import * as oclif from '@oclif/core'

import { FlagChar } from './char.js'

export default oclif.Flags.boolean({
  char: FlagChar.SkipCaptcha,
  summary: 'Skip captcha on paper URLs. Note: Google Scholar captcha still needs to be solved.',
  default: false,
})
