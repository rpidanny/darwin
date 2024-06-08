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

export default {
  printBanner,
}
