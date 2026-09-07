/**
 * WeatherGPT Real-Time Voice AI Client
 * Dual-Mode Architecture:
 * 1. Gemini Live WebSocket Relay (high-performance 24kHz bi-directional PCM streaming)
 * 2. Browser Web Voice AI Fallback (Web Speech API + WeatherGPT Conversational Engine + SpeechSynthesis)
 * Seamlessly transitions to Browser Voice Mode when deployed on static CDNs (e.g. Firebase Hosting).
 */

import { generateWeatherResponse } from './aiService'
import { triggerMapNavigationFromText } from './mapEvents'
import { executeVoiceTool, fetchLiveWeather, VOICE_SYSTEM_INSTRUCTION, VOICE_TOOLS_CONFIG } from './voiceTools'

export type VoiceConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
export type VoiceAgentState = 'idle' | 'listening' | 'thinking' | 'speaking'
export type VoiceMode = 'relay' | 'browser'

export interface ToolCallEvent {
  name: string
  args: Record<string, unknown>
  result?: unknown
  status: 'executing' | 'completed'
}

export interface VoiceRelayCallbacks {
  onConnectionChange: (state: VoiceConnectionState, error?: string) => void
  onAgentStateChange: (state: VoiceAgentState) => void
  onUserTranscript: (text: string, isFinal: boolean) => void
  onAssistantTranscript: (text: string) => void
  onAssistantTurnComplete: () => void
  onToolCall: (event: ToolCallEvent) => void
  onAudioLevel: (userLevel: number, assistantLevel: number) => void
  onModeChange?: (mode: VoiceMode, reason?: string) => void
}

export class VoiceRelayClient {
  private ws: WebSocket | null = null
  private recordAudioContext: AudioContext | null = null
  private playbackAudioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private processorNode: ScriptProcessorNode | null = null
  private micAnalyser: AnalyserNode | null = null
  private playbackAnalyser: AnalyserNode | null = null
  private speechRecognition: any = null

  private activeAudioSources: AudioBufferSourceNode[] = []
  private nextPlaybackStartTime = 0
  private isMuted = false
  private isSessionActive = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 2
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private callbacks: VoiceRelayCallbacks
  private currentAgentState: VoiceAgentState = 'idle'
  private selectedLanguage = 'en-IN'

  // Mode management: 'relay' (Gemini Live WebSocket) or 'browser' (Client-side Web Speech AI)
  private currentMode: VoiceMode = 'relay'
  private isDirectGeminiMode = false
  private conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  private browserSpeechSilenceTimer: ReturnType<typeof setTimeout> | null = null
  private browserLastTranscript = ''
  private assistantAudioPulseTimer: ReturnType<typeof setInterval> | null = null
  private hasGreeted = false

  public resetGreeting(): void {
    this.hasGreeted = false
  }

