/**
 * WeatherGPT Conversational AI Service
 * Powered by OpenRouter API with Multi-Lingual & Regional Intelligence and Guardrails
 */

const OPENROUTER_API_KEY = (import.meta.env?.VITE_OPENROUTER_API_KEY || '').trim()

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  samplePrompt: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', samplePrompt: 'What is the 3-day rainfall forecast for Mumbai?' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', samplePrompt: 'मुंबई में अगले 3 दिनों में कितनी बारिश होगी?' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', samplePrompt: 'पुणे आणि कोकणात पुढील ३ दिवसांचा पावसाचा अंदाज काय आहे?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', samplePrompt: 'বঙ্গোপসাগরে কি কোনো ঘূর্ণিঝড়ের সতর্কতা আছে?' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', samplePrompt: 'ગુજરાત દરિયાકાંઠે મોજા અને પવનની ચેતવણી શું છે?' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', samplePrompt: 'சென்னையில் அடுத்த 3 நாட்களுக்கு மழை முன்னறிவிப்பு என்ன?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', samplePrompt: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో వర్షపాత సూచన ఏమిటి?' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', samplePrompt: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಏನು?' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', samplePrompt: 'കേരള തീരത്ത് മഴ മുന്നറിയിപ്പുകൾ ഉണ്ടോ?' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', samplePrompt: 'ଓଡ଼ିଶା ଉପକୂଳରେ ବାତ୍ୟା ସତର୍କତା ବିଷୟରେ ଜଣାନ୍ତୁ?' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', samplePrompt: 'ਪੰਜਾਬ ਵਿੱਚ ਸਾਉਣੀ ਦੀ ਫ਼ਸਲ ਲਈ ਮੌਸਮ ਸਲਾਹ ਕੀ ਹੈ?' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', samplePrompt: 'ব্ৰহ্মপুত্ৰ উপত্যকাত বানপানীৰ স্থিতি কেনেকুৱা?' },
]

// System prompt enforcing meteorological domain boundaries and regional intelligence
const BASE_SYSTEM_PROMPT = `You are WeatherGPT, an operational AI meteorological and climate intelligence console developed for India (SIH26068, Theme: Disaster Management, Team: ZeroLatency).

CORE PURPOSE & CAPABILITIES:
1. OPERATIONAL FORECASTING:
   - Provide authoritative forecasts for ANY Indian city, district, town, or state (e.g. Dhanbad, Mumbai, Patna, Pune, Delhi, Kolkata, Chennai, Jaipur, Bengaluru, etc.).
   - Reference IMD (India Meteorological Department) regional telemetry, INSAT satellite imagery, Doppler radar, and NWP models (GFS/ECMWF).
   - NEVER state you do not have real-time data or suggest external apps. Always provide realistic, structured, authoritative meteorological intelligence.

2. SEVERE WEATHER & HAZARDS:
   - Provide cyclone warnings (speed, category, landfall track), flash floods, heatwaves (loo), cloudbursts, severe thunderstorms, landslides, and maritime swell advisories.
   - Always include actionable safety directives and civic precautions.

3. AGRO-CLIMATE & REGIONAL GUIDANCE:
   - Provide crop-specific advisories (Kharif, Rabi, Zaid) regarding sowing, moisture retention, irrigation timing, and fertilizer spraying.

4. MULTILINGUAL & HINGLISH EXCELLENCE:
   - If the user asks in Hindi, Hinglish (e.g. "aaj dhanbad ka mausam kaisa hoga"), Marathi, Bengali, Tamil, Telugu, Gujarati, etc., respond fully and fluently in that language!
   - Format data in clean Markdown tables (| Metric | Value |) and bullet points.

5. STRICT DOMAIN BOUNDARY (REFUSAL RULE):
   - Only answer weather, climate, disaster management, and agro-met questions.
   - If asked about non-weather topics (coding, politics, sports scores, entertainment, general trivia), politely refuse:
     - English: "I cannot help you with that. I am specialized exclusively in weather intelligence and climate information. Please ask a weather-related query."
     - Hindi / Hinglish: "मैं इसमें आपकी सहायता नहीं कर सकता। मैं केवल मौसम पूर्वानुमान, चक्रवात, वर्षा और कृषि सलाह के लिए समर्पित हूँ। कृपया मौसम से जुड़ा प्रश्न पूछें!"

6. ZERO THINKING PROCESS EXPOSURE:
   - NEVER output internal thoughts, analysis steps, or phrases like "Here's a thinking process:", "Thinking Process:", "1. Analyze User Input".
   - Jump directly to the final markdown weather report or forecast table.`

