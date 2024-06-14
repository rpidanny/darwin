export interface IStreamWriter {
  write(data: Record<string, any>): Promise<any>

  end(): Promise<void>
}