  constructor(callbacks: VoiceRelayCallbacks) {
    this.callbacks = callbacks

    // Guard against orphaned voice sessions on tab navigation or backgrounding
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.endVoiceSession())
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.isSessionActive) {
          console.log('[VoiceRelayClient] App backgrounded. Terminating voice session.')
          this.endVoiceSession()
        }
      })
    }
  }

  public getMode(): VoiceMode {
    return this.currentMode
  }

  public setLanguage(langCode: string) {
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      or: 'or-IN',
      pa: 'pa-IN',
      as: 'as-IN'
    }
    this.selectedLanguage = langMap[langCode] || 'en-IN'
    if (this.speechRecognition) {
      try {
        this.speechRecognition.lang = this.selectedLanguage
      } catch {
        // ignore dynamic lang switch error
      }
    }
  }

  /**
   * Start live voice session.
   * Auto-detects environment: connects directly to Gemini Live WebSocket on deployed site
   * or via local relay in dev server, with graceful Browser Voice Mode fallback.
   */
  public async startSession(): Promise<void> {
    if (this.isSessionActive) return
    this.isSessionActive = true
    this.hasGreeted = false
    this.reconnectAttempts = 0
    this.callbacks.onConnectionChange('connecting')

    // Unlock browser audio & speech synthesis on user interaction (prevents browser autoplay block)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const silent = new SpeechSynthesisUtterance('')
        silent.volume = 0
        window.speechSynthesis.speak(silent)
      } catch {}
    }

    // Check user preference
    const preferredMode = typeof window !== 'undefined'
      ? localStorage.getItem('weathergpt_voice_preferred_mode')
      : null

    if (preferredMode === 'browser') {
      await this.startBrowserMode('User preferred Browser Voice Mode')
      return
    }

    try {
      // 1. Initialize Microphone Capture
      await this.initMicrophone()

      // 2. Initialize Playback Engine
      this.initPlayback()

      // 3. Connect to WebSocket Relay or fallback
      this.connectWebSocket()

      // 4. Initialize Local Interim Speech Recognition
      this.initSpeechRecognition()
    } catch (err: any) {
      console.error('[VoiceRelayClient] Session startup error:', err)
      const errorMsg = err?.message || 'Microphone access denied or audio failed.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        await this.startBrowserMode('Microphone permission pending')
        return
      }
      this.endVoiceSession(true)
      this.callbacks.onConnectionChange('error', errorMsg)
    }
  }

  /**
   * Switch dynamically to client-side Browser Web Voice mode
   */
  public async switchToBrowserMode(reason = 'Switched to Browser Voice AI'): Promise<void> {
    console.log(`[VoiceRelayClient] Transitioning to Browser Voice Mode: ${reason}`)
    this.currentMode = 'browser'
    this.callbacks.onModeChange?.('browser', reason)

    // Close WebSocket if open
    if (this.ws) {
      try {
        this.ws.onopen = null
        this.ws.onmessage = null
        this.ws.onerror = null
        this.ws.onclose = null
        this.ws.close()
      } catch {}
      this.ws = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    await this.startBrowserMode(reason)
  }

  /**
   * Single shared unconditional teardown function.
   * Closes WebSocket, stops all mic tracks, terminates audio pipelines,
   * cancels speech synthesis, and resets UI state.
   */
  public endVoiceSession(skipDisconnectedState = false): void {
    console.log('[VoiceRelayClient] Hard session termination initiated.')
    this.isSessionActive = false
    this.hasGreeted = false
    this.reconnectAttempts = 0

    // 1. Cancel pending timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.browserSpeechSilenceTimer) {
      clearTimeout(this.browserSpeechSilenceTimer)
      this.browserSpeechSilenceTimer = null
    }
    if (this.assistantAudioPulseTimer) {
      clearInterval(this.assistantAudioPulseTimer)
      this.assistantAudioPulseTimer = null
    }

    // 2. Stop Browser Speech Synthesis if speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }

    // 3. Send explicit end_session message and close WebSocket
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'end_session' }))
        }
      } catch {}
      try {
        this.ws.onopen = null
        this.ws.onmessage = null
        this.ws.onerror = null
        this.ws.onclose = null
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Session ended by user')
        }
      } catch (err) {
        console.warn('[VoiceRelayClient] Error closing WebSocket:', err)
      }
      this.ws = null
    }

    // 4. Stop microphone stream at hardware/browser level
    if (this.mediaStream) {
      try {
        const tracks = this.mediaStream.getTracks()
        for (const track of tracks) {
          try {
            track.enabled = false
            track.stop()
          } catch {}
        }
      } catch (err) {
        console.warn('[VoiceRelayClient] Error stopping media tracks:', err)
      }
      this.mediaStream = null
    }

    // 5. Disconnect ScriptProcessor node & close record AudioContext
    if (this.processorNode) {
      try {
        this.processorNode.onaudioprocess = null
        this.processorNode.disconnect()
      } catch {}
      this.processorNode = null
    }

    if (this.micAnalyser) {
      try {
        this.micAnalyser.disconnect()
      } catch {}
      this.micAnalyser = null
    }

    if (this.recordAudioContext) {
      try {
        if (this.recordAudioContext.state !== 'closed') {
          this.recordAudioContext.close()
        }
      } catch {}
      this.recordAudioContext = null
    }

    // 6. Stop audio playback pipeline
    this.stopPlayback()

    if (this.playbackAnalyser) {
      try {
        this.playbackAnalyser.disconnect()
      } catch {}
      this.playbackAnalyser = null
    }

    if (this.playbackAudioContext) {
      try {
        if (this.playbackAudioContext.state !== 'closed') {
          this.playbackAudioContext.close()
        }
      } catch {}
      this.playbackAudioContext = null
    }

    // 7. Stop speech recognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.onresult = null
        this.speechRecognition.onerror = null
        this.speechRecognition.onend = null
        this.speechRecognition.stop()
        this.speechRecognition.abort?.()
      } catch {}
      this.speechRecognition = null
    }

    // 8. Update UI state immediately
    this.callbacks.onAudioLevel(0, 0)
    this.setAgentState('idle')
    if (!skipDisconnectedState) {
      this.callbacks.onConnectionChange('disconnected')
    }
    console.log('[VoiceRelayClient] Voice session fully terminated and all resources released.')
  }

  public stopSession(): void {
    this.endVoiceSession()
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })
    }
  }

  public interrupt(): void {
    if (this.currentMode === 'browser') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch {}
      }
      if (this.assistantAudioPulseTimer) {
        clearInterval(this.assistantAudioPulseTimer)
        this.assistantAudioPulseTimer = null
      }
      this.callbacks.onAudioLevel(0, 0)
      this.setAgentState('listening')
      return
    }

    this.stopPlayback()
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }))
    }
    this.setAgentState('listening')
  }

  public sendText(text: string): void {
    if (!text.trim()) return

    if (this.currentMode === 'browser') {
      this.processBrowserVoiceQuery(text.trim())
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (this.isDirectGeminiMode) {
        this.ws.send(JSON.stringify({
          clientContent: {
            turns: [
              {
                role: 'user',
                parts: [{ text: text.trim() }]
              }
            ],
            turnComplete: true
          }
        }))
      } else {
        this.ws.send(JSON.stringify({ type: 'text', text: text.trim() }))
      }
      this.setAgentState('thinking')
    } else {
      console.warn('[VoiceRelayClient] WebSocket not open when sending text. Routing to Browser Voice AI.')
      this.processBrowserVoiceQuery(text.trim())
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Private Audio & WebSocket Subsystems
  // -----------------------------------------------------------------------------------------------

  private async initMicrophone(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is unavailable. Please use HTTPS or localhost in a supported browser.')
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access in your browser settings.')
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No microphone device detected. Please connect a microphone and try again.')
      }
      throw new Error(`Microphone access error: ${err.message || err.name}`)
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    this.recordAudioContext = new AudioContextClass()
    if (this.recordAudioContext.state === 'suspended') {
      await this.recordAudioContext.resume().catch(() => {})
    }

    const source = this.recordAudioContext.createMediaStreamSource(this.mediaStream)
    this.micAnalyser = this.recordAudioContext.createAnalyser()
    this.micAnalyser.fftSize = 256
    source.connect(this.micAnalyser)

    // ScriptProcessor for continuous PCM extraction and downsampling to 16kHz (reduced 2048 buffer for ~42ms low latency)
    const bufferSize = 2048
    this.processorNode = this.recordAudioContext.createScriptProcessor(bufferSize, 1, 1)

    // Acoustic echo suppression & barge-in threshold
    const BARGE_IN_THRESHOLD_RMS = 0.04

    this.processorNode.onaudioprocess = (event) => {
      if (!this.isSessionActive || this.isMuted) return

      const inputBuffer = event.inputBuffer.getChannelData(0)
      const inputSampleRate = this.recordAudioContext?.sampleRate || 48000

      // Downsample input float samples to 16,000Hz
      const downsampled = this.downsampleTo16kHz(inputBuffer, inputSampleRate)
      if (!downsampled || downsampled.length === 0) return

      // Measure RMS volume
      let sumSquares = 0
      for (let i = 0; i < downsampled.length; i++) {
        sumSquares += downsampled[i] * downsampled[i]
      }
      const rms = Math.sqrt(sumSquares / downsampled.length)
      const level = Math.min(rms * 5.0, 1.0)
      this.callbacks.onAudioLevel(level, 0)

      // Handle Assistant Speaking: barge-in or suppression
      if (this.currentAgentState === 'speaking') {
        if (rms > BARGE_IN_THRESHOLD_RMS) {
          // Clear user speech detected while assistant is speaking: interrupt!
          console.log('[VoiceRelayClient] Barge-in speech detected during playback. Interrupting.')
          this.interrupt()
        } else {
          // Suppress mic echo/acoustic loopback while assistant speaks
          return
        }
      }

      // Send continuous PCM WebSocket packets in relay mode or direct Gemini mode
      if (this.currentMode === 'relay' && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pcm16 = new Int16Array(downsampled.length)
        for (let i = 0; i < downsampled.length; i++) {
          const s = Math.max(-1, Math.min(1, downsampled[i]))
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        const base64Audio = this.arrayBufferToBase64(pcm16.buffer)
        if (this.isDirectGeminiMode) {
          this.ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64Audio
                }
              ]
            }
          }))
        } else {
          this.ws.send(JSON.stringify({ type: 'audio', data: base64Audio }))
        }
      }
    }

    source.connect(this.processorNode)
    this.processorNode.connect(this.recordAudioContext.destination)
  }

  private initPlayback(): void {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    try {
      this.playbackAudioContext = new AudioContextClass({ sampleRate: 24000 })
    } catch {
      this.playbackAudioContext = new AudioContextClass()
    }
    this.playbackAnalyser = this.playbackAudioContext.createAnalyser()
    this.playbackAnalyser.fftSize = 256
    this.playbackAnalyser.connect(this.playbackAudioContext.destination)
    this.nextPlaybackStartTime = 0

    if (this.playbackAudioContext.state === 'suspended') {
      this.playbackAudioContext.resume().catch(() => {})
    }
  }

  /**
   * Resolves the target WebSocket URL.
   * Priority:
   * 1. localStorage 'weathergpt_voice_relay_url' (custom override)
   * 2. VITE_VOICE_RELAY_URL (environment relay)
   * 3. Localhost dev server relay: '/voice-relay'
   * 4. Deployed static site (e.g. Firebase Hosting): Direct Gemini Live WebSocket
   */
  private getTargetWsUrl(): { url: string; isCustom: boolean; isDirectGemini: boolean } {
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('weathergpt_voice_relay_url') : null
    if (customUrl && customUrl.trim()) {
      return { url: customUrl.trim(), isCustom: true, isDirectGemini: false }
    }

    const envRelay = (import.meta as any).env?.VITE_VOICE_RELAY_URL
    if (envRelay && envRelay.trim()) {
      return { url: envRelay.trim(), isCustom: true, isDirectGemini: false }
    }

    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    if (isLocalhost) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      return { url: `${protocol}//${host}/voice-relay`, isCustom: false, isDirectGemini: false }
    }

    // Remote static deployment (e.g. Firebase Hosting): connect directly to Gemini Live API
    const geminiKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '').trim()
    if (geminiKey) {
      const directUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(geminiKey)}`
      return { url: directUrl, isCustom: false, isDirectGemini: true }
    }

    return { url: '', isCustom: false, isDirectGemini: false }
  }

  private connectWebSocket(): void {
    if (!this.isSessionActive) return

    const { url: wsUrl, isDirectGemini } = this.getTargetWsUrl()
    this.isDirectGeminiMode = isDirectGemini
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    // If no valid WebSocket URL found, immediately fallback to Browser Voice
    if (!wsUrl) {
      console.log('[VoiceRelayClient] No WebSocket target configured. Engaging Browser Voice AI Mode.')
      this.switchToBrowserMode('Active on static deployment')
      return
    }

    console.log(`[VoiceRelayClient] Connecting to WebSocket: ${this.isDirectGeminiMode ? 'Gemini Live (Direct)' : wsUrl}`)

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null
      try { this.ws.close() } catch {}
      this.ws = null
    }

    let connectionTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        console.warn('[VoiceRelayClient] Connection timeout. Falling back to Browser Voice AI.')
        try { this.ws.close() } catch {}
        this.switchToBrowserMode('Relay connection timed out')
      }
    }, 5000)

    try {
      const ws = new WebSocket(wsUrl)
      this.ws = ws

      ws.onopen = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          connectionTimeout = null
        }
        if (this.ws !== ws) return
        console.log(`[VoiceRelayClient] WebSocket connected. Mode: ${this.isDirectGeminiMode ? 'Direct Gemini Live' : 'Relay'}`)
        this.currentMode = 'relay'
        this.callbacks.onModeChange?.('relay')
        this.reconnectAttempts = 0

        if (this.isDirectGeminiMode) {
          // Send setup handshake directly to Gemini Live API
          const setupMessage = {
            setup: {
              model: 'models/gemini-2.5-flash-native-audio-latest',
              generationConfig: {
                responseModalities: ['AUDIO'],
                temperature: 0.4,
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: 'Kore'
                    }
                  }
                }
              },
              systemInstruction: {
                parts: [{ text: VOICE_SYSTEM_INSTRUCTION }]
              },
              tools: VOICE_TOOLS_CONFIG
            }
          }
          ws.send(JSON.stringify(setupMessage))
        } else {
          this.callbacks.onConnectionChange('connected')
        }
      }

      ws.onmessage = (event) => {
        if (this.ws !== ws) return
        this.handleServerMessage(event.data)
      }

      ws.onerror = (err) => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          connectionTimeout = null
        }
        if (this.ws !== ws) return
        console.warn('[VoiceRelayClient] WebSocket error:', err)

        // If on localhost and first attempt failed, try ws://localhost:3001
        if (isLocalhost && this.reconnectAttempts === 0 && !wsUrl.includes(':3001') && !this.isDirectGeminiMode) {
          console.log('[VoiceRelayClient] Attempting direct fallback to ws://localhost:3001...')
          ws.onopen = null
          ws.onmessage = null
          ws.onerror = null
          ws.onclose = null
          try { ws.close() } catch {}

          const fallbackWs = new WebSocket('ws://localhost:3001')
          this.ws = fallbackWs
          fallbackWs.onopen = () => {
            if (this.ws !== fallbackWs) return
            this.currentMode = 'relay'
            this.callbacks.onModeChange?.('relay')
            this.reconnectAttempts = 0
            this.callbacks.onConnectionChange('connected')
          }
          fallbackWs.onmessage = (ev) => {
            if (this.ws !== fallbackWs) return
            this.handleServerMessage(ev.data)
          }
          fallbackWs.onerror = () => {
            if (this.ws !== fallbackWs) return
            // If local relay unreachable, try direct Gemini Live if API key is present
            const geminiKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '').trim()
            if (geminiKey) {
              console.log('[VoiceRelayClient] Local relay down. Connecting directly to Gemini Live API...')
              this.connectDirectGemini(geminiKey)
              return
            }
            this.switchToBrowserMode('Local relay unreachable')
          }
          fallbackWs.onclose = () => {
            if (this.ws !== fallbackWs) return
            this.handleDisconnect()
          }
          return
        }

        // On remote deployed site or after retries, switch automatically to Browser Voice Mode
        this.switchToBrowserMode('WebSocket connection unavailable')
      }

      ws.onclose = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          connectionTimeout = null
        }
        if (this.ws !== ws) return
        this.handleDisconnect()
      }
    } catch (err) {
      console.warn('[VoiceRelayClient] Failed to instantiate WebSocket. Switching to Browser Voice.', err)
      this.switchToBrowserMode('Could not create WebSocket')
    }
  }

  private connectDirectGemini(geminiKey: string): void {
    const directUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(geminiKey)}`
    this.isDirectGeminiMode = true
    try {
      const ws = new WebSocket(directUrl)
      this.ws = ws
      ws.onopen = () => {
        if (this.ws !== ws) return
        console.log('[VoiceRelayClient] Connected directly to Gemini Live API!')
        this.currentMode = 'relay'
        this.callbacks.onModeChange?.('relay')
        this.reconnectAttempts = 0
        const setupMessage = {
          setup: {
            model: 'models/gemini-2.5-flash-native-audio-latest',
            generationConfig: {
              responseModalities: ['AUDIO'],
              temperature: 0.4,
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Kore'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: VOICE_SYSTEM_INSTRUCTION }]
            },
            tools: VOICE_TOOLS_CONFIG
          }
        }
        ws.send(JSON.stringify(setupMessage))
      }
      ws.onmessage = (ev) => {
        if (this.ws !== ws) return
        this.handleServerMessage(ev.data)
      }
      ws.onerror = () => {
        if (this.ws !== ws) return
        this.switchToBrowserMode('WeatherGPT Live connection error')
      }
      ws.onclose = () => {
        if (this.ws !== ws) return
        this.handleDisconnect()
      }
    } catch {
      this.switchToBrowserMode('Could not initiate WeatherGPT Live')
    }
  }

  private handleDisconnect(): void {
    if (!this.isSessionActive) return

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 3000)
      console.log(`[VoiceRelayClient] Disconnected. Reconnecting in ${delay}ms...`)
      this.callbacks.onConnectionChange('reconnecting')
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        if (this.isSessionActive) {
          this.connectWebSocket()
        }
      }, delay)
    } else {
      console.log('[VoiceRelayClient] Reconnect limit reached. Migrating to Browser Voice AI.')
      this.switchToBrowserMode('Relay connection lost. Running on Browser Voice AI.')
    }
  }

  private async handleServerMessage(rawData: any): Promise<void> {
    try {
      const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData

      // DIRECT GEMINI LIVE PROTOCOL
      if (this.isDirectGeminiMode) {
        // 1. Setup Acknowledgement
        if (msg.setupComplete) {
          console.log('[VoiceRelayClient] Direct Gemini Live setup complete! Ready.')
          this.callbacks.onConnectionChange('connected')
          this.setAgentState('listening')
          if (!this.hasGreeted) {
            this.sendInitialGreeting()
          }
          return
        }

        // 2. Tool Calls from Gemini
        if (msg.toolCall?.functionCalls?.length > 0) {
          this.setAgentState('thinking')
          for (const call of msg.toolCall.functionCalls) {
            console.log(`[VoiceRelayClient:Direct] Tool requested: ${call.name}`, call.args)

            triggerMapNavigationFromText(call.args?.location || call.args?.region_or_state || '')

            this.callbacks.onToolCall({
              name: call.name,
              args: call.args || {},
              status: 'executing'
            })

            const toolResult = await executeVoiceTool(call.name, call.args || {})

            this.callbacks.onToolCall({
              name: call.name,
              args: call.args || {},
              result: toolResult,
              status: 'completed'
            })

            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              const toolResponse = {
                toolResponse: {
                  functionResponses: [
                    {
                      id: call.id,
                      name: call.name,
                      response: {
                        result: toolResult
                      }
                    }
                  ]
                }
              }
              this.ws.send(JSON.stringify(toolResponse))
            }
          }
          return
        }

        // 3. Server Generated Content (Audio & Transcript)
        if (msg.serverContent) {
          const sc = msg.serverContent

          if (sc.interrupted) {
            console.log('[VoiceRelayClient:Direct] Model interrupted by user speech.')
            this.stopPlayback()
            this.setAgentState('listening')
            return
          }

          if (sc.modelTurn?.parts?.length > 0) {
            for (const part of sc.modelTurn.parts) {
              if (part.inlineData?.data) {
                this.setAgentState('speaking')
                this.queueAudioChunk(part.inlineData.data)
              }
              if (part.text && !part.thought) {
                const cleanText = part.text.replace(/^\*\*.*?\*\*\s*/g, '').trim()
                if (cleanText) {
                  this.callbacks.onAssistantTranscript(cleanText)
                }
              }
            }
          }

          if (sc.turnComplete) {
            this.callbacks.onAssistantTurnComplete()
            setTimeout(() => {
              if (this.currentAgentState === 'speaking') {
                this.setAgentState('listening')
              }
            }, 400)
          }
          return
        }

        return
      }

      // RELAY SERVER PROTOCOL (from server/relay.mjs)
      if (msg.type === 'error') {
        console.error('[VoiceRelayClient] Server error:', msg.message)
        if ((msg.message || '').includes('GEMINI_API_KEY')) {
          this.switchToBrowserMode('Relay voice service unconfigured')
          return
        }
        this.callbacks.onConnectionChange('error', msg.message || 'Voice session error')
        return
      }

      if (msg.type === 'warning') {
        console.warn('[VoiceRelayClient] Server warning:', msg.message)
        return
      }

      if (msg.type === 'ready') {
        console.log('[VoiceRelayClient] Relay confirmed session ready.')
        this.setAgentState('listening')
        if (!this.hasGreeted) {
          this.sendInitialGreeting()
        }
        return
      }

      if (msg.type === 'audio' && msg.data) {
        this.setAgentState('speaking')
        this.queueAudioChunk(msg.data)
        return
      }

      if (msg.type === 'transcript' && msg.text) {
        this.callbacks.onAssistantTranscript(msg.text)
        return
      }

      if (msg.type === 'interrupted') {
        console.log('[VoiceRelayClient] Received interrupted signal.')
        this.stopPlayback()
        this.setAgentState('listening')
        return
      }

      if (msg.type === 'tool_call') {
        this.setAgentState('thinking')
        this.callbacks.onToolCall({
          name: msg.name,
          args: msg.args,
          result: msg.result,
          status: msg.status
        })
        return
      }

      if (msg.type === 'turn_complete') {
        this.callbacks.onAssistantTurnComplete()
        setTimeout(() => {
          if (this.currentAgentState === 'speaking') {
            this.setAgentState('listening')
          }
        }, 400)
        return
      }
    } catch (err) {
      console.error('[VoiceRelayClient] Error handling message:', err)
    }
  }

  private queueAudioChunk(base64Data: string): void {
    if (!this.playbackAudioContext || this.playbackAudioContext.state === 'closed') return

    if (this.playbackAudioContext.state === 'suspended') {
      this.playbackAudioContext.resume()
    }

    try {
      const pcmBytes = this.base64ToArrayBuffer(base64Data)
      const int16Array = new Int16Array(pcmBytes)
      const float32Array = new Float32Array(int16Array.length)

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0
      }

      const audioBuffer = this.playbackAudioContext.createBuffer(1, float32Array.length, 24000)
      audioBuffer.getChannelData(0).set(float32Array)

      const sourceNode = this.playbackAudioContext.createBufferSource()
      sourceNode.buffer = audioBuffer

      if (this.playbackAnalyser) {
        sourceNode.connect(this.playbackAnalyser)
      } else {
        sourceNode.connect(this.playbackAudioContext.destination)
      }

      const now = this.playbackAudioContext.currentTime
      if (this.nextPlaybackStartTime < now) {
        this.nextPlaybackStartTime = now + 0.005
      }

      sourceNode.start(this.nextPlaybackStartTime)
      this.nextPlaybackStartTime += audioBuffer.duration

      this.activeAudioSources.push(sourceNode)
      sourceNode.onended = () => {
        const idx = this.activeAudioSources.indexOf(sourceNode)
        if (idx !== -1) this.activeAudioSources.splice(idx, 1)
      }
    } catch (err) {
      console.error('[VoiceRelayClient] Audio decode/playback error:', err)
    }
  }

  private stopPlayback(): void {
    for (const src of this.activeAudioSources) {
      try {
        src.stop()
      } catch {}
    }
    this.activeAudioSources = []
    this.nextPlaybackStartTime = 0
  }

  private setAgentState(state: VoiceAgentState): void {
    if (this.currentAgentState !== state) {
      this.currentAgentState = state
      this.callbacks.onAgentStateChange(state)
    }
  }

  private sendInitialGreeting(): void {
    if (this.hasGreeted) return
    this.hasGreeted = true

    const greetingPrompt = 'Please greet the user warmly in Hindi: say "नमस्ते! मैं वेदरजीपीटी सहायक हूँ। बताइए, आज आप किस शहर के मौसम के बारे में जानना चाहते हैं?" and ask how you can help. Keep it strictly to this one short sentence.'

    if (this.isDirectGeminiMode && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        clientContent: {
          turns: [
            {
              role: 'user',
              parts: [{ text: greetingPrompt }]
            }
          ],
          turnComplete: true
        }
      }))
      this.setAgentState('thinking')
    } else if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text: greetingPrompt
      }))
      this.setAgentState('thinking')
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Browser Web Voice Mode Engine (Zero-Backend Fallback)
  // -----------------------------------------------------------------------------------------------

  private async startBrowserMode(_reason: string): Promise<void> {
    this.currentMode = 'browser'
    this.callbacks.onModeChange?.('browser', _reason)
    this.callbacks.onConnectionChange('connected')
    this.setAgentState('listening')

    // Ensure mic is running for visualizer
    if (!this.mediaStream) {
      try {
        await this.initMicrophone()
      } catch (err) {
        console.warn('[VoiceRelayClient] Mic init error in browser mode:', err)
      }
    }

    this.initSpeechRecognition()

    // Automatic 1-time localized greeting in Browser Voice Mode
    if (!this.hasGreeted) {
      this.hasGreeted = true
      const langPrefix = (this.selectedLanguage || 'en').split('-')[0]
      const greetings: Record<string, string> = {
        en: 'Hello! I am WeatherGPT assistant. Which city or region would you like to inspect today?',
        hi: 'नमस्ते! मैं वेदरजीपीटी सहायक हूँ। बताइए, आज आप किस शहर के मौसम के बारे में जानना चाहते हैं?',
        mr: 'नमस्कार! मी वेदरजीपीटी सहाय्यक आहे. सांगा, आज आपल्याला कोणत्या शहराच्या हवामानाबद्दल जाणून घ्यायचे आहे?',
        bn: 'নমস্কার! আমি ওয়েদারজিপিটি সহকারী। বলুন, আজ আপনি কোন শহরের আবহাওয়া সম্পর্কে জানতে চান?',
        gu: 'નમસ્તે! હું વેધરજીપીટી સહાયક છું. જણાવો, આજે તમે કયા શહેરના હવામાન વિશે જાણવા માગો છો?',
        ta: 'வணக்கம்! நான் வெதர்கிபிடி உதவியாளர். இன்று எந்த ஊரின் வானிலை பற்றி அறிய விரும்புகிறீர்கள்?',
        te: 'నమస్కారం! నేను వెదర్‌జిపిటి అసిస్టెంట్‌ని. ఈరోజు మీరు ఏ నగరం వాతావరణం గురించి తెలుసుకోవాలనుకుంటున్నారు?',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ವೆದರ್‌ಜಿಪಿಟಿ ಸಹಾಯಕ. ಇಂದು ನೀವು ಯಾವ ನಗರದ ಹವಾಮಾನ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
        ml: 'നമസ്കാരം! ഞാൻ വെതർജിപിടി അസിസ്റ്റന്റാണ്. ഇന്ന് ഏത് നഗരത്തിലെ കാലാവസ്ഥയാണ് അറിയേണ്ടത്?',
        or: 'ନମସ୍କାର! ମୁଁ ୱେଦରଜିପିଟି ସହାୟକ। କୁହନ୍ତୁ, ଆଜି ଆପଣ କେଉଁ ସହରର ପାଣିପାଗ ବିଷୟରେ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?',
        pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਵੈਦਰਜੀਪੀਟੀ ਸਹਾਇਕ ਹਾਂ। ਦੱਸੋ, ਅੱਜ ਤੁਸੀਂ ਕਿਸ ਸ਼ਹਿਰ ਦੇ ਮੌਸਮ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
        as: 'নমস্কাৰ! মই ৱেদাৰজিপিটি সহায়ক। কওক, আজি আপুনি কোনখন চহৰৰ বতৰ সম্পৰ্কে জানিব বিচাৰে?'
      }
      const greeting = greetings[langPrefix] || greetings.en
      setTimeout(() => {
        if (this.isSessionActive) {
          this.callbacks.onAssistantTranscript(greeting)
          this.speakBrowserText(greeting)
        }
      }, 400)
    }
  }

  private initSpeechRecognition(): void {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      console.info('[VoiceRelayClient] Web Speech API is not supported in this browser.')
      if (this.currentMode === 'browser') {
        this.callbacks.onConnectionChange('error', 'Browser Speech Recognition is not supported. Please use Chrome or Edge.')
      }
      return
    }

    try {
      if (this.speechRecognition) {
        try { this.speechRecognition.stop() } catch {}
      }

      this.speechRecognition = new SpeechRec()
      this.speechRecognition.continuous = true
      this.speechRecognition.interimResults = true
      this.speechRecognition.lang = this.selectedLanguage

      this.speechRecognition.onresult = (event: any) => {
        if (!this.isSessionActive || this.isMuted) return

        let interimText = ''
        let finalText = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalText += transcript
          } else {
            interimText += transcript
          }
        }

        const displayText = (finalText || interimText).trim()
        if (displayText) {
          this.callbacks.onUserTranscript(displayText, Boolean(finalText))
          this.browserLastTranscript = displayText

          // If user starts speaking while assistant is speaking, trigger interrupt
          if (this.currentAgentState === 'speaking') {
            this.interrupt()
          }

          // Trigger assistant turn after speech pause or boundary (works in both Relay & Browser mode)
          if (this.browserSpeechSilenceTimer) {
            clearTimeout(this.browserSpeechSilenceTimer)
          }
          // Fast 300ms turn-taking for final speech recognition, 700ms for interim
          const pauseTime = finalText ? 300 : 700
          this.browserSpeechSilenceTimer = setTimeout(() => {
            this.browserSpeechSilenceTimer = null
            if (this.browserLastTranscript && this.currentAgentState !== 'thinking' && this.currentAgentState !== 'speaking') {
              const query = this.browserLastTranscript
              this.browserLastTranscript = ''
              console.log(`[VoiceRelayClient] Dispatching recognized voice query: "${query}" (Mode: ${this.currentMode})`)
              if (this.currentMode === 'relay') {
                this.sendText(query)
              } else {
                this.processBrowserVoiceQuery(query)
              }
            }
          }, pauseTime)
        }
      }

      this.speechRecognition.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('[VoiceRelayClient] Speech recognition error:', err.error)
        }
      }

      this.speechRecognition.onend = () => {
        // Auto-restart if still active
        if (this.isSessionActive && !this.isMuted) {
          try {
            this.speechRecognition?.start()
          } catch {}
        }
      }

      this.speechRecognition.start()
    } catch (err) {
      console.warn('[VoiceRelayClient] Could not start speech recognition:', err)
    }
  }

  /**
   * Processes a voice turn entirely in the client using WeatherGPT AI engine
   */
  private async processBrowserVoiceQuery(userQuery: string): Promise<void> {
    if (!userQuery.trim()) return

    console.log('[VoiceRelayClient:BrowserMode] Processing query:', userQuery)
    this.setAgentState('thinking')

    // Trigger map camera synchronization
    triggerMapNavigationFromText(userQuery)

    // Notify tool HUD badge
    this.callbacks.onToolCall({
      name: 'get_live_weather',
      args: { location: userQuery },
      status: 'executing'
    })

    const langCode = this.selectedLanguage.split('-')[0] || 'en'

    try {
      // 1. Fetch live telemetry from Open-Meteo / cache instantly (< 50-150ms)
      const telemetry = await fetchLiveWeather(userQuery)

      this.callbacks.onToolCall({
        name: 'get_live_weather',
        args: { location: userQuery },
        result: telemetry || { status: 'Telemetry analyzed' },
        status: 'completed'
      })

      // 2. Prepare concise prompt with live telemetry ground truth
      const telemetryContext = telemetry
        ? `[Live Observation: ${telemetry.location}: ${telemetry.temperature}°C, ${telemetry.condition}, Wind ${telemetry.windSpeedKmH}km/h, Rain ${telemetry.precipitationMm}mm, Risk ${telemetry.riskLevel}]`
        : ''

      const enrichedPrompt = telemetryContext
        ? `${userQuery} ${telemetryContext}`
        : userQuery

      // 3. Ultra-fast voice generation with 1.8s timeout fallback
      let responseText = ''
      try {
        const aiPromise = generateWeatherResponse(
          enrichedPrompt,
          this.conversationHistory,
          langCode,
          { isVoice: true, maxTokens: 80 }
        )
        const timeoutPromise = new Promise<{ text: string }>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 7000)
        )
        const aiResult = await Promise.race([aiPromise, timeoutPromise])
        responseText = aiResult.text
      } catch {
        // Fast instant synthesis if remote AI model is slow or offline
        if (telemetry) {
          if (langCode === 'hi') {
            responseText = `${telemetry.location} में तापमान ${telemetry.temperature} डिग्री सेल्सियस है और मौसम ${telemetry.condition} है। वर्षा का जोखिम ${telemetry.riskLevel === 'low' ? 'कम' : telemetry.riskLevel} है।`
          } else {
            responseText = `${telemetry.location} is ${telemetry.temperature} degrees Celsius with ${telemetry.condition}. Wind speed is ${telemetry.windSpeedKmH} kilometers per hour, and weather risk is ${telemetry.riskLevel}.`
          }
        } else {
          responseText = langCode === 'hi'
            ? 'मौसम की ताज़ा जानकारी के लिए कृपया स्थान का नाम बताएं।'
            : 'Live meteorological telemetry is active. Please state the location you wish to inspect.'
        }
      }

      // Update history
      this.conversationHistory.push({ role: 'user', content: userQuery })
      this.conversationHistory.push({ role: 'assistant', content: responseText })
      if (this.conversationHistory.length > 8) {
        this.conversationHistory = this.conversationHistory.slice(-8)
      }

      // Stream assistant transcript
      this.callbacks.onAssistantTranscript(responseText)

      // Speak response aloud
      this.speakBrowserText(responseText)
    } catch (err) {
      console.error('[VoiceRelayClient:BrowserMode] Query handling error:', err)
      const fallbackMsg = 'Live weather observation is stable. How else may I assist with meteorological alerts?'
      this.callbacks.onAssistantTranscript(fallbackMsg)
      this.speakBrowserText(fallbackMsg)
    }
  }

  /**
   * Synthesize speech using the browser SpeechSynthesis API with reactive audio bars
   */
  private speakBrowserText(rawText: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.setAgentState('listening')
      this.callbacks.onAssistantTurnComplete()
      return
    }

    try {
      window.speechSynthesis.cancel()

      // Clean markdown tags, tables, and special characters for spoken speech
      const cleanText = rawText
        .replace(/[*#|`_~>]/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/---/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!cleanText) {
        this.setAgentState('listening')
        this.callbacks.onAssistantTurnComplete()
        return
      }

      this.setAgentState('speaking')

      // Shorten overly lengthy responses for voice (first 3 sentences)
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]
      const spokenText = sentences.slice(0, 3).join(' ')

      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.lang = this.selectedLanguage
      utterance.rate = 1.0

      // Match regional voice if available
      try {
        const voices = window.speechSynthesis.getVoices()
        const targetLang = this.selectedLanguage.toLowerCase()
        const targetPrefix = targetLang.slice(0, 2)
        const match = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix))
        if (match) utterance.voice = match
      } catch {}

      // Simulate audio pulses for visualizer during SpeechSynthesis
      if (this.assistantAudioPulseTimer) clearInterval(this.assistantAudioPulseTimer)
      let phase = 0
      this.assistantAudioPulseTimer = setInterval(() => {
        phase += 0.3
        const level = 0.35 + Math.sin(phase) * 0.25
        this.callbacks.onAudioLevel(0, Math.max(0.1, level))
      }, 100)

      utterance.onend = () => {
        if (this.assistantAudioPulseTimer) {
          clearInterval(this.assistantAudioPulseTimer)
          this.assistantAudioPulseTimer = null
        }
        this.callbacks.onAudioLevel(0, 0)
        this.callbacks.onAssistantTurnComplete()
        setTimeout(() => {
          if (this.isSessionActive && this.currentAgentState === 'speaking') {
            this.setAgentState('listening')
          }
        }, 300)
      }

      utterance.onerror = () => {
        if (this.assistantAudioPulseTimer) {
          clearInterval(this.assistantAudioPulseTimer)
          this.assistantAudioPulseTimer = null
        }
        this.callbacks.onAudioLevel(0, 0)
        this.callbacks.onAssistantTurnComplete()
        this.setAgentState('listening')
      }

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[VoiceRelayClient] SpeechSynthesis error:', err)
      this.setAgentState('listening')
      this.callbacks.onAssistantTurnComplete()
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Downsampling & Base64 Helpers
  // -----------------------------------------------------------------------------------------------

  private downsampleTo16kHz(inputBuffer: Float32Array, inputSampleRate: number): Float32Array {
    if (inputSampleRate === 16000) return inputBuffer
    const sampleRateRatio = inputSampleRate / 16000
    const newLength = Math.round(inputBuffer.length / sampleRateRatio)
    const result = new Float32Array(newLength)

    for (let i = 0; i < newLength; i++) {
      const originalIdx = i * sampleRateRatio
      const low = Math.floor(originalIdx)
      const high = Math.ceil(originalIdx)
      const weight = originalIdx - low
      result[i] = inputBuffer[low] * (1 - weight) + (inputBuffer[high] || 0) * weight
    }

    return result
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
