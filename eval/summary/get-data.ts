import { GoogleScholar } from '@rpidanny/google-scholar/dist'
import { Odysseus } from '@rpidanny/odysseus'
import { LogLevel, LogOutputFormat, Quill } from '@rpidanny/quill'
import { writeFile } from 'fs/promises'

import { DownloadService } from '../../src/services/download/download.service'
import { IoService } from '../../src/services/io/io.service'
import { PaperService } from '../../src/services/paper/paper.service'
import { PdfService } from '../../src/services/pdf/pdf.service'

const logger = new Quill({ level: LogLevel.DEBUG, logOutputFormat: LogOutputFormat.TEXT })
const odysseus = new Odysseus({ headless: false }, logger)
await odysseus.init()

const scholar = new GoogleScholar(odysseus, logger)
const ioService = new IoService()
const downloadService = new DownloadService(ioService, logger)
const pdfService = new PdfService(downloadService, logger)

const paperService = new PaperService(
  {
    skipCaptcha: true,
    legacyProcessing: false,
  },
  odysseus,
  pdfService,
  downloadService,
  logger,
)

const keywords = [
  // 'flash attention',
  // 'crispr cas9',
  // 'genome editing',
  'cancer genomics',
  'rna sequencing',
  'microbiome gut bacteria breast milk',
]
const maxPapers = 2

for (const keyword of keywords) {
  let count = 0
  logger.info(`Getting papers for keyword: ${keyword}`)

  await scholar.iteratePapers(
    { keywords: keyword },
    async (paper): Promise<boolean> => {
      const content = await paperService.getTextContent(paper)
      await writeFile(
        `./eval/summary/data/papers/${paper.title.replace(/[^\w-]/g, '-')}.txt`,
        content,
      )
      return ++count < maxPapers
    },
    maxPapers,
  )
}

await odysseus.close()