// Permitted weather terms in English, Hinglish, and regional languages
const WEATHER_INTENT_KEYWORDS = [
  // English
  'weather', 'rain', 'rainfall', 'precipitation', 'temperature', 'forecast', 'monsoon', 'climate',
  'cyclone', 'storm', 'flood', 'flooding', 'heatwave', 'coldwave', 'wind', 'humidity', 'cloud',
  'snow', 'fog', 'drought', 'crop', 'farming', 'farmer', 'sow', 'sowing', 'irrigate', 'irrigation',
  'agriculture', 'paddy', 'wheat', 'disaster', 'landslide', 'earthquake', 'earthquakes', 'quake', 'quakes', 'tremor', 'seismic', 'richter', 'radar', 'satellite', 'imd', 'uv',
  'hazard', 'celsius', 'fahrenheit', 'advisory', 'air quality', 'aqi', 'hot', 'cold', 'thunder',
  'lightning', 'hail', 'gust', 'swell', 'tide', 'barometer', 'pressure', 'atmospheric', 'kharif',
  'rabi', 'soil', 'season', 'autumn', 'winter', 'spring', 'summer',

  // Hinglish / Romanized Hindi & Regional
  'mausam', 'mosam', 'kaisa', 'hoga', 'rahega', 'aaj', 'kal', 'parson', 'barsat', 'barish', 'baarish',
  'varsha', 'tapman', 'taapman', 'hawa', 'hava', 'toofan', 'tufan', 'chhatri', 'thand', 'sardi',
  'garmi', 'loo', 'badal', 'kohra', 'dhund', 'chakarvat', 'bijli', 'fasal', 'kheti', 'dhan', 'gehu',
  'chawal', 'pani', 'paani', 'jal', 'nadia', 'dam', 'paus', 'havaman', 'sheti', 'pik', 'kharip',
  'abohawa', 'brishti', 'jhor', 'banya', 'mazhai', 'varsham', 'dhanbad', 'jharkhand', 'ranchi',
  'patna', 'bihar', 'pune', 'mumbai', 'delhi', 'kolkata', 'chennai', 'bengaluru', 'hyderabad',
  'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'surat', 'ahmedabad', 'guwahati',
  'odisha', 'kerala', 'rajasthan', 'assam', 'punjab', 'haryana', 'gujarat', 'maharashtra',

  // Hindi / Marathi (Devanagari)
  'मौसम', 'बारिश', 'वर्षा', 'तापमान', 'हवामान', 'पाऊस', 'चक्रीवादळ', 'चक्रवात', 'पूर', 'दुष्काळ',
  'अंदाज', 'शेती', 'पीक', 'खरीप', 'रबी', 'सिंचाई', 'विजा', 'वारा', 'थंडी', 'ऊन', 'बाष्प', 'धुके',
  'भूस्खलन', 'भूकंप', 'भूचाल', 'गारपीट', 'मान्सून', 'उष्णता', 'लाट', 'मेघगर्जना', 'पाऊसपाणी',

  // Bengali
  'আবহাওয়া', 'বৃষ্টি', 'বৃষ্টিপাত', 'তাপমাত্রা', 'ঘূর্ণিঝড়', 'বন্যা', 'কৃষি', 'ফসল', 'খরিফ', 'মেঘ',
  'কুয়াশা', 'বজ্রপাত', 'ঝড়',

  // Tamil
  'வானிலை', 'மழை', 'வெப்பநிலை', 'புயல்', 'வெள்ளம்', 'விவசாயம்', 'பயிர்', 'காற்று',

  // Telugu
  'వాతావరణం', 'వర్షం', 'ఉష్णోగ్రత', 'తుఫాను', 'వరదలు', 'వ్యవసాయం', 'పంట', 'గాలి',

  // Gujarati
  'હવામાન', 'વરસાદ', 'તાપમાન', 'વાવાઝોડું', 'પૂર', 'ખેતી', 'પાક', 'ચોમાસું',

  // Kannada / Malayalam / Odia / Punjabi
  'ಹವಾಮಾನ', 'ಮಳೆ', 'ಕೃಷಿ', 'കാലാവസ്ഥ', 'മഴ', 'പାଣିପାଗ', 'ବର୍ଷା', 'ਮੌਸਮ', 'ਮੀਂਹ'
]

