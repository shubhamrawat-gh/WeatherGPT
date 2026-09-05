import { useState, useRef, useEffect, useCallback } from 'react'
import {
  VoiceRelayClient,
  type VoiceConnectionState,
  type VoiceAgentState,
  type ToolCallEvent,
  type VoiceMode,
} from '../services/voiceRelayClient'

interface UseVoiceSessionProps {
  selectedLanguage?: string
  onCommitTurn?: (userText: string, assistantText: string, tools: ToolCallEvent[]) => void
}

export function useVoiceSession({ selectedLanguage = 'en', onCommitTurn }: UseVoiceSessionProps = {}) {
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>('disconnected')
  const [agentState, setAgentState] = useState<VoiceAgentState>('idle')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('relay')
  const [isMuted, setIsMuted] = useState(false)
  const [liveUserTranscript, setLiveUserTranscript] = useState('')
  const [liveAssistantTranscript, setLiveAssistantTranscript] = useState('')
  const [recentTools, setRecentTools] = useState<ToolCallEvent[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const clientRef = useRef<VoiceRelayClient | null>(null)
  const accumulatedUserTextRef = useRef('')
  const accumulatedAssistantTextRef = useRef('')
  const accumulatedToolsRef = useRef<ToolCallEvent[]>([])

  // Commit completed turn callback ref
  const onCommitTurnRef = useRef(onCommitTurn)
  onCommitTurnRef.current = onCommitTurn

  const commitTurnIfReady = useCallback(() => {
    const uText = accumulatedUserTextRef.current.trim()
    const aText = accumulatedAssistantTextRef.current.trim()
    const tools = [...accumulatedToolsRef.current]

    if (uText || aText) {
      if (onCommitTurnRef.current) {
        onCommitTurnRef.current(uText || 'Spoken Voice Query', aText || 'Weather observation processed.', tools)
      }
      accumulatedUserTextRef.current = ''
      accumulatedAssistantTextRef.current = ''
      accumulatedToolsRef.current = []
      setLiveUserTranscript('')
      setLiveAssistantTranscript('')
      setRecentTools([])
    }
  }, [])

  // Initialize client once
  useEffect(() => {
    const client = new VoiceRelayClient({
      onConnectionChange: (state, error) => {
        setConnectionState(state)
        if (error) setErrorMessage(error)
        if (state === 'disconnected' || state === 'connected') {
          if (state === 'connected') setErrorMessage(null)
        }
      },
      onAgentStateChange: (state) => {
        setAgentState(state)
      },
      onModeChange: (mode) => {
        setVoiceMode(mode)
      },
      onUserTranscript: (text, isFinal) => {
        setLiveUserTranscript(text)
        if (isFinal) {
          accumulatedUserTextRef.current = text
        } else if (!accumulatedUserTextRef.current) {
          accumulatedUserTextRef.current = text
        }
      },
      onAssistantTranscript: (chunk) => {
        accumulatedAssistantTextRef.current += chunk
        setLiveAssistantTranscript((prev) => prev + chunk)
      },
      onAssistantTurnComplete: () => {
        commitTurnIfReady()
      },
      onToolCall: (event) => {
        accumulatedToolsRef.current.push(event)
        setRecentTools((prev) => [...prev.slice(-2), event])
      },
      onAudioLevel: (userLevel) => {
        setAudioLevel(userLevel)
      }
    })

    clientRef.current = client

    return () => {
      client.endVoiceSession()
      clientRef.current = null
    }
  }, [commitTurnIfReady])

  // Sync language selection
  useEffect(() => {
    clientRef.current?.setLanguage(selectedLanguage)
  }, [selectedLanguage])

  const startSession = useCallback(async () => {
    setErrorMessage(null)
    await clientRef.current?.startSession()
    if (clientRef.current) {
      setVoiceMode(clientRef.current.getMode())
    }
  }, [])

  const endVoiceSession = useCallback(() => {
    clientRef.current?.endVoiceSession()
  }, [])

  const stopSession = useCallback(() => {
    commitTurnIfReady()
    clientRef.current?.endVoiceSession()
  }, [commitTurnIfReady])

  const interrupt = useCallback(() => {
    clientRef.current?.interrupt()
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      clientRef.current?.setMuted(next)
      return next
    })
  }, [])

  const sendTextMessage = useCallback((text: string) => {
    accumulatedUserTextRef.current = text
    setLiveUserTranscript(text)
    clientRef.current?.sendText(text)
  }, [])

  const switchToBrowserMode = useCallback(() => {
    clientRef.current?.switchToBrowserMode('Switched by user')
    setVoiceMode('browser')
    setErrorMessage(null)
  }, [])

  return {
    connectionState,
    agentState,
    voiceMode,
    isMuted,
    liveUserTranscript,
    liveAssistantTranscript,
    recentTools,
    audioLevel,
    errorMessage,
    startSession,
    stopSession,
    endVoiceSession,
    interrupt,
    toggleMute,
    sendTextMessage,
    switchToBrowserMode
  }
}
