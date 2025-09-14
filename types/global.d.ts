declare module 'pdf-parse' {
  interface PDFData {
    numpages: number
    numrender: number
    info: any
    metadata: any
    version: string
    text: string
  }
  
  function pdf(buffer: Buffer): Promise<PDFData>
  export = pdf
}

declare module 'mammoth' {
  interface ConvertToHtmlResult {
    value: string
    messages: any[]
  }
  
  export function convertToHtml(options: any): Promise<ConvertToHtmlResult>
  export function convertToHtml(buffer: Buffer, options?: any): Promise<ConvertToHtmlResult>
}

declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    ffprobe(callback: (err: any, metadata: any) => void): void
    ffprobe(input: string, callback: (err: any, metadata: any) => void): void
  }
  
  function ffmpeg(input?: string): FfmpegCommand
  export = ffmpeg
}
