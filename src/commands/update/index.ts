import { spawn } from 'child_process'

import { BaseCommand } from '../../base.command.js'

export default class Update extends BaseCommand<typeof Update> {
  static override description = 'Update Darwin to the latest version.'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    this.logger.info('Updating Darwin...')

    const shell = spawn('npm install -g @rpidanny/darwin@latest', {
      stdio: 'inherit',
      shell: true,
    })

    shell.on('close', (code: number | null) => {
      if (code !== null && code !== 0) {
        this.exit(code)
      }
    })
  }
}
