import { GoogleScholar } from '@rpidanny/google-scholar'
import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'
import { Container } from 'typedi'

import { PaperServiceConfig } from '../services/paper/paper.service.config.js'
import { getInitPageContent } from '../utils/ui/odysseus.js'

export function initDownloadContainer(
  opts: {
    headless: boolean
  },
  logger: Quill,
) {
  const { headless } = opts

  Container.set(
    Odysseus,
    new Odysseus({ headless, waitOnCaptcha: true, initHtml: getInitPageContent() }, logger),
  )
  Container.set(Quill, logger)
  Container.set(PaperServiceConfig, {
    skipCaptcha: true,
    legacyProcessing: false,
  })

  Container.set(GoogleScholar, new GoogleScholar(Container.get(Odysseus), logger))
}
