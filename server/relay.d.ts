import type { Server as HttpServer } from 'node:http'
import type { WebSocketServer } from 'ws'

export interface AttachVoiceRelayOptions {
  path?: string
  geminiApiKey?: string
  voiceName?: string
}

export function attachVoiceRelay(
  httpServer: HttpServer,
  options?: AttachVoiceRelayOptions
): WebSocketServer
