import 'reflect-metadata'

import { Command, Flags, Interfaces } from '@oclif/core'
import { LogLevel, LogOutputFormat, Quill } from '@rpidanny/quill'
import { log2fs } from '@rpidanny/quill-hooks'
import { readFile } from 'fs/promises'
import { ensureFile, pathExists } from 'fs-extra'
import moment from 'moment'
import path from 'path'
import prettyMilliseconds from 'pretty-ms'

import { CONFIG_FILE_NAME } from './config/constants.js'
import { ConfigSchema, TConfig } from './config/schema.js'
import { Metric } from './utils/analytics/metric.js'

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

  private logFilePath = `${this.config.dataDir}/logs/app.log`
  private configFilePath = path.join(this.config.configDir, CONFIG_FILE_NAME)

  protected flags!: Flags<T>
  protected args!: Args<T>
  protected logger!: Quill
  protected localConfig!: TConfig

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

    this.localConfig = await this.getLocalConfig()
    this.logger = await this.getLogger()
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling

    await this.emitErrorMetric(err)
    return super.catch(err)
  }

  protected async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }

  private async getLocalConfig(): Promise<TConfig> {
    let config = {}
    if (await pathExists(this.configFilePath)) {
      config = JSON.parse(await readFile(this.configFilePath, 'utf-8'))
    }

    return ConfigSchema.parse(config)
  }

  private async getLogger(): Promise<Quill> {
    await ensureFile(this.logFilePath)

    return new Quill({
      logOutputFormat: LogOutputFormat.TEXT,
      level: this.flags['log-level'] as LogLevel,
      hooks: [log2fs(this.logFilePath)],
    })
  }

  private async emitErrorMetric(err: Error): Promise<void> {
    const { customData } = this.config

    if (customData) {
      const { metadata, mixpanel, startTime } = customData
      const now = new Date()

      const endTime = performance.now()
      const durationMs = endTime - (startTime || 0)

      mixpanel.track(Metric.CommandError, {
        ...metadata,
        duration: prettyMilliseconds(durationMs),
        endTime: moment(now).format('YYYY-MM-DD HH:mm:ss'),
        error: err.message,
        stack: err.stack,
      })
    }
  }
}
