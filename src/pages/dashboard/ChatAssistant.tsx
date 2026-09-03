import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, Copy, Check, CloudRain, Globe, Volume2, VolumeX } from 'lucide-react'
import SEO from '../../components/SEO'
import type { WeatherChatMessage } from '../../data/weatherMockData'
import { 
  SUPPORTED_LANGUAGES, 
  generateWeatherResponse 
} from '../../services/aiService'
import MarkdownMessage from '../../components/dashboard/MarkdownMessage'

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
    'উত্তরবঙ্গের পাহাড়ি এলাকায় কি কোনো ভূমিধসের সতর্কতা আছে?'
  ],
  gu: [
    'ગુજરાત અને સૌરાષ્ટ્ર માટે આગામી ૩ દિવસની વરસાદની આગાહી શું છે?',
    'અરબી સમુદ્ર અથવા બંગાળની ખાડીમાં વાવાઝોડાની સ્થિતિ શું છે?',
    'ખરીફ પાકોની વાવણી માટે ખેડૂતો માટે શું હવામાન સલાહ છે?',
    'કચ્છ અને ઉત્તર ગુજરાતમાં ગરમીનું પ્રમાણ કેવું રહેશે?'
  ],
  ta: [
    'சென்னை மற்றும் கடலோர தமிழகத்திற்கான 3 நாள் மழை முன்னறிவிப்பு என்ன?',
    'வங்கக் கடலில் ஏதேனும் புயல் எச்சரிக்கை உள்ளதா?',
    'நெல் பயிர் விதைப்புக்கு இந்த வாரம் என்ன விவசாய ஆலோசனை?',
    'வட தமிழகத்தில் வெப்ப அலை முன்னெச்சரிக்கை ஏதேனும் உள்ளதா?'
  ],
  te: [
    'తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లో రాబోయే 3 రోజుల వర్షపాత సూచన ఏమిటి?',
    'బంగాళాఖాతంలో తుఫాను పరిస్థితి ఎలా ఉంది?',
    'వరి సాగు చేసే రైతులకు ఈ వారం వాతావరణ ఆధారిత వ్యవసాయ సలహా ఏమిటి?',
    'రాయలసీమ ప్రాంతంలో తీవ్ర ఎండల హెచ్చరికలు ఏమైనా ఉన్నాయా?'
  ],
  kn: [
    'ಕರ್ನಾಟಕ ಮತ್ತು ಕರಾವಳಿ ಭಾಗದಲ್ಲಿ ಮುಂದಿನ 3 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ ಏನು?',
    'ಬಂಗಾಳಕೊಲ್ಲಿಯಲ್ಲಿ ಚಂಡಮಾರುತದ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?',
    'ಖಾರೀಫ್ ಭತ್ತದ ಬಿತ್ತನೆಗೆ ರೈತರಿಗೆ ನೀಡುವ ಕೃಷಿ ಸಲಹೆಗಳೇನು?',
    'ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಬಿಸಿಗಾಳಿಯ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?'
  ],
  ml: [
    'കേരളത്തിൽ അടുത്ത 3 ദിവസത്തെ മഴ സാധ്യതയും മുന്നറിയിപ്പുകളും എന്തൊക്കെയാണ്?',
    'അറബിക്കടലിൽ കാറ്റിന്റെ വേഗതയും മത്സ്യത്തൊഴിലാളി ജാഗ്രതയും എങ്ങനെയുണ്ട്?',
    'നെൽകൃഷിക്കാർക്കായി ഈ ആഴ്ചയിലെ കാലാവസ്ഥാ നിർദ്ദേശങ്ങൾ എന്തൊക്കെയാണ്?',
    'മലയോര മേഖലകളിൽ ഉരുൾപൊട്ടൽ സാധ്യത ഉണ്ടോ?'
  ],
  or: [
    'ଓଡ଼ିଶା ଉପକୂଳ ପାଇଁ ଆଗାମୀ ୩ ଦିନର ବର୍ଷା ପୂର୍ବାନୁମାନ କଣ?',
    'ବଙ୍ଗୋପସାଗରରେ ସକ୍ରିୟ ବାତ୍ୟା ସମ୍ପର୍କରେ ତାଜା ତଥ୍ୟ କଣ?',
    'ଧାନ ଚାଷ ପାଇଁ ଚଳିତ ସପ୍ତାହର କୃଷି ପରାମର୍ଶ କଣ?',
    'ଉତ୍ତର ଓଡ଼ିଶାରେ ବନ୍ୟା ପରିସ୍ଥିତି କିପରି ଅଛି?'
  ],
  pa: [
    'ਪੰਜਾਬ ਵਿੱਚ ਅਗਲੇ 3 ਦਿਨਾਂ ਦੌਰਾਨ ਮੌਸਮ ਅਤੇ ਮੀਂਹ ਦੀ ਕੀ ਸੰਭਾਵਨਾ ਹੈ?',
    'ਝੋਨੇ ਦੀ ਫ਼ਸਲ ਅਤੇ ਸਿੰਚਾਈ ਸੰਬੰਧੀ ਕਿਸਾਨਾਂ ਲਈ ਕੀ ਮੌਸਮ ਸਲਾਹ ਹੈ?',
    'ਕੀ ਮਾਲਵਾ ਖੇਤਰ ਵਿੱਚ ਗਰਮੀ ਜਾਂ ਲੂ ਦੀ ਕੋਈ ਚੇਤਾਵਨੀ ਹੈ?',
    'ਕਪਾਹ ਦੀ ਫ਼ਸਲ ਲਈ ਮੌਸਮ ਦੇ ਅਨੁਕੂਲ ਨਿਰਦੇਸ਼ ਕੀ ਹਨ?'
  ],
  as: [
    'অসম আৰু ব্ৰহ্মপুত্ৰ উপত্যকাত অহা ৩ দিনৰ বৰষুণৰ পূৰ্বানুমান কি?',
    'উজনি অসমত বানপানীৰ সতৰ্কতা আছে নেকি?',
    'শালি ধান খেতিৰ বাবে কৃষকসকলৰ বাবে কি কৃষি পৰামৰ্শ আছে?',
    'পাহাৰীয়া জিলাসমূহত ভূমিস্খলনৰ সম্ভাৱনা আছেনে?'
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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

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

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Stop speech if unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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

    // Map language code to BCP 47
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

    utterance.onend = () => setIsSpeaking(null)
    utterance.onerror = () => setIsSpeaking(null)

    setIsSpeaking(id)
    window.speechSynthesis.speak(utterance)
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim()
    if (!text || isTyping) return

    const userMsg: WeatherChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

    try {
      const aiResult = await generateWeatherResponse(text, currentHistory, selectedLanguage)

      const assistantMsg: WeatherChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: aiResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error('WeatherGPT query error:', err)
      const fallbackMsg: WeatherChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: selectedLanguage === 'hi' 
          ? 'मौसम अवलोकन प्रणाली सामान्य रूप से कार्यरत है। विशिष्ट शहर या मौसम घटना के लिए विवरण पूछें।'
          : 'Weather observation feeds are operating normally. Please specify an Indian city, district, or meteorological event for detailed intelligence.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const activePrompts = REGIONAL_PROMPTS[selectedLanguage] || REGIONAL_PROMPTS.en
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0]

  return (
    <>
      <SEO
        title="WeatherGPT | Multilingual Meteorological AI"
        description="Conversational meteorological forecasting, severe alerts, and climate intelligence across Indian regional languages."
      />

      <div className="flex flex-col h-full w-full bg-[#00141e] text-[#f0f4f8] font-sans antialiased">
        
        {/* Top Control Bar with Regional Language Switcher */}
        <div className="h-10 border-b border-[#1c2d38] px-4 md:px-6 flex items-center justify-between shrink-0 bg-[#001e2b]/80 backdrop-blur-md z-10 text-xs">
          <div className="flex items-center gap-2 text-[#a8b3bc]">
            <CloudRain className="w-3.5 h-3.5 text-brand-green" />
            <span className="font-sans font-medium text-white hidden sm:inline">
              WeatherGPT Regional Intelligence
            </span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-green" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-7 px-2.5 rounded-lg bg-[#002d3f] border border-[#1c2d38] text-xs text-white focus:outline-none focus:border-brand-green font-sans cursor-pointer"
              title="Select Regional Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#001e2b] text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            
            {messages.length === 0 ? (
              /* Regional Empty State */
              <div className="py-14 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-xl bg-[#002d3f] border border-[#1c2d38] text-brand-green flex items-center justify-center mb-4 shadow-sm">
                  <CloudRain className="w-5 h-5" />
                </div>

                <h1 className="font-sans text-xl md:text-2xl text-white font-semibold tracking-tight mb-2">
                  WeatherGPT · {currentLangObj.nativeName}
                </h1>
                <p className="text-xs text-[#a8b3bc] max-w-md font-sans leading-relaxed">
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
                      className="p-3.5 rounded-xl bg-[#001e2b] hover:bg-[#002d3f] border border-[#1c2d38] text-left transition-colors cursor-pointer group"
                    >
                      <p className="text-xs text-[#a8b3bc] group-hover:text-white leading-relaxed font-sans">
                        {query}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation Messages */
              messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-xl bg-[#002d3f] border border-[#1c2d38] text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>
                    </div>
                  )
                }

                // Assistant Message with Markdown & Audio Reading
                return (
                  <div key={msg.id} className="flex flex-col gap-1 text-[#e2e8f0] group">
                    <MarkdownMessage content={msg.text} />

                    {/* Action Bar (Copy & Read Aloud) */}
                    <div className="flex items-center gap-3 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 p-1 rounded text-[#7c8c9a] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer text-[11px]"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-green" />
                            <span className="text-brand-green text-[10px] font-mono">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono">Copy</span>
                          </>
                        )}
                      </button>

                      {/* Read Aloud Button */}
                      {'speechSynthesis' in window && (
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className="flex items-center gap-1 p-1 rounded text-[#7c8c9a] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer text-[11px]"
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

            {/* Typing Indicator with dynamic progress words */}
            {isTyping && (
              <div className="flex items-center gap-2.5 text-xs text-brand-green py-2 font-mono select-none">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse [animation-delay:0.4s]" />
                </div>
                <span className="text-[#a8b3bc] text-[11px] transition-all duration-300">
                  {selectedLanguage === 'hi'
                    ? ['डॉपलर रडार डेटा का विश्लेषण...', 'डेटा समन्वय (Wrestling telemetry)...', 'पूर्वानुमान का मसौदा तैयार (Drafting)...', 'तालिकाओं का निर्माण...', 'अंतिम मौसम बुलेटिन...'][progressIndex % 5]
                    : ['Consulting Doppler radar grids...', 'Wrestling observation telemetry...', 'Drafting forecast models...', 'Synthesizing regional climate grids...', 'Structuring meteorological tables...', 'Finalizing weather intelligence...'][progressIndex % 6]}
                </span>
              </div>
            )}

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
              className="relative rounded-2xl bg-[#001e2b] border border-[#1c2d38] focus-within:border-brand-green/60 transition-colors flex items-end p-2.5 shadow-sm"
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
                className="w-full pl-2 pr-10 py-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-[#5c6c7a] focus:outline-none resize-none max-h-44 leading-relaxed font-sans"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="w-8 h-8 rounded-xl bg-brand-green text-[#001e2b] flex items-center justify-center hover:bg-brand-green-mid transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shrink-0 ml-1 font-bold"
                aria-label="Send query"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
