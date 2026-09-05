import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUp, 
  Copy, 
  Check, 
  CloudRain, 
  Globe, 
  Volume2, 
  VolumeX, 
  Plus, 
  Radio, 
  Mic, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react'
import SEO from '../../components/SEO'
import type { WeatherChatMessage } from '../../data/weatherMockData'
import { 
  SUPPORTED_LANGUAGES, 
  generateWeatherResponse 
} from '../../services/aiService'
import MarkdownMessage from '../../components/dashboard/MarkdownMessage'
import { NEW_CHAT_EVENT } from '../../services/chatEvents'
import { triggerMapNavigationFromText } from '../../services/mapEvents'
import { useVoiceSession } from '../../hooks/useVoiceSession'
import { VoiceModeHUD } from '../../components/voice/VoiceModeHUD'

// Regional prompt sets mapped by language code
const REGIONAL_PROMPTS: Record<string, string[]> = {
  en: [
    'What is the 3-day rainfall forecast for Mumbai and coastal Maharashtra?',
    'What is the current cyclone status in the Bay of Bengal?',
    'What agro-advisory applies to paddy sowing in Eastern India this week?',
    'Are there any active heatwave alerts in Rajasthan or Vidarbha?'
  ],
  hi: [
    'मुंबई और तटीय महाराष्ट्र के लिए अगले 3 दिनों का वर्षा पूर्वानुमान क्या है?',
    'बंगाल की खाड़ी में सक्रिय चक्रवात की वर्तमान स्थिति क्या है?',
    'इस सप्ताह पूर्वी भारत में धान की बुवाई के लिए क्या कृषि सलाह है?',
    'क्या राजस्थान या विदर्भ में लू (Heatwave) की कोई सक्रिय चेतावनी है?'
  ],
  mr: [
    'मुंबई आणि कोकण किनारपट्टीसाठी पुढील ३ दिवसांचा पावसाचा अंदाज काय आहे?',
    'बंगालच्या उपसागरातील चक्रीवादळाची सद्यस्थिती काय आहे?',
    'या आठवड्यात पूर्व भारतात भात लावणीसाठी कोणता कृषी सल्ला लागू आहे?',
    'विदर्भ किंवा मराठवाड्यात उष्णतेच्या लाटेचा काही इशारा आहे का?'
  ],
  bn: [
    'কলকাতা ও দক্ষিণবঙ্গের আগামী ৩ দিনের বৃষ্টিপাতের পূর্বাভাস কি?',
    'বঙ্গোপসাগরে কি কোনো সক্রিয় ঘূর্ণিঝড়ের সতর্কতা রয়েছে?',
    'এই সপ্তাহে ধান চাষের জন্য আবহাওয়া ভিত্তিক কৃষি পরামর্শ কি?',
    'উত্তরবঙ্গের পাহাড়ি এলাকায় কি কোনো भूमिধসের সতর্কতা আছে?'
  ],
  gu: [
    'ગુજરાત અને સૌરાષ્ટ્ર માટે આગામી ૩ દિવસની વરસાદની આગાહી શું છે?',
    'અરબી સમુદ્ર અથવા બંગાળની ખાડીમાં વાવાઝોડાની સ્થિતિ શું છે?',
    'ખરીફ પાકોની વાવણી માટે ખેડૂતો માટે શું હવામાન સલાહ છે?',
    'ઉત્તર ગુજરાતમાં હીટવેવની શું કોઈ ચેતવણી છે?'
  ],
  ta: [
    'சென்னை மற்றும் வட தமிழகத்திற்கான அடுத்த 3 நாள் மழை முன்னறிவிப்பு என்ன?',
    'வங்கக்கடலில் ஏதேனும் புயல் சின்னம் உருவாகியுள்ளதா?',
    'நடப்பு வாரத்தில் நெல் நடவுக்கான வேளாண் வானிலை ஆலோசனைகள் என்ன?',
    'தமிழகத்தில் வெப்ப அலை முன்னெச்சரிக்கை ஏதேனும் உள்ளதா?'
  ],
  te: [
    'హైదరాబాద్ మరియు తెలంగాణకు రాబోయే 3 రోజుల వర్ష సూచన ఏమిటి?',
    'బంగాళాఖాతంలో తుఫాను హెచ్చరికల తాజా పరిస్థితి ఏమిటి?',
    'ఈ వారం ఖరీఫ్ వరి సాగుకు వ్యవసాయ సలహాలు ఏమిటి?',
    'ఆంధ్రప్రదేశ్ తీరప్రాంతంలో తీవ్రమైన గాలుల హెచ్చరికలు ఉన్నాయా?'
  ]
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<WeatherChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null)
  const [progressIndex, setProgressIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<WeatherChatMessage | null>(null)
  const [isVoiceExpanded, setIsVoiceExpanded] = useState(false)
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({})

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
    selectedLanguage,
    onCommitTurn: (userText, assistantText) => {
      const now = new Date()
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${now.getTime()}`,
          sender: 'user',
          text: userText,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `asst-${now.getTime() + 1}`,
          sender: 'assistant',
          text: assistantText,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUserNearBottomRef = useRef(true)

  // Non-blocking auto-scroll: respects user manual scroll position while response streams
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(null)
    setIsTyping(false)
    setProgressIndex(0)
    setCopiedId(null)
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
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

  // Text-To-Speech for regional audio accessibility
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
      pa: 'pa-IN'
    }
    utterance.lang = langMap[selectedLanguage] || 'en-IN'
    utterance.rate = 0.95

    try {
      const voices = window.speechSynthesis.getVoices()
      const targetLang = langMap[selectedLanguage] || 'en-IN'
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

    // Trigger map camera sync in background without re-rendering map
    triggerMapNavigationFromText(text)

    // If a previous stream is still in-flight, flush and commit it immediately
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsTyping(true)

    // Helper to stream chunks or display immediately if reduced-motion preferred
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
        // Natural progressive chunk streaming (~4-6 characters per 16ms tick)
        currentIndex = Math.min(currentIndex + Math.floor(Math.random() * 3 + 4), fullText.length)
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

    try {
      const aiResult = await generateWeatherResponse(text, currentHistory, selectedLanguage)
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
        text: selectedLanguage === 'hi' 
          ? 'मौसम अवलोकन प्रणाली सामान्य रूप से कार्यरत है। विशिष्ट शहर या मौसम घटना के लिए विवरण पूछें।'
          : 'Weather observation feeds are operating normally. Please specify an Indian city, district, or meteorological event for detailed intelligence.',
        timestamp: fallbackTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      streamMessage(fallbackMsg)
    }
  }, [inputQuery, isTyping, streamingMessage, messages, selectedLanguage])

  const activePrompts = REGIONAL_PROMPTS[selectedLanguage] || REGIONAL_PROMPTS.en
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0]

  return (
    <>
      <SEO
        title="WeatherGPT | Multilingual Meteorological AI"
        description="Conversational meteorological forecasting, severe alerts, and climate intelligence across Indian regional languages."
      />

      <div className="flex flex-col h-full w-full dark:bg-[#0a0a0a] bg-[#f8fafc] dark:text-[#f0f4f8] text-slate-800 font-sans antialiased">
        
        {/* Top Control Bar with Regional Language Switcher */}
        <div className="h-10 border-b dark:border-white/[0.08] border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 dark:bg-[#0a0a0a] bg-white z-10 text-xs">
          <div className="flex items-center gap-2 dark:text-[#a8b3bc] text-slate-500">
            <CloudRain className="w-3.5 h-3.5 text-brand-green" />
            <span className="font-sans font-medium dark:text-white text-slate-900 hidden sm:inline">
              WeatherGPT Regional Intelligence
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition-colors duration-120 cursor-pointer border dark:bg-[#141414] bg-white dark:border-white/[0.08] border-slate-200 dark:text-[#a8b3bc] text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.16] hover:border-slate-300 shadow-xs"
              title="Start a new chat (resets conversation history)"
            >
              <Plus className="w-3.5 h-3.5 text-brand-green" />
              <span>New Chat</span>
            </button>

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
                  ? 'bg-brand-green/15 border-brand-green/40 text-brand-green'
                  : connectionState === 'connecting' || connectionState === 'reconnecting'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : connectionState === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:text-red-300'
                  : 'dark:bg-[#141414] bg-white dark:border-white/[0.08] border-slate-200 dark:text-[#a8b3bc] text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.16] hover:border-slate-300'
              }`}
              title={connectionState === 'connected' ? 'Disconnect Voice Session' : connectionState === 'error' ? 'Retry Voice Session' : 'Start Live Voice AI Intelligence Session'}
            >
              <Radio className={`w-3.5 h-3.5 ${connectionState === 'connected' ? 'text-brand-green animate-pulse' : connectionState === 'error' ? 'text-red-400' : 'text-brand-green'}`} />
              <span className="font-medium">
                {connectionState === 'connected' ? 'Live Voice' : connectionState === 'connecting' || connectionState === 'reconnecting' ? 'Connecting...' : connectionState === 'error' ? 'Retry Voice' : 'Live Voice'}
              </span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-green" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-7 px-2.5 rounded-lg dark:bg-[#141414] bg-white border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none dark:focus:border-white/[0.2] focus:border-slate-400 font-sans cursor-pointer transition-colors duration-120 shadow-xs"
                title="Select Regional Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-[#141414] bg-white dark:text-white text-slate-900">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            
            {messages.length === 0 && !streamingMessage ? (
              /* Regional Empty State with subtle crossfade */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="py-14 flex flex-col items-center text-center"
              >
                <div className="w-11 h-11 rounded-xl dark:bg-[#141414] bg-white border dark:border-white/[0.08] border-slate-200 text-brand-green flex items-center justify-center mb-4 shadow-xs">
                  <CloudRain className="w-5 h-5" />
                </div>

                <h1 className="font-sans text-xl md:text-2xl dark:text-white text-slate-900 font-semibold tracking-tight mb-2">
                  WeatherGPT · {currentLangObj.nativeName}
                </h1>
                <p className="text-xs dark:text-[#a8b3bc] text-slate-600 max-w-md font-sans leading-relaxed">
                  {selectedLanguage === 'hi' && 'मौसम पूर्वानुमान, चक्रवात चेतावनी, मानसून विश्लेषण एवं कृषि सलाह हिंदी में प्राप्त करें।'}
                  {selectedLanguage === 'mr' && 'हवामान अंदाज, चक्रीवादळ इशारा, मान्सून प्रगती व शेती सल्ला मराठीत मिळवा.'}
                  {selectedLanguage === 'bn' && 'আবহাওয়ার পূর্বাভাস, ঘূর্ণিঝড় সতর্কতা ও কৃষি পরামর্শ বাংলায় জানুন।'}
                  {selectedLanguage === 'ta' && 'வானிலை முன்னறிவிப்பு, புயல் எச்சரிக்கை மற்றும் விவசாய ஆலோசனைகளை தமிழில் பெறுங்கள்.'}
                  {selectedLanguage === 'te' && 'వాతావరణ సూచనలు, తుఫాను హెచ్చరికలు మరియు వ్యవసాయ సలహాలను తెలుగులో పొందండి.'}
                  {selectedLanguage === 'gu' && 'હવામાનની આગાહી, વાવાઝોડાની ચેતવણી અને ખેતી સલાહ ગુજરાતીમાં મેળવો.'}
                  {selectedLanguage === 'en' && 'Real-time forecasts, cyclonic alerts, monsoon departures, and agro-climate advisories across India.'}
                  {!['hi', 'mr', 'bn', 'ta', 'te', 'gu', 'en'].includes(selectedLanguage) && `Ask meteorological questions in ${currentLangObj.nativeName} (${currentLangObj.name}).`}
                </p>

                {/* Dynamic Regional Suggestion Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {activePrompts.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(query)}
                      className="p-3.5 rounded-xl dark:bg-[#141414] bg-white dark:hover:bg-[#1a1a1a] hover:bg-slate-50 border dark:border-white/[0.08] border-slate-200 hover:border-brand-green/40 text-left transition-colors duration-120 cursor-pointer group shadow-xs"
                    >
                      <p className="text-xs dark:text-[#a8b3bc] text-slate-600 dark:group-hover:text-white group-hover:text-slate-900 leading-relaxed font-sans">
                        {query}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Conversation Messages */
              messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end motion-msg-entrance">
                      <div className="max-w-xl dark:bg-[#191919] bg-brand-green/10 border dark:border-white/[0.08] border-brand-green/30 dark:text-white text-slate-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>
                    </div>
                  )
                }

                // Assistant Message with Markdown & Audio Reading
                return (
                  <div key={msg.id} className="flex flex-col gap-1 dark:text-[#e2e8f0] text-slate-800 group motion-msg-entrance">
                    {/* Collapsible Claude-style Thought Process Accordion */}
                    {msg.thinking && (
                      <div className="mb-1.5">
                        <button
                          type="button"
                          onClick={() => toggleThinking(msg.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors duration-120 cursor-pointer py-1 px-2 rounded-md dark:hover:bg-white/[0.04] hover:bg-slate-100 font-sans"
                        >
                          <span className="font-medium">
                            {expandedThinkingIds[msg.id] ? 'Hide Thought Process' : 'Thought for a few seconds'}
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
                              <div className="mt-1 pl-3 pr-2 py-2 border-l dark:border-white/[0.1] border-slate-300 text-xs dark:text-[#8896a2] text-slate-600 font-mono leading-relaxed dark:bg-[#111111]/60 bg-slate-100 rounded-r-lg max-h-56 overflow-y-auto whitespace-pre-wrap">
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
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1.5 p-1 rounded dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-200 transition-colors duration-120 cursor-pointer text-[11px]"
                        title="Copy message"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {copiedId === msg.id ? (
                            <motion.span
                              key="copied"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                              className="flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5 text-brand-green" />
                              <span className="text-brand-green text-[10px] font-mono">Copied</span>
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                              className="flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono">Copy</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Read Aloud Button */}
                      {'speechSynthesis' in window && (
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className="flex items-center gap-1 p-1 rounded dark:text-[#7c8c9a] text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-200 transition-colors duration-120 cursor-pointer text-[11px]"
                          title={isSpeaking === msg.id ? 'Stop reading' : 'Read aloud in regional audio'}
                        >
                          {isSpeaking === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-red-400 text-[10px] font-mono">Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-brand-green" />
                              <span className="text-[10px] font-mono">Listen Audio</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            {/* Active Streaming Assistant Message */}
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

            {/* Minimal Claude-Style Loading State: Soft Breathing Dot with Crossfading Status */}
            <AnimatePresence mode="wait">
              {isTyping && (
                <motion.div
                  key="thinking-indicator"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="flex items-center gap-2.5 text-xs py-2 select-none overflow-hidden"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-green/80 animate-soft-pulse shrink-0" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={progressIndex}
                      initial={{ opacity: 0, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(2px)' }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="dark:text-[#8896a2] text-slate-600 text-[11px] font-sans tracking-wide"
                    >
                      {selectedLanguage === 'hi'
                        ? [
                            'मौसम डेटा का समन्वय...',
                            'डॉपलर रडार और उपग्रह विश्लेषण...',
                            'क्षेत्रीय अलर्ट और बुलेटिन का मिलान...',
                            'पूर्वानुमान मॉडल का संश्लेषण...',
                            'अंतिम मौसम बुलेटिन तैयार किया जा रहा है...'
                          ][progressIndex % 5]
                        : [
                            'Consulting Doppler radar telemetry...',
                            'Scanning satellite cloud imagery...',
                            'Cross-referencing severe weather bulletins...',
                            'Synthesizing regional climate grids...',
                            'Formulating meteorological intelligence...'
                          ][progressIndex % 5]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Minimal Claude-Style Input Dock */}
        <div className="p-4 bg-transparent shrink-0">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="relative rounded-2xl dark:bg-[#141414] bg-white border dark:border-white/[0.08] border-slate-200 dark:focus-within:border-white/[0.18] focus-within:border-slate-400 transition-colors duration-150 flex items-end p-2.5 shadow-sm"
            >
              <textarea
                ref={textareaRef}
                value={inputQuery}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  selectedLanguage === 'hi'
                    ? 'मौसम पूर्वानुमान, चक्रवात या फसल सलाह के बारे में पूछें...'
                    : selectedLanguage === 'mr'
                    ? 'हवामान अंदाज, वादळ किंवा शेती सल्ला विचारा...'
                    : selectedLanguage === 'bn'
                    ? 'আবহাওয়া বা কৃষিপরামর্শ সম্পর্কে জিজ্ঞাসা করুন...'
                    : 'Ask about weather forecasts, cyclone alerts, or crop advisories...'
                }
                className="w-full pl-2 pr-10 py-1 bg-transparent text-xs sm:text-sm dark:text-white text-slate-900 dark:placeholder:text-[#5c6c7a] placeholder:text-slate-400 focus:outline-none resize-none max-h-44 leading-relaxed font-sans"
              />

              {/* Quick Voice Mic Button */}
              <button
                type="button"
                onClick={() => {
                  if (connectionState === 'connected' || connectionState === 'connecting' || connectionState === 'reconnecting') {
                    stopVoiceSession()
                  } else {
                    startVoiceSession()
                  }
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-120 cursor-pointer shrink-0 ml-1 ${
                  connectionState === 'connected'
                    ? 'bg-brand-green text-[#001e2b] animate-pulse'
                    : connectionState === 'error'
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                    : 'dark:text-[#7c8c9a] text-slate-500 hover:text-brand-green dark:hover:bg-white/[0.06] hover:bg-slate-100'
                }`}
                title={connectionState === 'connected' ? 'Disconnect Voice Session' : connectionState === 'error' ? 'Retry Voice Session' : 'Start Live Voice Session'}
                aria-label="Toggle Live Voice Session"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="w-8 h-8 rounded-xl bg-brand-green text-[#001e2b] flex items-center justify-center hover:bg-accent-hover transition-colors duration-120 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shrink-0 ml-1 font-bold"
                aria-label="Send query"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
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
