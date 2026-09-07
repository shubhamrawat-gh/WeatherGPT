import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUp, 
  Copy, 
  Check, 
  Globe, 
  Volume2, 
  VolumeX, 
  Plus, 
  Radio, 
  Mic, 
  ChevronDown, 
  ChevronRight,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react'
import SEO from '../../components/SEO'
import type { WeatherChatMessage } from '../../data/weatherMockData'
import { 
  generateWeatherResponse,
  detectLanguageFromPrompt
} from '../../services/aiService'
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext'
import MarkdownMessage from '../../components/dashboard/MarkdownMessage'
import { NEW_CHAT_EVENT } from '../../services/chatEvents'
import { triggerMapNavigationFromText } from '../../services/mapEvents'
import { useVoiceSession } from '../../hooks/useVoiceSession'
import { VoiceModeHUD } from '../../components/voice/VoiceModeHUD'
import AnimatedGlitchPrompts from '../../components/dashboard/AnimatedGlitchPrompts'

export default function ChatAssistant() {
  const { currentLanguage, setLanguage, t } = useLanguage()
  const [messages, setMessages] = useState<WeatherChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null)
  const [progressIndex, setProgressIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<WeatherChatMessage | null>(null)
  const [isVoiceExpanded, setIsVoiceExpanded] = useState(false)
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({})

  // GLM-style Model Selector
  const [selectedModel, setSelectedModel] = useState('Mausami-V1')
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)

  const toggleThinking = useCallback((id: string) => {
    setExpandedThinkingIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Real-time Voice Session Client Hook
  const {
    connectionState,
    agentState,
    voiceMode,
    isMuted,
    liveUserTranscript,
    liveAssistantTranscript,
    recentTools,
    audioLevel,
    errorMessage,
    startSession: startVoiceSession,
    stopSession: stopVoiceSession,
    endVoiceSession,
    interrupt: interruptVoice,
    toggleMute: toggleVoiceMute,
    switchToBrowserMode,
  } = useVoiceSession({
    selectedLanguage: currentLanguage,
    onCommitTurn: (userText, assistantText) => {
      const now = new Date()
      const newMsgs: WeatherChatMessage[] = []
      if (userText && userText.trim()) {
        newMsgs.push({
          id: `user-${now.getTime()}`,
          sender: 'user',
          text: userText.trim(),
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }
      if (assistantText && assistantText.trim()) {
        newMsgs.push({
          id: `asst-${now.getTime() + 1}`,
          sender: 'assistant',
          text: assistantText.trim(),
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }
      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs])
      }
    }
  })

  // Automatically start voice session and greet in Hindi 1 time when opening Chat Assistant
  const hasAutoStartedVoiceRef = useRef(false)
  useEffect(() => {
    if (!hasAutoStartedVoiceRef.current) {
      hasAutoStartedVoiceRef.current = true
      const timer = setTimeout(() => {
        startVoiceSession()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [startVoiceSession])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emptyTextareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUserNearBottomRef = useRef(true)

  // Non-blocking auto-scroll
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    isUserNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 140
  }, [])

  // Smooth scroll to bottom when near bottom
  useEffect(() => {
    if (isUserNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingMessage, isTyping])

  // Cycle through progress words while thinking
  useEffect(() => {
    if (!isTyping) {
      setProgressIndex(0)
      return
    }
    const interval = setInterval(() => {
      setProgressIndex((prev) => prev + 1)
    }, 1200)
    return () => clearInterval(interval)
  }, [isTyping])

  // Reset chat helper
  const handleNewChat = useCallback(() => {
    if (streamingTimerRef.current) {
      clearTimeout(streamingTimerRef.current)
      streamingTimerRef.current = null
    }
    setStreamingMessage(null)
    setMessages([])
    setInputQuery('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    if (emptyTextareaRef.current) {
      emptyTextareaRef.current.style.height = 'auto'
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(null)
    setIsTyping(false)
    setProgressIndex(0)
    setCopiedId(null)
    hasAutoStartedVoiceRef.current = false
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0
    }
  }, [])

  // Listen to global New Chat triggers
  useEffect(() => {
    const onNewChatEvent = () => handleNewChat()
    window.addEventListener(NEW_CHAT_EVENT, onNewChatEvent)
    return () => {
      window.removeEventListener(NEW_CHAT_EVENT, onNewChatEvent)
      if (streamingTimerRef.current) {
        clearTimeout(streamingTimerRef.current)
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [handleNewChat])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Text-To-Speech
  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return

    if (isSpeaking === id) {
      window.speechSynthesis.cancel()
      setIsSpeaking(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#|`-]/g, ' ')
    const utterance = new SpeechSynthesisUtterance(cleanText)

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
      as: 'as-IN',
    }
    utterance.lang = langMap[currentLanguage] || 'en-IN'
    utterance.rate = 0.95

    try {
      const voices = window.speechSynthesis.getVoices()
      const targetLang = langMap[currentLanguage] || 'en-IN'
      const femaleVoice = voices.find((v) => {
        const langMatch = v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.slice(0, 2).toLowerCase())
        const nameLower = v.name.toLowerCase()
        const isFemale = nameLower.includes('female') || 
                         nameLower.includes('zira') || 
                         nameLower.includes('sangeeta') || 
                         nameLower.includes('swara') || 
                         nameLower.includes('neerja') || 
                         nameLower.includes('heera') || 
                         nameLower.includes('natural') || 
                         nameLower.includes('google')
        return langMatch && isFemale
      }) || voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.slice(0, 2).toLowerCase()))
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
    } catch {}

    utterance.onend = () => setIsSpeaking(null)
    utterance.onerror = () => setIsSpeaking(null)

    setIsSpeaking(id)
    window.speechSynthesis.speak(utterance)
  }

  const handleSend = useCallback(async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim()
    if (!text || isTyping) return

    // Trigger map camera sync in background
    triggerMapNavigationFromText(text)

    // Flush any pending stream
    if (streamingTimerRef.current && streamingMessage) {
      clearTimeout(streamingTimerRef.current)
      streamingTimerRef.current = null
      setMessages((prev) => [...prev, streamingMessage])
      setStreamingMessage(null)
    }

    const msgTime = new Date()
    const userMsg: WeatherChatMessage = {
      id: `user-${msgTime.getTime()}`,
      sender: 'user',
      text,
      timestamp: msgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const currentHistory = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text,
    }))

    setMessages((prev) => [...prev, userMsg])
    setInputQuery('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    if (emptyTextareaRef.current) emptyTextareaRef.current.style.height = 'auto'
    setIsTyping(true)

    const streamMessage = (msg: WeatherChatMessage) => {
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setMessages((prev) => [...prev, msg])
        setIsTyping(false)
        return
      }

      const fullText = msg.text
      let currentIndex = 0
      setIsTyping(false)
      setStreamingMessage({ ...msg, text: '' })

      const streamChunk = () => {
        let nextIndex = Math.min(currentIndex + Math.floor(Math.random() * 3 + 4), fullText.length)

        // Ensure markdown tables never get sliced mid-syntax (which can cause tables to flicker or re-render during typewriter effect)
        const lastNewlineBeforeNext = fullText.lastIndexOf('\n', nextIndex)
        if (lastNewlineBeforeNext >= currentIndex) {
          const afterNewline = fullText.slice(lastNewlineBeforeNext + 1)
          if (afterNewline.trimStart().startsWith('|')) {
            const rowEnd = fullText.indexOf('\n', lastNewlineBeforeNext + 1)
            if (rowEnd !== -1) {
              nextIndex = rowEnd + 1
              const sepLine = fullText.slice(nextIndex)
              if (sepLine.trimStart().startsWith('|') && sepLine.includes('---')) {
                const sepEnd = fullText.indexOf('\n', nextIndex)
                if (sepEnd !== -1) {
                  nextIndex = sepEnd + 1
                }
              }
            }
          }
        } else {
          const lastNewline = fullText.lastIndexOf('\n', currentIndex)
          const lineStart = lastNewline === -1 ? 0 : lastNewline + 1
          const line = fullText.slice(lineStart)
          if (line.trimStart().startsWith('|')) {
            const rowEnd = fullText.indexOf('\n', currentIndex)
            if (rowEnd !== -1) {
              nextIndex = rowEnd + 1
            }
          }
        }

        currentIndex = nextIndex
        const currentChunk = fullText.slice(0, currentIndex)

        setStreamingMessage({
          ...msg,
          text: currentChunk,
        })

        if (currentIndex < fullText.length) {
          streamingTimerRef.current = setTimeout(streamChunk, 16)
        } else {
          setMessages((prev) => [...prev, msg])
          setStreamingMessage(null)
          streamingTimerRef.current = null
        }
      }

      streamingTimerRef.current = setTimeout(streamChunk, 16)
    }

    const detectedLang = detectLanguageFromPrompt(text, currentLanguage)
    if (detectedLang && detectedLang !== currentLanguage) {
      setLanguage(detectedLang)
    }

    try {
      const aiResult = await generateWeatherResponse(text, currentHistory, detectedLang)
      const resTime = new Date()

      const assistantMsg: WeatherChatMessage = {
        id: `asst-${resTime.getTime()}`,
        sender: 'assistant',
        text: aiResult.text,
        thinking: aiResult.thinking,
        timestamp: resTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      streamMessage(assistantMsg)
    } catch (err) {
      console.error('WeatherGPT query error:', err)
      const fallbackTime = new Date()
      const fallbackMsg: WeatherChatMessage = {
        id: `asst-${fallbackTime.getTime()}`,
        sender: 'assistant',
        text: detectedLang === 'hi' 
          ? 'मौसम अवलोकन प्रणाली सामान्य रूप से कार्यरत है। विशिष्ट शहर या मौसम घटना के लिए विवरण पूछें।'
          : detectedLang === 'mr'
          ? 'हवामान निरीक्षण प्रणाली सुरळीतपणे कार्यरत आहे. कृपया विशिष्ट शहर किंवा हवामान घटनेबाबत विचारा.'
          : detectedLang === 'bn'
          ? 'আবহাওয়া পর্যবেক্ষণ ব্যবস্থা সক্রিয় রয়েছে। বিস্তারিত জানার জন্য যেকোনো শহর বা জেলা উল্লেখ করুন।'
          : 'Weather observation feeds are operating normally. Please specify an Indian city, district, or meteorological event for detailed intelligence.',
        timestamp: fallbackTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      streamMessage(fallbackMsg)
    }
  }, [inputQuery, isTyping, streamingMessage, messages, currentLanguage, setLanguage])

  // Close menus when clicking outside
  useEffect(() => {
    const handleWindowClick = () => {
      setIsModelMenuOpen(false)
      setIsPlusMenuOpen(false)
    }
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

  return (
    <>
      <SEO
        title="WeatherGPT | Multilingual Meteorological AI"
        description="Conversational meteorological forecasting, severe alerts, and climate intelligence across Indian regional languages."
      />

      <div className="flex flex-col h-full w-full dark:bg-[#0c0c0f] bg-[#f8fafc] dark:text-[#f0f4f8] text-slate-800 font-sans antialiased overflow-hidden select-none">
        
        {/* GLM-Style Minimalist Top Bar */}
        <header className="h-12 border-b dark:border-white/[0.06] border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 dark:bg-[#0c0c0f] bg-white z-30">
          {/* Top Left: Model Selector Dropdown (e.g. GLM-5.3 ⌵) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsModelMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold dark:text-white text-slate-900 dark:hover:text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer tracking-tight py-1"
            >
              <span>{selectedModel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 dark:text-neutral-400 text-slate-500 ${isModelMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* Model Selection Menu */}
            <AnimatePresence>
              {isModelMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 mt-2 w-64 rounded-xl dark:bg-[#151518] bg-white border dark:border-white/[0.1] border-slate-200 shadow-2xl p-1.5 z-50 text-xs font-sans"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-mono dark:text-neutral-400 text-slate-500 uppercase tracking-wider">
                    Meteorological LLM Engine
                  </div>
                  {[
                    { id: 'Mausami-V1', label: 'Mausami-V1', desc: 'WeatherGPT Neural Core + Open-Meteo' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id)
                        setIsModelMenuOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        selectedModel === m.id
                          ? 'dark:bg-white/[0.08] bg-slate-100 dark:text-emerald-400 text-emerald-600 font-medium'
                          : 'dark:text-neutral-300 text-slate-700 dark:hover:bg-white/[0.04] hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{m.label}</div>
                        <div className="text-[10px] dark:text-neutral-500 text-slate-400">{m.desc}</div>
                      </div>
                      {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top Right: Official Government & Intelligence Links + Actions */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-sans">
            {/* IMD Official Portal Link */}
            <a
              href="https://mausam.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
              title="India Meteorological Department (https://mausam.imd.gov.in/)"
            >
              <span>IMD</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* NDMA Official Disaster Management Link */}
            <a
              href="https://ndma.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
              title="National Disaster Management Authority (https://ndma.gov.in/)"
            >
              <span>NDMA</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* MoES Portal Link */}
            <a
              href="https://moes.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
              title="Ministry of Earth Sciences, Government of India"
            >
              <span>MoES</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Radar Map Link */}
            <a
              href="/dashboard/map"
              className="hidden sm:inline-flex items-center gap-1 dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
              title="Interactive Doppler Radar & Weather Map"
            >
              <span>Radar</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Live Voice Chat Button */}
            <button
              onClick={() => {
                if (connectionState === 'connected' || connectionState === 'connecting' || connectionState === 'reconnecting') {
                  stopVoiceSession()
                } else {
                  startVoiceSession()
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition-colors duration-120 cursor-pointer border shadow-xs ${
                connectionState === 'connected'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : connectionState === 'connecting' || connectionState === 'reconnecting'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : connectionState === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:text-red-300'
                  : 'dark:bg-[#151518] bg-white dark:border-white/[0.08] border-slate-200 dark:text-[#a8b3bc] text-slate-700 dark:hover:text-white hover:text-slate-900'
              }`}
              title={connectionState === 'connected' ? 'Disconnect Voice Session' : 'Start Live Voice AI Intelligence'}
            >
              <Radio className={`w-3.5 h-3.5 ${connectionState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="font-medium hidden sm:inline">
                {connectionState === 'connected' ? t('chat.liveVoice', 'Live Voice') : t('chat.voice', 'Voice')}
              </span>
            </button>

            {/* Regional Language Selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-7 px-2 rounded-lg dark:bg-[#151518] bg-white border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none dark:focus:border-white/[0.2] focus:border-slate-400 font-sans cursor-pointer transition-colors shadow-xs"
                title="Select Regional Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-[#151518] bg-white dark:text-white text-slate-900">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* New Chat Icon (when conversation exists) */}
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors cursor-pointer"
                title={t('chat.newChat', 'Start a new conversation')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Main Content Viewport */}
        <div className="flex-1 overflow-hidden relative flex flex-col">

          {/* EMPTY STATE: Exactly matching the GLM screenshot with Centered Hero, Watermark & Floating Input */}
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 flex flex-col justify-center items-center relative py-12">
              
              {/* Giant Stylized Geometric Background Watermark (Geometric "7" / Isobar facets) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
                <svg
                  className="w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] dark:opacity-[0.035] opacity-[0.03] text-white"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer geometric shield/polygon */}
                  <polygon points="100,10 185,55 185,145 100,190 15,145 15,55" stroke="currentColor" strokeWidth="1" />
                  {/* Prominent stylized geometric 7 / hurricane angle from screenshot */}
                  <path d="M42,52 L158,52 L98,168 L84,136 L124,72 L62,72 Z" stroke="currentColor" strokeWidth="1.2" />
                  {/* Concentric radar isobars */}
                  <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 5" />
                  <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
                </svg>
              </div>

              <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center relative z-10">
                
                {/* Hero Headline: Simple, refined typography in one line, a bit smaller */}
                <motion.h1 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="font-sans font-medium text-xl sm:text-2xl dark:text-white/90 text-slate-800 tracking-tight text-center select-none mb-6 whitespace-nowrap"
                >
                  {t('chat.subtitle', 'How can I help you today?')}
                </motion.h1>

                {/* Floating Centered Input Card (Matches Screenshot) */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.14 }}
                  className="w-full rounded-2xl dark:bg-[#151518]/90 bg-white border dark:border-white/[0.09] border-slate-200 shadow-2xl p-3.5 sm:p-4 text-left transition-all duration-150 focus-within:dark:border-white/[0.2] focus-within:border-slate-400"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex flex-col"
                  >
                    <textarea
                      ref={emptyTextareaRef}
                      value={inputQuery}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder={t('chat.placeholder', 'How can I help you today?')}
                      className="w-full bg-transparent text-sm sm:text-[15px] dark:text-white text-slate-900 dark:placeholder:text-[#555d68] placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-sans"
                    />

                    {/* Bottom Toolbar inside the Input Box */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t dark:border-white/[0.05] border-slate-100">
                      
                      {/* Left: Plus Action */}
                      <div className="flex items-center gap-2 relative">
                        {/* Plus Button */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setIsPlusMenuOpen((v) => !v)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Add Location / Coordinates / Scenarios"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Plus Context Menu */}
                          <AnimatePresence>
                            {isPlusMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-0 bottom-full mb-2 w-56 rounded-xl dark:bg-[#1a1a1f] bg-white border dark:border-white/[0.1] border-slate-200 shadow-xl p-1.5 z-50 text-xs"
                              >
                                <div className="px-2 py-1 text-[10px] font-mono dark:text-neutral-500 text-slate-400 uppercase">
                                  Quick Atmospheric Context
                                </div>
                                {[
                                  { label: 'Delhi-NCR Weather & AQI', query: 'What is the current weather, rain chance, and AQI in Delhi-NCR today?' },
                                  { label: 'Mumbai & Coastal Rainfall', query: 'What is the rainfall forecast for Mumbai and coastal Konkan today?' },
                                  { label: 'Bay of Bengal Cyclonic Status', query: 'What is the current cyclone status and depression alert in Bay of Bengal?' }
                                ].map((item, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      handleSend(item.query)
                                      setIsPlusMenuOpen(false)
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-md dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-neutral-300 text-slate-700 cursor-pointer"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>

                      {/* Right: Voice Mic and Circular Up-Arrow */}
                      <div className="flex items-center gap-2">

                        {/* Quick Mic Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (connectionState === 'connected' || connectionState === 'connecting') {
                              stopVoiceSession()
                            } else {
                              startVoiceSession()
                            }
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            connectionState === 'connected'
                              ? 'bg-emerald-500 text-black animate-pulse'
                              : 'dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                          }`}
                          title={connectionState === 'connected' ? 'Stop Voice' : 'Start Voice'}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>

                        {/* Circular Up-Arrow Button (Matches Screenshot) */}
                        <button
                          type="submit"
                          disabled={!inputQuery.trim() || isTyping}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer font-bold ${
                            inputQuery.trim()
                              ? 'bg-white text-black hover:bg-emerald-400 hover:text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                              : 'dark:bg-[#28282e] bg-slate-200 dark:text-neutral-500 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                          aria-label="Send Query"
                        >
                          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>

                {/* ADVANCED AUTONOMOUS GLITCH PROMPT CARDS (NO BUTTON, AUTO-CHANGING) */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="w-full"
                >
                  <AnimatedGlitchPrompts 
                    selectedLanguage={currentLanguage} 
                    onSelectPrompt={handleSend} 
                  />
                </motion.div>

              </div>
            </div>
          ) : (
            
            /* ACTIVE CHAT VIEW: Conversation Messages & Bottom Dock */
            <>
              <div 
                ref={messagesContainerRef} 
                onScroll={handleScroll} 
                className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
              >
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                  {messages.map((msg) => {
                    if (msg.sender === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end motion-msg-entrance">
                          <div className="max-w-xl dark:bg-[#18181c] bg-emerald-500/10 border dark:border-white/[0.08] border-emerald-500/30 dark:text-white text-slate-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.text}
                          </div>
                        </div>
                      )
                    }

                    // Assistant Message
                    return (
                      <div key={msg.id} className="flex flex-col gap-1 dark:text-[#e2e8f0] text-slate-800 group motion-msg-entrance">
                        {/* Collapsible Thought Process */}
                        {msg.thinking && (
                          <div className="mb-1.5">
                            <button
                              type="button"
                              onClick={() => toggleThinking(msg.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors duration-120 cursor-pointer py-1 px-2 rounded-md dark:hover:bg-white/[0.04] hover:bg-slate-100 font-sans"
                            >
                              <span className="font-medium">
                                {expandedThinkingIds[msg.id] ? t('chat.hideThinking', 'Hide Thought Process') : t('chat.thoughtSeconds', 'Thought for a few seconds')}
                              </span>
                              {expandedThinkingIds[msg.id] ? (
                                <ChevronDown className="w-3 h-3 text-[#5c6c7a]" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-[#5c6c7a]" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedThinkingIds[msg.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1 pl-3 pr-2 py-2 border-l dark:border-white/[0.1] border-slate-300 text-xs dark:text-[#8896a2] text-slate-600 font-mono leading-relaxed dark:bg-[#111114]/80 bg-slate-100 rounded-r-lg max-h-56 overflow-y-auto whitespace-pre-wrap">
                                    {msg.thinking}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <MarkdownMessage content={msg.text} />

                        {/* Action Bar (Copy & Read Aloud) */}
                        <div className="flex items-center gap-3 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="flex items-center gap-1.5 p-1 rounded dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-200 transition-colors cursor-pointer text-[11px]"
                            title={t('chat.copy', 'Copy message')}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {copiedId === msg.id ? (
                                <motion.span
                                  key="copied"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-1 text-emerald-400"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-mono">{t('chat.copied', 'Copied')}</span>
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-mono">{t('chat.copy', 'Copy')}</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>

                          {'speechSynthesis' in window && (
                            <button
                              onClick={() => handleSpeak(msg.text, msg.id)}
                              className="flex items-center gap-1 p-1 rounded dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-200 transition-colors cursor-pointer text-[11px]"
                              title={isSpeaking === msg.id ? t('chat.stopSpeak', 'Stop speaking') : t('chat.speak', 'Read aloud')}
                            >
                              {isSpeaking === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                                  <span className="text-red-400 text-[10px] font-mono">{t('chat.stopSpeak', 'Stop Audio')}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[10px] font-mono">{t('chat.speak', 'Listen')}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Active Streaming Message */}
                  {streamingMessage && (
                    <div key={streamingMessage.id} className="flex flex-col gap-1 dark:text-[#e2e8f0] text-slate-800 group motion-msg-entrance">
                      {streamingMessage.thinking && (
                        <div className="mb-1.5">
                          <div className="inline-flex items-center gap-1.5 text-[11px] dark:text-[#7c8c9a] text-slate-500 py-1 px-2 rounded-md dark:bg-white/[0.02] bg-slate-100 font-sans">
                            <span className="font-medium">Thought for a few seconds</span>
                          </div>
                        </div>
                      )}
                      <MarkdownMessage content={streamingMessage.text} />
                    </div>
                  )}

                  {/* Typing Indicator */}
                  <AnimatePresence mode="wait">
                    {isTyping && (
                      <motion.div
                        key="thinking-indicator"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2.5 text-xs py-2 select-none overflow-hidden"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-pulse shrink-0" />
                        <span className="dark:text-[#8896a2] text-slate-600 text-[11px] font-sans tracking-wide">
                          {t('chat.thinkingWords').split('|')[progressIndex % 4] || 'Analyzing meteorological telemetry...'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* DOCKED BOTTOM INPUT DOCK (When chatting) */}
              <div className="p-4 bg-transparent shrink-0">
                <div className="max-w-2xl mx-auto">
                  <div className="w-full rounded-2xl dark:bg-[#151518] bg-white border dark:border-white/[0.09] border-slate-200 shadow-xl p-3 text-left focus-within:dark:border-white/[0.2] focus-within:border-slate-400 transition-colors">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                      }}
                      className="flex flex-col"
                    >
                      <textarea
                        ref={textareaRef}
                        value={inputQuery}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={t('chat.placeholder', 'How can I help you today?')}
                        className="w-full bg-transparent text-sm dark:text-white text-slate-900 dark:placeholder:text-[#555d68] placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-sans max-h-40"
                      />

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t dark:border-white/[0.05] border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsPlusMenuOpen((v) => !v)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Add Location / Coordinates"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (connectionState === 'connected' || connectionState === 'connecting') {
                                stopVoiceSession()
                              } else {
                                startVoiceSession()
                              }
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              connectionState === 'connected'
                                ? 'bg-emerald-500 text-black animate-pulse'
                                : 'dark:text-neutral-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                            }`}
                            title="Live Voice"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="submit"
                            disabled={!inputQuery.trim() || isTyping}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer font-bold ${
                              inputQuery.trim()
                                ? 'bg-white text-black hover:bg-emerald-400 hover:text-black shadow-[0_0_10px_rgba(255,255,255,0.25)]'
                                : 'dark:bg-[#28282e] bg-slate-200 dark:text-neutral-500 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed'
                            }`}
                            aria-label="Send Query"
                          >
                            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Real-Time Live Voice HUD Overlay */}
        <VoiceModeHUD
          connectionState={connectionState}
          agentState={agentState}
          isMuted={isMuted}
          audioLevel={audioLevel}
          liveUserTranscript={liveUserTranscript}
          liveAssistantTranscript={liveAssistantTranscript}
          recentTools={recentTools}
          errorMessage={errorMessage}
          isExpanded={isVoiceExpanded}
          voiceMode={voiceMode}
          onToggleExpand={() => setIsVoiceExpanded((prev) => !prev)}
          onInterrupt={interruptVoice}
          onToggleMute={toggleVoiceMute}
          onEndCall={endVoiceSession}
          onRetry={startVoiceSession}
          onSwitchToBrowserMode={switchToBrowserMode}
        />
      </div>
    </>
  )
}
