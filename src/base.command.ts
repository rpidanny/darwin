import { Command, Flags, Interfaces } from '@oclif/core'
import { LogLevel, LogOutputFormat, Quill } from '@rpidanny/quill'
import { log2fs } from '@rpidanny/quill-hooks'
import { ensureFile } from 'fs-extra'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static enableJsonFlag = false

  // define flags that can be inherited by any command that extends BaseCommand
  static baseFlags = {
    'log-level': Flags.option({
      default: LogLevel.INFO,
      helpGroup: 'GLOBAL',
      options: Object.values(LogLevel),
      summary: 'Specify level for logging.',
    })(),
  }

  protected flags!: Flags<T>
  protected args!: Args<T>
  protected logger!: Quill

  public async init(): Promise<void> {
    await super.init()
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })

    this.flags = flags as Flags<T>
    this.args = args as Args<T>

    const logFile = `${this.config.dataDir}/logs/app.log`
    await ensureFile(logFile)

    this.logger = new Quill({
      logOutputFormat: LogOutputFormat.TEXT,
      level: this.flags['log-level'] as LogLevel,
      hooks: [log2fs(logFile)],
    })
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }

  protected async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }
}
