import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface DebugLogEntry {
  timestamp: string
  service: 'gtin' | 'llm' | 'ocr'
  action: 'request' | 'response' | 'error'
  gtin?: string
  data: Record<string, unknown>
  traceId?: string
}

class DebugLogger {
  private logDir: string
  private logFile: string

  constructor() {
    this.logDir = join(process.cwd(), 'debug-logs')
    this.logFile = join(this.logDir, `external-requests-${new Date().toISOString().split('T')[0]}.jsonl`)
    
    // Create log directory if it doesn't exist
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true })
    }
  }

  log(entry: DebugLogEntry) {
    try {
      const logLine = JSON.stringify(entry) + '\n'
      appendFileSync(this.logFile, logLine, 'utf8')
    } catch (error) {
      console.error('Failed to write debug log:', error)
    }
  }

  logGtinRequest(gtin: string, url: string, headers: Record<string, string>, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'gtin',
      action: 'request',
      gtin,
      traceId,
      data: {
        url: url.replace(/user_key=[^&]+/, 'user_key=[REDACTED]'),
        headers: Object.fromEntries(
          Object.entries(headers).map(([key, value]) => [
            key, 
            key.toLowerCase().includes('key') || key.toLowerCase().includes('auth') ? '[REDACTED]' : value
          ])
        ),
      }
    })
  }

  logGtinResponse(gtin: string, response: Record<string, unknown>, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'gtin',
      action: 'response',
      gtin,
      traceId,
      data: response
    })
  }

  logGtinError(gtin: string, error: Record<string, unknown>, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'gtin',
      action: 'error',
      gtin,
      traceId,
      data: {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  }

  logLlmRequest(prompt: string, model: string, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'llm',
      action: 'request',
      traceId,
      data: {
        model,
        prompt,
        promptLength: prompt.length
      }
    })
  }

  logLlmResponse(response: Record<string, unknown>, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'llm',
      action: 'response',
      traceId,
      data: response
    })
  }

  logLlmError(error: Record<string, unknown>, traceId?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'llm',
      action: 'error',
      traceId,
      data: {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  }

  getLogFilePath(): string {
    return this.logFile
  }
}

export const debugLogger = new DebugLogger()