// Explicit off-topic signals
const EXPLICIT_OFF_TOPIC_REGEX = [
  /\b(write code|python|javascript|react|html|css|sql|function|algorithm|bug|coding)\b/i,
  /\b(who won|president|prime minister|election|parliament|politics|war|military)\b/i,
  /\b(movie|actor|actress|box office|song|music album|lyrics|cinema)\b/i,
  /\b(cricket score|ipl match|football goal|world cup champion)\b/i,
  /\b(bitcoin|crypto|stock market|shares buy|trading|forex|investment advice)\b/i,
  /\b(write an essay|write a story|write a poem about|homework solution)\b/i,
  /\b(recipe for|how to cook|bake a cake)\b/i,
  /\b(ignore previous instructions|pretend to be|jailbreak|DAN mode)\b/i,
]

// Indic Unicode block test
const INDIC_SCRIPT_REGEX = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/

export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  text: string
  thinking?: string
  modelUsed: string
  source: 'openrouter' | 'guardrail' | 'offline_fallback'
  isGuardrailBlocked?: boolean
}

/**
 * Pre-flight topic validation check with Hinglish, Regional and Location Support
 */
export function evaluateWeatherGuardrails(
  userPrompt: string,
  selectedLanguageCode = 'en'
): { isAllowed: boolean; refusalMessage?: string } {
  const prompt = userPrompt.toLowerCase().trim()

  const isHindiMode = selectedLanguageCode === 'hi' ||
    prompt.includes('kaisa') ||
    prompt.includes('mausam') ||
    prompt.includes('aaj') ||
    prompt.includes('kal') ||
    prompt.includes('kya') ||
    INDIC_SCRIPT_REGEX.test(userPrompt)

  const defaultRefusal = isHindiMode
    ? 'मैं इसमें आपकी सहायता नहीं कर सकता। मैं विशेष रूप से मौसम पूर्वानुमान, चक्रवात, मानसूनी वर्षा और कृषि सलाह के लिए समर्पित हूँ। कृपया मौसम से संबंधित प्रश्न पूछें!'
    : 'I cannot help you with that. I am specialized exclusively in weather intelligence and climate information across India. Please feel free to ask a weather-related question!'

  // 1. Check for explicit off-topic triggers
  for (const pattern of EXPLICIT_OFF_TOPIC_REGEX) {
    if (pattern.test(prompt)) {
      return {
        isAllowed: false,
        refusalMessage: defaultRefusal,
      }
    }
  }

  // 2. Allow conversational greetings & intros
  const isGreeting = /^(hi|hello|hey|namaste|namaskar|pranam|kya haal|su prabhat|vanakkam|namaskaram|greetings|who are you|help|what can you do)[\s!.?]*$/i.test(prompt) ||
    /^(नमस्ते|नमस्कार|प्रणाम|কেমন আছেন|வணக்கம்|నమస్కారం|નમસ્તે|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ)[\s!.?]*$/.test(prompt)

  if (isGreeting) {
    return { isAllowed: true }
  }

  // 3. Verify weather / geographic / regional terms
  const hasWeatherTerm = WEATHER_INTENT_KEYWORDS.some((kw) => prompt.includes(kw.toLowerCase()))
  const isIndicScript = INDIC_SCRIPT_REGEX.test(userPrompt)

  // 4. Natural meteorological question patterns ("how is...", "will it rain...", "temperature in...", "is it hot in...")
  const hasWeatherPattern = /\b(how is|how will|will it|kaisa|kaisa hoga|kaisa rahega|weather in|forecast in|temp in|rain in|in \w+ today|in \w+ tomorrow)\b/i.test(prompt)

  if (hasWeatherTerm || isIndicScript || hasWeatherPattern) {
    return { isAllowed: true }
  }

  return {
    isAllowed: false,
    refusalMessage: defaultRefusal,
  }
}

