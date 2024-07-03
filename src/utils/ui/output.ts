import chalk from 'chalk'
import figlet from 'figlet'

function printBanner(version: string, log: (msg: string) => void): void {
  log(
    `${chalk.bold.hex('#0077be')(
      figlet.textSync(`Darwin`, {
        font: 'Standard',
      }),
    )} ${chalk.hex('#888888')(`${chalk.italic('beta')} v${version}`)}`,
  )
}

function printUpdateBanner(version: string, log: (msg: string) => void): void {
  log(
    `${chalk.hex('#cf402f')(
      `A new version (v${version}) of darwin is available. Please run ${chalk.bold(
        'npm install -g @rpidanny/darwin@latest',
      )} to update and enjoy the latest features!`,
    )}`,
  )
}

export default {
  printBanner,
  printUpdateBanner,
}
