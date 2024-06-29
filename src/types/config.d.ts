import '@oclif/core'

declare module '@oclif/core' {
  interface Config {
    customData?: Record<string, any>
  }
}