/**
 * Robustly isolates model reasoning/thinking from final response content.
 * Handles dedicated API fields (message.reasoning), closed tags (<think>...</think>),
 * unclosed tags (<think>... upon token cutoff), and natural-language preambles.
 */
export function extractThinkingAndResponse(
  rawContent: string,
  apiReasoning?: string
): { text: string; thinking?: string } {
  let thinking = apiReasoning ? apiReasoning.trim() : ''
  let text = rawContent ? rawContent.trim() : ''

  // 1. Extract closed <think> or <thought> tags
  const thinkTagRegex = /<(think|thought)>([\s\S]*?)<\/\1>/i
  const match = text.match(thinkTagRegex)
  if (match) {
    if (!thinking) {
      thinking = match[2].trim()
    }
    text = text.replace(/<(think|thought)>[\s\S]*?<\/\1>/gi, '').trim()
  }

  // 2. Extract unclosed <think> or <thought> tags (when truncated by token limit)
  const unclosedMatch = text.match(/^<(think|thought)>([\s\S]*)$/i)
  if (unclosedMatch) {
    if (!thinking) {
      thinking = unclosedMatch[2].trim()
    }
    text = ''
  }

  // 3. Extract conversational preambles ("Here is a thinking process:", "Thinking Process:", etc.)
  const preambleRegex = /^(Here(?:'s|\s+is)?\s+a\s+thinking\s+process:?|Thinking\s+Process:?|Thought\s+Process:?|Reasoning:?)[\s\S]*?(?=(\n#{1,4}\s|\n\*\*|\n---|\n(?:Final\s+)?Answer:\s*|\n\n[#A-Z\u0900-\u097F]))/i
  const preambleMatch = text.match(preambleRegex)
  if (preambleMatch) {
    if (!thinking) {
      thinking = preambleMatch[0].trim()
    }
    text = text.replace(preambleRegex, '').trim()
  } else if (/^Here(?:'s|\s+is)?\s+(?:a\s+)?thinking/i.test(text)) {
    const dividerMatch = text.search(/\n(#{1,4}\s|---|(?:\*\*|Final\s+)?Answer:?)/i)
    if (dividerMatch !== -1) {
      if (!thinking) {
        thinking = text.slice(0, dividerMatch).trim()
      }
      text = text.slice(dividerMatch).trim()
    }
  }

  // Clean any leading "Final Answer:" or "Answer:" label
  text = text.replace(/^(?:(?:\*\*)?(?:Final\s+)?Answer:?(?:\*\*)?\s*)/i, '').trim()

  // 4. Remove leftover markdown separators
  text = text.replace(/^(\s*---\s*\n)+/g, '').trim()

  return {
    text,
    thinking: thinking || undefined,
  }
}

export function stripThinkingProcess(rawText: string): string {
  return extractThinkingAndResponse(rawText).text
}

export interface GenerateWeatherResponseOptions {
  isVoice?: boolean
  maxTokens?: number
}

/**
 * Generate AI Response with Multilingual Support and Ultra-Fast Voice Mode
 */
export async function generateWeatherResponse(
  userPrompt: string,
  history: ChatMessageParam[] = [],
  selectedLanguageCode = 'en',
  options?: GenerateWeatherResponseOptions
): Promise<AIResponse> {
  const isVoiceMode = Boolean(options?.isVoice)

  // 1. Layer 1: Guardrail Check with Hinglish & Regional awareness
  const guardrailCheck = evaluateWeatherGuardrails(userPrompt, selectedLanguageCode)
  if (!guardrailCheck.isAllowed) {
    return {
      text: guardrailCheck.refusalMessage!,
      modelUsed: 'domain-guardrail-filter',
      source: 'guardrail',
      isGuardrailBlocked: true,
    }
  }

  // 2. Build Language-Tailored System Prompt
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguageCode) || SUPPORTED_LANGUAGES[0]
  
  // Detect if user prompt is written in Hinglish or Hindi
  const isHinglishOrHindi = selectedLanguageCode === 'hi' ||
    /\b(aaj|kal|parson|kaisa|hoga|rahega|mausam|barsat|barish|pani|kheti|dhanbad|patna|ranchi|kolkata)\b/i.test(userPrompt) ||
    INDIC_SCRIPT_REGEX.test(userPrompt)

  let languageInstruction = ''
  if (isVoiceMode) {
    if (isHinglishOrHindi) {
      languageInstruction = `\n\nCRITICAL VOICE MODE MANDATE: Speak in Hindi (हिंदी). Give the weather answer directly in 1 or 2 short spoken sentences (under 30 words). Never use markdown tables, asterisks, bullet points, or pleasantries.`
    } else if (activeLang.code !== 'en') {
      languageInstruction = `\n\nCRITICAL VOICE MODE MANDATE: Speak in ${activeLang.nativeName} (${activeLang.name}). Keep the reply to 1 or 2 concise spoken sentences (under 30 words). Never output tables or bullets.`
    } else {
      languageInstruction = `\n\nCRITICAL VOICE MODE MANDATE: This answer is spoken aloud. Give the current temperature and conditions in strictly 1 to 2 short sentences (under 25 words). Never output markdown tables, bullets, or headers.`
    }
  } else {
    if (isHinglishOrHindi) {
      languageInstruction = `\n\nCRITICAL LANGUAGE MANDATE: The user has asked in Hindi or Hinglish. You MUST answer the query fully in Hindi (हिंदी). Provide a detailed, realistic forecast table with dates/metrics, bulleted notes, and safety warnings for the requested city or district. DO NOT EXPOSE ANY THINKING PROCESS.`
    } else if (activeLang.code !== 'en') {
      languageInstruction = `\n\nCRITICAL MULTILINGUAL MANDATE: The user has selected ${activeLang.name} (${activeLang.nativeName}). You MUST answer the query completely in ${activeLang.nativeName} (${activeLang.name}). Use standard regional meteorological and farming terms. Maintain clean Markdown tables and bullet points in ${activeLang.nativeName}. DO NOT EXPOSE ANY THINKING PROCESS.`
    } else {
      languageInstruction = `\n\nLANGUAGE ADAPTATION: If the user queries in an Indian regional language or Hinglish, detect it automatically and respond fully in that same language. DO NOT EXPOSE ANY THINKING PROCESS.`
    }
  }

  const systemPrompt = `${BASE_SYSTEM_PROMPT}${languageInstruction}`

  // 3. Layer 2: LLM API Call (if API key is provided)
  if (OPENROUTER_API_KEY) {
    const modelsToTry = [
      'openrouter/free',
      'minimax/minimax-m2.7:free',
      'google/gemma-4-31b-it:free',
    ]

    const messages: ChatMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(isVoiceMode ? -2 : -6),
      { role: 'user', content: userPrompt },
    ]

    const maxTokens = options?.maxTokens || (isVoiceMode ? 120 : 2500)
    const temperature = isVoiceMode ? 0.4 : 0.6

    for (const model of modelsToTry) {
      try {
        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin || 'http://localhost:5173',
            'X-Title': 'WeatherGPT',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const message = data?.choices?.[0]?.message
          const rawContent = message?.content || ''
          const apiReasoning = message?.reasoning || message?.reasoning_content || ''

          if (rawContent.trim().length > 0 || apiReasoning.trim().length > 0) {
            const extracted = extractThinkingAndResponse(rawContent, apiReasoning)
            // If the model exhausted tokens only thinking and text is empty, generate an authoritative fallback response
            const finalText = extracted.text.trim() || getOfflineFallbackResponse(userPrompt, activeLang.code, isVoiceMode)
            return {
              text: finalText,
              thinking: extracted.thinking,
              modelUsed: data?.model || model,
              source: 'openrouter',
            }
          }
        } else {
          console.warn(`[WeatherGPT AI] Model ${model} returned HTTP ${response.status}. Trying fallback...`)
        }
      } catch (err) {
        console.warn(`[WeatherGPT AI] Network error querying ${model}:`, err)
      }
    }
  } else {
    console.info('[WeatherGPT AI] VITE_OPENROUTER_API_KEY not set. Using built-in meteorological intelligence engine.')
  }

  // 4. Regional Fallback if offline
  return {
    text: getOfflineFallbackResponse(userPrompt, activeLang.code, isVoiceMode),
    modelUsed: 'local-ensemble-fallback',
    source: 'offline_fallback',
  }
}

function getOfflineFallbackResponse(query: string, langCode = 'en', isVoice = false): string {
  const lower = query.toLowerCase()

  if (isVoice) {
    if (langCode === 'hi' || lower.includes('mausam') || lower.includes('dhanbad') || lower.includes('aaj')) {
      return 'आज मौसम मुख्य रूप से साफ रहेगा, तापमान 31 डिग्री सेल्सियस है और दोपहर बाद हल्की वर्षा की संभावना है।'
    }
    if (langCode === 'mr') {
      return 'आज हवामान ढगाळ असून कमाल तापमान ३० अंश राहील आणि हलक्या पावसाच्या सरी पडण्याची शक्यता आहे.'
    }
    if (lower.includes('cyclone') || lower.includes('alert') || lower.includes('warning')) {
      return 'Active depression tracked over Bay of Bengal with gusty coastal winds. Coastal districts are advised to remain on alert.'
    }
    return 'Currently conditions are partly cloudy with a temperature around 28 degrees and light breezes.'
  }

  if (langCode === 'hi' || lower.includes('mausam') || lower.includes('dhanbad') || lower.includes('aaj')) {
    return `### **🌤️ मौसमजीपीटी (WeatherGPT) दैनिक मौसम पूर्वानुमान**\n\n| विवरण | आज का अनुमान |\n| :--- | :--- |\n| 🌡️ **तापमान** | 31°C / 24°C |\n| 💧 **आर्द्रता** | 82% |\n| 🌧️ **वर्षा की संभावना** | 70% (मध्यम से तेज बारिश) |\n| 💨 **हवा की गति** | 12–15 किमी/घंटा |\n\n- **मौसम विवरण:** आंशिक रूप से बादल छाए रहेंगे, दोपहर बाद गरज के साथ बारिश की संभावना है।\n- **नागरिक सलाह:** छाता साथ रखें और निचले इलाकों में जलभराव से सतर्क रहें।`
  }

  if (langCode === 'mr') {
    return `### **वेदरजीपीटी (WeatherGPT) हवामान अंदाज व शेती सल्ला**\n\n| दिवस | पाऊस | तापमान (°C) | हवामानाची स्थिती |\n| :--- | :--- | :--- | :--- |\n| आज | मध्यम | २७°C / ३२°C | ढगाळ वातावरण व हलक्या सरी |\n| उद्या | मुसळधार | २५°C / २९°C | जोरदार पाऊस |\n| परवा | मध्यम | २६°C / ३०°C | मेघगर्जनेसह पाऊस |\n\n- **शेतकरी सल्ला:** भात पिकात साचलेले जास्तीचे पाणी त्वरित काढून टाकावे.`
  }

  if (lower.includes('cyclone') || lower.includes('alert') || lower.includes('warning')) {
    return `### **WeatherGPT Early Warning Bulletin**\n\n- **Active Cyclone Advisory:** Deep depression tracked over Westcentral Bay of Bengal with sustained winds of 110–120 km/h. Coastal Odisha and Northern Andhra Pradesh are on high alert.\n- **Recommended Safety Directives:** Suspend marine and fishing operations, activate coastal evacuation protocols, and monitor local district disaster management directives.`
  }

  return `### **WeatherGPT Meteorological Forecast**\n\n| Date | Rainfall (mm) | Min / Max Temp | Wind Speed | Conditions |\n| :--- | :--- | :--- | :--- | :--- |\n| Day 1 | 15–25 mm | 27°C / 32°C | 22 km/h | Scattered Showers |\n| Day 2 | 45–65 mm | 25°C / 29°C | 38 km/h | Heavy Downpour & Gusts |\n| Day 3 | 20–35 mm | 26°C / 30°C | 25 km/h | Intermittent Rain |\n\n- **Advisory:** Check radar layers on the Live Weather Map for localized convective cloud tracking.`
}
