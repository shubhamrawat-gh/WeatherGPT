import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  bcp47: string
  samplePrompt: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN', samplePrompt: 'What is the 3-day rainfall forecast for Mumbai?' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', bcp47: 'hi-IN', samplePrompt: 'मुंबई में अगले 3 दिनों में कितनी बारिश होगी?' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN', samplePrompt: 'पुणे आणि कोकणात पुढील ३ दिवसांचा पावसाचा अंदाज काय आहे?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', samplePrompt: 'বঙ্গোপসাগরে কি কোনো ঘূর্ণিঝড়ের সতর্কতা আছে?' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN', samplePrompt: 'ગુજરાત દરિયાકાંઠે મોજા અને પવનની ચેતવણી શું છે?' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', samplePrompt: 'சென்னையில் அடுத்த 3 நாட்களுக்கு மழை முன்னறிவிப்பு என்ன?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', samplePrompt: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో వర్షపాత సూచన ఏమిటి?' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', samplePrompt: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಏನು?' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', samplePrompt: 'കേരള തീരത്ത് മഴ മുന്നറിയിപ്പുകൾ ഉണ്ടോ?' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', bcp47: 'or-IN', samplePrompt: 'ଓଡ଼ିଶା ଉପକୂଳରେ ବାତ୍ୟା ସତର୍କତା ବିଷୟରେ ଜଣାନ୍ତୁ?' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN', samplePrompt: 'ਪੰਜਾਬ ਵਿੱਚ ਸਾਉਣੀ ਦੀ ਫ਼ਸਲ ਲਈ ਮੌਸਮ ਸਲਾਹ ਕੀ ਹੈ?' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', bcp47: 'as-IN', samplePrompt: 'ব্ৰহ্মপুত্ৰ উপত্যকাত বানপানীৰ স্থিতি কেনেকুৱা?' },
]

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.contact': 'Contact',
    'nav.login': 'Sign In',
    'nav.dashboard': 'Dashboard',
    'nav.launchConsole': 'Launch Console',

    // Sidebar
    'sidebar.chats': 'Chats',
    'sidebar.map': 'Live Weather Map',
    'sidebar.alerts': 'Alerts & Warnings',
    'sidebar.climate': 'Climate Analytics',
    'sidebar.settings': 'Settings & Units',
    'sidebar.darkMode': 'Dark Mode',
    'sidebar.lightMode': 'Light Mode',
    'sidebar.logout': 'Sign Out',
    'sidebar.role': 'Weather Analyst',
    'sidebar.activeCount': 'Active',

    // Chat Assistant
    'chat.voice': 'Voice',
    'chat.liveVoice': 'Live Voice',
    'chat.newChat': 'Start a new conversation',
    'chat.title': 'WeatherGPT',
    'chat.subtitle': 'How can I help you today?',
    'chat.placeholder': 'Ask WeatherGPT about rainfall, cyclones, heatwaves, or local alerts...',
    'chat.metAnalysis': 'Met Analysis & Radar Telemetry',
    'chat.copy': 'Copy response',
    'chat.copied': 'Copied!',
    'chat.speak': 'Read aloud',
    'chat.stopSpeak': 'Stop speaking',
    'chat.disclaimer': 'WeatherGPT is grounded in live IMD & MoES telemetry. Always cross-verify critical advisories with official bulletins.',
    'chat.thinkingWords': 'Analyzing Doppler telemetry...|Synthesizing regional radar...|Cross-referencing alerts...|Generating meteorological bulletin...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'Climate Map & Disaster GIS',
    'map.bulletins': 'IMD Bulletins',
    'map.radars': 'Doppler Radars Active',
    'map.quakes': 'USGS Live Quakes',
    'map.focus': 'Focus:',
    'map.projection': 'Projection: Web Mercator',
    'map.mounting': 'Mounting Mapbox GL JS Engine...',

    // Alerts Page
    'alerts.title': 'Active Severe Weather Bulletins',
    'alerts.subtitle': 'Real-time severe weather warnings and meteorological advisories across India.',
    'alerts.searchPlaceholder': 'Search alerts by region, state, or event...',
    'alerts.all': 'All Alerts',
    'alerts.extreme': 'Extreme',
    'alerts.severe': 'Severe',
    'alerts.moderate': 'Moderate',
    'alerts.minor': 'Minor',
    'alerts.extremeLabel': 'Extreme Warnings',
    'alerts.severeLabel': 'Severe Advisories',
    'alerts.moderateLabel': 'Moderate Watches',
    'alerts.minorLabel': 'Minor Bulletins',
    'alerts.noAlerts': 'No active alerts matching your filter criteria.',

    // Climate Page
    'climate.title': 'Climate Analytics & Monsoon Ledger',
    'climate.season': 'Season: Southwest Monsoon (Kharif) · Baseline: 1971–2020 LPA',
    'climate.lpaTitle': 'All-India Monsoon LPA',
    'climate.lpaSub': '+4.2% Departure (Normal Category)',
    'climate.anomalyTitle': 'Annual Mean Temp Anomaly',
    'climate.anomalySub': 'Above normal baseline trend',
    'climate.subdivisionsTitle': 'Active Subdivisions',
    'climate.subdivisionsSub': 'Reporting normal to excess rain',

    // Settings Page
    'settings.title': 'Console & Telemetry Settings',
    'settings.themeTitle': 'Theme & Visual Appearance',
    'settings.themeDesc': 'Choose between high-contrast dark operations console, clean daylight mode, or automatic system sync.',
    'settings.langTitle': 'Regional Language & Speech',
    'settings.langDesc': 'Select the primary language for the entire user interface and spoken voice assistant.',
    'settings.saveButton': 'Save Preferences',
    'settings.saved': 'Saved Successfully!',
    'settings.dark': 'Dark Mode',
    'settings.light': 'Light Mode',
  },

  hi: {
    // Nav
    'nav.home': 'होम',
    'nav.features': 'विशेषताएं',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉग इन करें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.launchConsole': 'कंसोल खोलें',

    // Sidebar
    'sidebar.chats': 'चैट्स',
    'sidebar.map': 'लाइव मौसम मानचित्र',
    'sidebar.alerts': 'चेतावनी एवं अलर्ट',
    'sidebar.climate': 'जलवायु विश्लेषण',
    'sidebar.settings': 'सेटिंग्स एवं इकाइयां',
    'sidebar.darkMode': 'डार्क मोड',
    'sidebar.lightMode': 'लाइट मोड',
    'sidebar.logout': 'साइन आउट',
    'sidebar.role': 'मौसम विश्लेषक',
    'sidebar.activeCount': 'सक्रिय',

    // Chat Assistant
    'chat.voice': 'आवाज़',
    'chat.liveVoice': 'लाइव आवाज़',
    'chat.newChat': 'नई बातचीत शुरू करें',
    'chat.title': 'वेदरजीपीटी (WeatherGPT)',
    'chat.subtitle': 'आज मैं आपकी क्या सहायता कर सकता हूँ?',
    'chat.placeholder': 'बारिश, चक्रवात, लू या स्थानीय मौसम अलर्ट के बारे में पूछें...',
    'chat.metAnalysis': 'मौसम विश्लेषण एवं रडार टेलीमेट्री',
    'chat.copy': 'कॉपी करें',
    'chat.copied': 'कॉपी हो गया!',
    'chat.speak': 'सुनें',
    'chat.stopSpeak': 'आवाज़ रोकें',
    'chat.disclaimer': 'वेदरजीपीटी भारतीय मौसम विभाग (IMD) और MoES के लाइव डेटा पर आधारित है। आधिकारिक बुलेटिन से पुष्टि अवश्य करें।',
    'chat.thinkingWords': 'डॉपलर डेटा का विश्लेषण जारी...|क्षेत्रीय रडार समीक्षा...|सक्रिय अलर्ट मिलान...|मौसम बुलेटिन तैयार हो रहा है...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'जलवायु मानचित्र एवं आपदा जीआईएस',
    'map.bulletins': 'IMD बुलेटिन',
    'map.radars': 'डॉपलर रडार सक्रिय',
    'map.quakes': 'भूकंप लाइव',
    'map.focus': 'फोकस:',
    'map.projection': 'प्रोजेक्शन: वेब मर्केटर',
    'map.mounting': 'मैप इंजन लोड हो रहा है...',

    // Alerts Page
    'alerts.title': 'सक्रिय गंभीर मौसम अलर्ट',
    'alerts.subtitle': 'भारत भर में वास्तविक समय में गंभीर मौसम एवं आपदा चेतावनियां।',
    'alerts.searchPlaceholder': 'राज्य, जिला या घटना के अनुसार खोजें...',
    'alerts.all': 'सभी अलर्ट',
    'alerts.extreme': 'अत्यधिक गंभीर',
    'alerts.severe': 'गंभीर',
    'alerts.moderate': 'मध्यम',
    'alerts.minor': 'सामान्य',
    'alerts.extremeLabel': 'अत्यधिक गंभीर चेतावनियां',
    'alerts.severeLabel': 'गंभीर मौसम सलाह',
    'alerts.moderateLabel': 'मध्यम सतर्कता',
    'alerts.minorLabel': 'सामान्य बुलेटिन',
    'alerts.noAlerts': 'इस श्रेणी में कोई सक्रिय चेतावनी नहीं मिली।',

    // Climate Page
    'climate.title': 'जलवायु विश्लेषण एवं मानसून बहीखाता',
    'climate.season': 'सत्र: दक्षिण-पश्चिम मानसून (खरीफ) · आधार रेखा: 1971–2020 LPA',
    'climate.lpaTitle': 'अखिल भारतीय मानसून LPA',
    'climate.lpaSub': '+4.2% सामान्य से अधिक वर्षा',
    'climate.anomalyTitle': 'औसत तापमान विसंगति',
    'climate.anomalySub': 'सामान्य से ऊपर तापमान',
    'climate.subdivisionsTitle': 'सक्रिय मौसम उपमंडल',
    'climate.subdivisionsSub': 'सामान्य या अतिरिक्त वर्षा दर्ज',

    // Settings Page
    'settings.title': 'कंसोल एवं टेलीमेट्री सेटिंग्स',
    'settings.themeTitle': 'थीम एवं स्वरूप',
    'settings.themeDesc': 'डार्क मोड या लाइट मोड में से अपनी पसंद चुनें।',
    'settings.langTitle': 'क्षेत्रीय भाषा एवं वाणी',
    'settings.langDesc': 'संपूर्ण वेबसाइट और वॉयस असिस्टेंट के लिए प्राथमिक भाषा चुनें।',
    'settings.saveButton': 'प्राथमिकताएं सहेजें',
    'settings.saved': 'सफलतापूर्वक सहेजा गया!',
    'settings.dark': 'डार्क मोड',
    'settings.light': 'लाइट मोड',
  },

  mr: {
    // Nav
    'nav.home': 'मुख्यपृष्ठ',
    'nav.features': 'वैशिष्ट्ये',
    'nav.howItWorks': 'हे कसे कार्य करते',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉग इन करा',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.launchConsole': 'कन्सोल सुरू करा',

    // Sidebar
    'sidebar.chats': 'गप्पा',
    'sidebar.map': 'थेट हवामान नकाशा',
    'sidebar.alerts': 'इशारे आणि चेतावणी',
    'sidebar.climate': 'हवामान विश्लेषण',
    'sidebar.settings': 'सेटिंग्ज आणि युनिट्स',
    'sidebar.darkMode': 'डार्क मोड',
    'sidebar.lightMode': 'लाइट मोड',
    'sidebar.logout': 'साइन आउट करा',
    'sidebar.role': 'हवामान विश्लेषक',
    'sidebar.activeCount': 'सक्रिय',

    // Chat Assistant
    'chat.voice': 'आवाज',
    'chat.liveVoice': 'थेट आवाज',
    'chat.newChat': 'नवीन संभाषण सुरू करा',
    'chat.title': 'वेदरजीपीटी (WeatherGPT)',
    'chat.subtitle': 'आज मी तुम्हाला कशी मदत करू शकतो?',
    'chat.placeholder': 'पाऊस, चक्रीवादळ, उष्णतेची लाट किंवा स्थानिक हवामानाबद्दल विचारा...',
    'chat.metAnalysis': 'हवामान विश्लेषण आणि रडार टेलिमेट्री',
    'chat.copy': 'प्रत करा',
    'chat.copied': 'प्रत केली!',
    'chat.speak': 'ऐका',
    'chat.stopSpeak': 'थांबवा',
    'chat.disclaimer': 'वेदरजीपीटी थेट हवामान विभाग (IMD) आणि MoES टेलिमेट्रीवर आधारित आहे.',
    'chat.thinkingWords': 'डॉप्लर रडार तपासत आहे...|हवामान डेटाचे विश्लेषण सुरू आहे...|चेतावणींची पडताळणी होत आहे...|हवामान अंदाज तयार करत आहे...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'थेट हवामान नकाशा आणि आपत्ती जीआयएस',
    'map.bulletins': 'IMD बुलेटिन',
    'map.radars': 'डॉप्लर रडार सक्रिय',
    'map.quakes': 'भूकंप निरीक्षण',
    'map.focus': 'लक्ष्य:',
    'map.projection': 'प्रोजेक्शन: वेब मर्केटर',
    'map.mounting': 'नकाशा इंजिन लोड होत आहे...',

    // Alerts Page
    'alerts.title': 'सक्रिय तीव्र हवामान इशारे',
    'alerts.subtitle': 'महाराष्ट्र आणि देशभरातील थेट तीव्र हवामान इशारे.',
    'alerts.searchPlaceholder': 'जिल्हा, राज्य किंवा घटनेनुसार शोधा...',
    'alerts.all': 'सर्व इशारे',
    'alerts.extreme': 'अत्यंत तीव्र',
    'alerts.severe': 'गंभीर',
    'alerts.moderate': 'मध्यम',
    'alerts.minor': 'किरकोळ',
    'alerts.extremeLabel': 'अत्यंत तीव्र चेतावणी',
    'alerts.severeLabel': 'गंभीर हवामान सूचना',
    'alerts.moderateLabel': 'मध्यम इशारा',
    'alerts.minorLabel': 'किरकोळ सूचना',
    'alerts.noAlerts': 'कोणतेही इशारे उपलब्ध नाहीत.',

    // Climate Page
    'climate.title': 'हवामान विश्लेषण आणि मान्सून नोंद',
    'climate.season': 'हंगाम: नैऋत्य मान्सून (खरीप)',
    'climate.lpaTitle': 'अखिल भारतीय मान्सून LPA',
    'climate.lpaSub': '+४.२% सरासरीपेक्षा जास्त पाऊस',
    'climate.anomalyTitle': 'तापमान विसंगती',
    'climate.anomalySub': 'सरासरीपेक्षा किंचित जास्त',
    'climate.subdivisionsTitle': 'सक्रिय उपविभाग',
    'climate.subdivisionsSub': 'सामान्य किंवा अतिरिक्त पावसाची नोंद',

    // Settings Page
    'settings.title': 'कन्सोल आणि टेलिमेट्री सेटिंग्ज',
    'settings.themeTitle': 'थीम आणि देखावा',
    'settings.themeDesc': 'डार्क मोड किंवा लाइट मोड निवडा.',
    'settings.langTitle': 'प्रादेशिक भाषा आणि आवाज',
    'settings.langDesc': 'संपूर्ण वेबसाइट आणि बोलणाऱ्या सहाय्यकासाठी भाषा निवडा.',
    'settings.saveButton': 'बदल जतन करा',
    'settings.saved': 'यशस्वीरित्या जतन झाले!',
    'settings.dark': 'डार्क मोड',
    'settings.light': 'लाइट मोड',
  },

  bn: {
    // Nav
    'nav.home': 'হোম',
    'nav.features': 'বৈশিষ্ট্যসমূহ',
    'nav.howItWorks': 'কীভাবে কাজ করে',
    'nav.contact': 'যোগাযোগ',
    'nav.login': 'সাইন ইন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.launchConsole': 'কনসোল খুলুন',

    // Sidebar
    'sidebar.chats': 'চ্যাট',
    'sidebar.map': 'লাইভ আবহাওয়া মানচিত্র',
    'sidebar.alerts': 'সতর্কবার্তা ও পূর্বাভাস',
    'sidebar.climate': 'জলবায়ু বিশ্লেষণ',
    'sidebar.settings': 'সেটিংস ও একক',
    'sidebar.darkMode': 'ডার্ক মোড',
    'sidebar.lightMode': 'লাইট মোড',
    'sidebar.logout': 'সাইন আউট',
    'sidebar.role': 'আবহাওয়া বিশ্লেষক',
    'sidebar.activeCount': 'সক্রিয়',

    // Chat Assistant
    'chat.voice': 'ভয়েস',
    'chat.liveVoice': 'লাইভ ভয়েস',
    'chat.newChat': 'নতুন কথোপকথন',
    'chat.title': 'ওয়েদারজিপিটি (WeatherGPT)',
    'chat.subtitle': 'আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
    'chat.placeholder': 'বৃষ্টিপাত, ঘূর্ণিঝড়, তাপদাহ বা স্থানীয় আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন...',
    'chat.metAnalysis': 'আবহাওয়া বিশ্লেষণ ও রাডার তথ্য',
    'chat.copy': 'কপি করুন',
    'chat.copied': 'কপি হয়েছে!',
    'chat.speak': 'শুনুন',
    'chat.stopSpeak': 'বন্ধ করুন',
    'chat.disclaimer': 'ওয়েদারজিপিটি সরাসরি আইএমডি ও MoES তথ্যের ওপর ভিত্তি করে কাজ করে।',
    'chat.thinkingWords': 'ডপলার রাডার পর্যবেক্ষণ করা হচ্ছে...|আঞ্চলিক তথ্য বিশ্লেষণ চলছে...|সতর্কবার্তা যাচাই করা হচ্ছে...|আবহাওয়া বুলেটিন প্রস্তুত হচ্ছে...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'লাইভ আবহাওয়া ও দুর্যোগ মানচিত্র',
    'map.bulletins': 'IMD বুলেটিন',
    'map.radars': 'ডপলার রাডার সক্রিয়',
    'map.quakes': 'ভূমিকম্প পর্যবেক্ষণ',
    'map.focus': 'ফোকাস:',
    'map.projection': 'প্রজেকশন: ওয়েব মার্কেটর',
    'map.mounting': 'ম্যাপ ইঞ্জিন লোড হচ্ছে...',

    // Alerts Page
    'alerts.title': 'সক্রিয় তীব্র আবহাওয়া সতর্কবার্তা',
    'alerts.subtitle': 'সমগ্র ভারতের রিয়েল-টাইম তীব্র আবহাওয়া ও দুর্যোগ সতর্কতা।',
    'alerts.searchPlaceholder': 'অঞ্চল, জেলা বা ঘটনা অনুযায়ী খুঁজুন...',
    'alerts.all': 'সমস্ত সতর্কতা',
    'alerts.extreme': 'চরম বিপদ',
    'alerts.severe': 'গুরুতর',
    'alerts.moderate': 'মাঝারি',
    'alerts.minor': 'স্বাভাবিক',
    'alerts.extremeLabel': 'চরম বিপদ সংকেত',
    'alerts.severeLabel': 'গুরুতর সতর্কতা',
    'alerts.moderateLabel': 'মাঝারি সতর্কতা',
    'alerts.minorLabel': 'সাধারণ বুলেটিন',
    'alerts.noAlerts': 'কোনো সক্রিয় সতর্কতা পাওয়া যায়নি।',

    // Climate Page
    'climate.title': 'জলবায়ু বিশ্লেষণ ও বর্ষার খতিয়ান',
    'climate.season': 'ঋতু: দক্ষিণ-পশ্চিম মৌসুমি বায়ু',
    'climate.lpaTitle': 'সর্বভারতীয় মৌসুমি LPA',
    'climate.lpaSub': '+৪.২% স্বাভাবিকের চেয়ে বেশি বৃষ্টি',
    'climate.anomalyTitle': 'তাপমাত্রার অসঙ্গতি',
    'climate.anomalySub': 'স্বাভাবিকের তুলনায় সামান্য বেশি',
    'climate.subdivisionsTitle': 'সক্রিয় আবহাওয়া মণ্ডল',
    'climate.subdivisionsSub': 'স্বাভাবিক বা অতিরিক্ত বৃষ্টি রেকর্ড করা হয়েছে',

    // Settings Page
    'settings.title': 'কনসোল ও পরিমাপ সেটিংস',
    'settings.themeTitle': 'থিম এবং প্রদর্শন',
    'settings.themeDesc': 'ডার্ক মোড বা লাইট মোড পছন্দ করুন।',
    'settings.langTitle': 'আঞ্চলিক ভাষা ও ভয়েস',
    'settings.langDesc': 'ওয়েবসাইট এবং ভয়েস সহকারীর জন্য প্রাথমিক ভাষা নির্বাচন করুন।',
    'settings.saveButton': 'পছন্দগুলি সংরক্ষণ করুন',
    'settings.saved': 'সফলভাবে সংরক্ষিত হয়েছে!',
    'settings.dark': 'ডার্ক মোড',
    'settings.light': 'লাইট মোড',
  },

  gu: {
    // Nav
    'nav.home': 'મુખ્ય પૃષ્ઠ',
    'nav.features': 'વિશેષતાઓ',
    'nav.howItWorks': 'કેવી રીતે કાર્ય કરે છે',
    'nav.contact': 'સંપર્ક',
    'nav.login': 'સાઇન ઇન',
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.launchConsole': 'કન્સોલ શરૂ કરો',

    // Sidebar
    'sidebar.chats': 'વાતચીત',
    'sidebar.map': 'લાઇવ હવામાન નકશો',
    'sidebar.alerts': 'ચેતવણીઓ અને એલર્ટ',
    'sidebar.climate': 'આબોહવા વિશ્લેષણ',
    'sidebar.settings': 'સેટિંગ્સ અને એકમો',
    'sidebar.darkMode': 'ડાર્ક મોડ',
    'sidebar.lightMode': 'લાઇટ મોડ',
    'sidebar.logout': 'સાઇન આઉટ',
    'sidebar.role': 'હવામાન વિશ્લેષક',
    'sidebar.activeCount': 'સક્રિય',

    // Chat Assistant
    'chat.voice': 'અવાજ',
    'chat.liveVoice': 'લાઇવ અવાજ',
    'chat.newChat': 'નવી વાતચીત શરૂ કરો',
    'chat.title': 'વેધરજીપીટી (WeatherGPT)',
    'chat.subtitle': 'આજે હું તમારી કેવી રીતે મદદ કરી શકું?',
    'chat.placeholder': 'વરસાદ, વાવાઝોડું, ગરમીની લહેર અથવા સ્થાનિક હવામાન વિશે પૂછો...',
    'chat.metAnalysis': 'હવામાન વિશ્લેષણ અને રડાર ટેલિમેટ્રી',
    'chat.copy': 'કોપી કરો',
    'chat.copied': 'કોપી થયું!',
    'chat.speak': 'સાંભળો',
    'chat.stopSpeak': 'રોકો',
    'chat.disclaimer': 'વેધરજીપીટી IMD અને MoES ના લાઇવ ટેલિમેટ્રી ડેટા પર આધારિત છે.',
    'chat.thinkingWords': 'ડૉપ્લર રડારનું વિશ્લેષણ ચાલુ છે...|સ્થાનિક ડેટાની સમીક્ષા...|ચેતવણીઓની ચકાસણી...|હવામાન બુલેટિન તૈયાર થઈ રહ્યું છે...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'લાઇવ હવામાન નકશો અને આપત્તિ જીઆઈએસ',
    'map.bulletins': 'IMD બુલેટિન',
    'map.radars': 'ડૉપ્લર રડાર સક્રિય',
    'map.quakes': 'ધરતીકંપ લાઇવ',
    'map.focus': 'કેન્દ્ર:',
    'map.projection': 'પ્રોજેક્શન: વેબ મર્કેટર',
    'map.mounting': 'નકશો લોડ થઈ રહ્યો છે...',

    // Alerts Page
    'alerts.title': 'સક્રિય ગંભીર હવામાન ચેતવણીઓ',
    'alerts.subtitle': 'સમગ્ર ભારતમાં વાસ્તવિક સમયની ગંભીર હવામાન ચેતવણીઓ.',
    'alerts.searchPlaceholder': 'જિલ્લો, રાજ્ય અથવા ઘટના મુજબ શોધો...',
    'alerts.all': 'બધી ચેતવણીઓ',
    'alerts.extreme': 'અત્યંત ગંભીર',
    'alerts.severe': 'ગંભીર',
    'alerts.moderate': 'મધ્યમ',
    'alerts.minor': 'સામાન્ય',
    'alerts.extremeLabel': 'અત્યંત ગંભીર ચેતવણીઓ',
    'alerts.severeLabel': 'ગંભીર હવામાન સલાહ',
    'alerts.moderateLabel': 'મધ્યમ સાવચેતી',
    'alerts.minorLabel': 'સામાન્ય બુલેટિન',
    'alerts.noAlerts': 'કોઈ સક્રિય ચેતવણી મળી નથી.',

    // Climate Page
    'climate.title': 'આબોહવા વિશ્લેષણ અને ચોમાસાનું સરવૈયું',
    'climate.season': 'ઋતુ: નૈઋત્યનું ચોમાસું (ખરીફ)',
    'climate.lpaTitle': 'અખિલ ભારતીય ચોમાસુ LPA',
    'climate.lpaSub': '+૪.૨% સામાન્યથી વધુ વરસાદ',
    'climate.anomalyTitle': 'તાપમાન અસાધારણતા',
    'climate.anomalySub': 'સામાન્ય કરતાં થોડું ઊંચું તાપમાન',
    'climate.subdivisionsTitle': 'સક્રિય હવામાન પેટાવિભાગો',
    'climate.subdivisionsSub': 'સામાન્ય કે વધુ વરસાદ નોંધાયો',

    // Settings Page
    'settings.title': 'કન્સોલ અને ટેલિમેટ્રી સેટિંગ્સ',
    'settings.themeTitle': 'થીમ અને દેખાવ',
    'settings.themeDesc': 'ડાર્ક મોડ અથવા લાઇટ મોડ પસંદ કરો.',
    'settings.langTitle': 'પ્રાદેશિક ભાષા અને અવાજ',
    'settings.langDesc': 'સમગ્ર વેબસાઇટ અને વૉઇસ આસિસ્ટન્ટ માટે મુખ્ય ભાષા પસંદ કરો.',
    'settings.saveButton': 'પસંદગીઓ સાચવો',
    'settings.saved': 'સફળતાપૂર્વક સાચવવામાં આવ્યું!',
    'settings.dark': 'ડાર્ક મોડ',
    'settings.light': 'લાઇટ મોડ',
  },

  ta: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.features': 'அம்சங்கள்',
    'nav.howItWorks': 'எப்படி செயல்படுகிறது',
    'nav.contact': 'தொடர்பு',
    'nav.login': 'உள்நுழைக',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.launchConsole': 'கன்சோலைத் திறக்க',

    // Sidebar
    'sidebar.chats': 'அரட்டைகள்',
    'sidebar.map': 'நேரலை வானிலை வரைபடம்',
    'sidebar.alerts': 'எச்சரிக்கைகள் & அறிவிப்புகள்',
    'sidebar.climate': 'காலநிலை பகுப்பாய்வு',
    'sidebar.settings': 'அமைப்புகள் & அளவீடுகள்',
    'sidebar.darkMode': 'இருள் பயன்முறை',
    'sidebar.lightMode': 'ஒளி பயன்முறை',
    'sidebar.logout': 'வெளியேறு',
    'sidebar.role': 'வானிலை ஆய்வாளர்',
    'sidebar.activeCount': 'செயலில்',

    // Chat Assistant
    'chat.voice': 'குரல்',
    'chat.liveVoice': 'நேரலை குரல்',
    'chat.newChat': 'புதிய உரையாடலைத் தொடங்கு',
    'chat.title': 'வெதர்கிபிடி (WeatherGPT)',
    'chat.subtitle': 'இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    'chat.placeholder': 'மழை, புயல், வெப்ப அலை அல்லது உள்ளூர் வானிலை பற்றி கேட்கவும்...',
    'chat.metAnalysis': 'வானிலை பகுப்பாய்வு & ரேடார் அளவீடுகள்',
    'chat.copy': 'நகலெடு',
    'chat.copied': 'நகலெடுக்கப்பட்டது!',
    'chat.speak': 'கேட்க',
    'chat.stopSpeak': 'நிறுத்து',
    'chat.disclaimer': 'வெதர்கிபிடி நேரலை IMD மற்றும் MoES தரவுகளின் அடிப்படையில் இயங்குகிறது.',
    'chat.thinkingWords': 'டாப்ளர் ரேடார் பகுப்பாய்வு செய்யப்படுகிறது...|பிராந்திய தரவு சரிபார்க்கப்படுகிறது...|எச்சரிக்கைகள் பகுப்பாய்வு செய்யப்படுகிறது...|வானிலை அறிக்கை தயாராகிறது...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'நேரலை வானிலை வரைபடம் & பேரிடர் ஜிஐஎஸ்',
    'map.bulletins': 'IMD அறிக்கைகள்',
    'map.radars': 'செயலில் உள்ள ரேடார்கள்',
    'map.quakes': 'நிலநடுக்க நேரலை',
    'map.focus': 'கவனம்:',
    'map.projection': 'வரைபட காட்சி: வெப் மெர்கேட்டர்',
    'map.mounting': 'வரைபடம் ஏற்றப்படுகிறது...',

    // Alerts Page
    'alerts.title': 'தீவிர வானிலை எச்சரிக்கைகள்',
    'alerts.subtitle': 'இந்தியா முழுவதும் நிகழ்நேர தீவிர வானிலை மற்றும் பேரிடர் எச்சரிக்கைகள்.',
    'alerts.searchPlaceholder': 'மாவட்டம், மாநிலம் அல்லது நிகழ்வு மூலம் தேடவும்...',
    'alerts.all': 'அனைத்து எச்சரிக்கைகளும்',
    'alerts.extreme': 'அதிதீவிரம்',
    'alerts.severe': 'தீவிரம்',
    'alerts.moderate': 'மிதமான',
    'alerts.minor': 'குறைந்த',
    'alerts.extremeLabel': 'அதிதீவிர எச்சரிக்கைகள்',
    'alerts.severeLabel': 'தீவிர வானிலை எச்சரிக்கைகள்',
    'alerts.moderateLabel': 'மிதமான கண்காணிப்பு',
    'alerts.minorLabel': 'வழக்கமான அறிக்கைகள்',
    'alerts.noAlerts': 'செயலில் உள்ள எச்சரிக்கைகள் எதுவும் இல்லை.',

    // Climate Page
    'climate.title': 'காலநிலை பகுப்பாய்வு & பருவமழை கணக்கு',
    'climate.season': 'பருவம்: தென்மேற்கு பருவமழை (காரிஃப்)',
    'climate.lpaTitle': 'அகில இந்திய பருவமழை LPA',
    'climate.lpaSub': '+4.2% இயல்பை விட கூடுதல் மழை',
    'climate.anomalyTitle': 'வெப்பநிலை விலகல்',
    'climate.anomalySub': 'இயல்பை விட சற்று அதிகம்',
    'climate.subdivisionsTitle': 'செயலில் உள்ள மண்டலங்கள்',
    'climate.subdivisionsSub': 'இயல்பான அல்லது கூடுதல் மழை பதிவு',

    // Settings Page
    'settings.title': 'கன்சோல் & தொலைத்தொடர்பு அமைப்புகள்',
    'settings.themeTitle': 'தீம் மற்றும் தோற்றம்',
    'settings.themeDesc': 'டார்க் மோட் அல்லது லைட் மோடைத் தேர்ந்தெடுக்கவும்.',
    'settings.langTitle': 'பிராந்திய மொழி & குரல்',
    'settings.langDesc': 'முழு தளம் மற்றும் குரல் உதவியாளருக்கான மொழியைத் தேர்ந்தெடுக்கவும்.',
    'settings.saveButton': 'அமைப்புகளைச் சேமிக்கவும்',
    'settings.saved': 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
    'settings.dark': 'இருள் பயன்முறை',
    'settings.light': 'ஒளி பயன்முறை',
  },

  te: {
    // Nav
    'nav.home': 'హోమ్',
    'nav.features': 'ఫీచర్లు',
    'nav.howItWorks': 'ఇది ఎలా పనిచేస్తుంది',
    'nav.contact': 'సంప్రదించండి',
    'nav.login': 'లాగిన్',
    'nav.dashboard': 'డ్యాష్‌బోర్డ్',
    'nav.launchConsole': 'కన్సోల్ తెరవండి',

    // Sidebar
    'sidebar.chats': 'చాట్‌లు',
    'sidebar.map': 'లైవ్ వాతావరణ పటం',
    'sidebar.alerts': 'హెచ్చరికలు & అలర్ట్‌లు',
    'sidebar.climate': 'వాతావరణ విశ్లేషణ',
    'sidebar.settings': 'సెట్టింగ్‌లు & యూనిట్లు',
    'sidebar.darkMode': 'డార్క్ మోడ్',
    'sidebar.lightMode': 'లైట్ మోడ్',
    'sidebar.logout': 'సైన్ అవుట్',
    'sidebar.role': 'వాతావరణ విశ్లేషకుడు',
    'sidebar.activeCount': 'యాక్టివ్',

    // Chat Assistant
    'chat.voice': 'వాయిస్',
    'chat.liveVoice': 'లైవ్ వాయిస్',
    'chat.newChat': 'కొత్త సంభాషణ ప్రారంభించండి',
    'chat.title': 'వెదర్‌జిపిటి (WeatherGPT)',
    'chat.subtitle': 'ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
    'chat.placeholder': 'వర్షం, తుఫాను, ఎండ తీవ్రత లేదా స్థానిక వాతావరణం గురించి అడగండి...',
    'chat.metAnalysis': 'వాతావరణ విశ్లేషణ & రాడార్ టెలిమెట్రీ',
    'chat.copy': 'కాపీ చేయండి',
    'chat.copied': 'కాపీ చేయబడింది!',
    'chat.speak': 'వినండి',
    'chat.stopSpeak': 'ఆపండి',
    'chat.disclaimer': 'వెదర్‌జిపిటి IMD మరియు MoES లైవ్ డేటా ఆధారంగా పనిచేస్తుంది.',
    'chat.thinkingWords': 'డాప్లర్ రాడార్ పరిశీలించబడుతోంది...|ప్రాంతీయ డేటా విశ్లేషణ...|హెచ్చరికల పరిశీలన...|వాతావరణ నివేదిక సిద్ధమవుతోంది...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'లైవ్ వాతావరణ పటం & విపత్తు జీఐఎస్',
    'map.bulletins': 'IMD బులెటిన్లు',
    'map.radars': 'డాప్లర్ రాడార్లు యాక్టివ్',
    'map.quakes': 'భూకంపాల ప్రత్యక్ష ప్రసారం',
    'map.focus': 'ఫోకస్:',
    'map.projection': 'ప్రొజెక్షన్: వెబ్ మెర్కేటర్',
    'map.mounting': 'మ్యాప్ లోడ్ అవుతోంది...',

    // Alerts Page
    'alerts.title': 'తీవ్ర వాతావరణ హెచ్చరికలు',
    'alerts.subtitle': 'భారతదేశం అంతటా రియల్ టైమ్ వాతావరణ మరియు విపత్తు హెచ్చరికలు.',
    'alerts.searchPlaceholder': 'జిల్లా, రాష్ట్రం లేదా సంఘటన ద్వారా శోధించండి...',
    'alerts.all': 'అన్ని హెచ్చరికలు',
    'alerts.extreme': 'అత్యంత తీవ్రమైనది',
    'alerts.severe': 'తీవ్రమైనది',
    'alerts.moderate': 'మధ్యస్థం',
    'alerts.minor': 'సాధారణం',
    'alerts.extremeLabel': 'అత్యంత తీవ్రమైన హెచ్చరికలు',
    'alerts.severeLabel': 'తీవ్ర వాతావరణ సూచనలు',
    'alerts.moderateLabel': 'మధ్యస్థ పర్యవేక్షణ',
    'alerts.minorLabel': 'సాధారణ బులెటిన్లు',
    'alerts.noAlerts': 'ఎటువంటి హెచ్చరికలు లేవు.',

    // Climate Page
    'climate.title': 'వాతావరణ విశ్లేషణ & వర్షాకాల నివేదిక',
    'climate.season': 'సీజన్: నైరుతి రుతుపవనాలు (ఖరీఫ్)',
    'climate.lpaTitle': 'అఖిల భారత వర్షపాతం LPA',
    'climate.lpaSub': '+4.2% సాధారణం కంటే ఎక్కువ వర్షం',
    'climate.anomalyTitle': 'ఉష్ణోగ్రత క్రమరాహిత్యం',
    'climate.anomalySub': 'సాధారణం కంటే కాస్త ఎక్కువ',
    'climate.subdivisionsTitle': 'క్రియాశీల వాతావరణ విభాగాలు',
    'climate.subdivisionsSub': 'సాధారణ లేదా అదనపు వర్షపాతం నమోదు',

    // Settings Page
    'settings.title': 'కన్సోల్ & టెలిమెట్రీ సెట్టింగ్‌లు',
    'settings.themeTitle': 'థీమ్ మరియు రూపం',
    'settings.themeDesc': 'డార్క్ మోడ్ లేదా లైట్ మోడ్ ఎంచుకోండి.',
    'settings.langTitle': 'ప్రాంతీయ భాష & వాయిస్',
    'settings.langDesc': 'వెబ్‌సైట్ మరియు వాయిస్ అసిస్టెంట్ కోసం ప్రాథమిక భాషను ఎంచుకోండి.',
    'settings.saveButton': 'ప్రాధాన్యతలను సేవ్ చేయండి',
    'settings.saved': 'విజయవంతంగా సేవ్ చేయబడింది!',
    'settings.dark': 'డార్క్ మోడ్',
    'settings.light': 'లైట్ మోడ్',
  },

  kn: {
    // Nav
    'nav.home': 'ಮುಖಪುಟ',
    'nav.features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    'nav.howItWorks': 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    'nav.contact': 'ಸಂಪರ್ಕಿಸಿ',
    'nav.login': 'ಸೈನ್ ಇನ್',
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.launchConsole': 'ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ',

    // Sidebar
    'sidebar.chats': 'ಮಾತುಕತೆಗಳು',
    'sidebar.map': 'ಲೈವ್ ಹವಾಮಾನ ನಕ್ಷೆ',
    'sidebar.alerts': 'ಎಚ್ಚರಿಕೆಗಳು & ಸೂಚನೆಗಳು',
    'sidebar.climate': 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',
    'sidebar.settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು & ಘಟಕಗಳು',
    'sidebar.darkMode': 'ಡಾರ್ಕ್ ಮೋಡ್',
    'sidebar.lightMode': 'ಲೈಟ್ ಮೋಡ್',
    'sidebar.logout': 'ಸೈನ್ ಔಟ್',
    'sidebar.role': 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಕ',
    'sidebar.activeCount': 'ಸಕ್ರಿಯ',

    // Chat Assistant
    'chat.voice': 'ಧ್ವನಿ',
    'chat.liveVoice': 'ಲೈವ್ ಧ್ವನಿ',
    'chat.newChat': 'ಹೊಸ ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ',
    'chat.title': 'ವೆದರ್‌ಜಿಪಿಟಿ (WeatherGPT)',
    'chat.subtitle': 'ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    'chat.placeholder': 'ಮಳೆ, ಚಂಡಮಾರುತ, ತಾಪಮಾನ ಅಥವಾ ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ...',
    'chat.metAnalysis': 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ರಾಡಾರ್ ಟೆಲಿಮೆಟ್ರಿ',
    'chat.copy': 'ಕಾಪಿ ಮಾಡಿ',
    'chat.copied': 'ಕಾಪಿಯಾಗಿದೆ!',
    'chat.speak': 'ಕೇಳಿ',
    'chat.stopSpeak': 'ನಿಲ್ಲಿಸಿ',
    'chat.disclaimer': 'ವೆದರ್‌ಜಿಪಿಟಿ IMD ಮತ್ತು MoES ಲೈವ್ ಡೇಟಾ ಆಧರಿಸಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    'chat.thinkingWords': 'ಡಾಪ್ಲರ್ ರಾಡಾರ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...|ಪ್ರಾದೇಶಿಕ ಮಾಹಿತಿ ವಿಶ್ಲೇಷಣೆ...|ಎಚ್ಚರಿಕೆಗಳ ಪರಿಶೀಲನೆ...|ಹವಾಮಾನ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'ಲೈವ್ ಹವಾಮಾನ ನಕ್ಷೆ & ವಿಪತ್ತು ಜಿಐಎಸ್',
    'map.bulletins': 'IMD ಬುಲೆಟಿನ್‌ಗಳು',
    'map.radars': 'ಡಾಪ್ಲರ್ ರಾಡಾರ್ ಸಕ್ರಿಯ',
    'map.quakes': 'ಭೂಕಂಪ ಲೈವ್',
    'map.focus': 'ಕೇಂದ್ರ:',
    'map.projection': 'ಪ್ರೊಜೆಕ್ಷನ್: ವೆಬ್ ಮರ್ಕೇಟರ್',
    'map.mounting': 'ಮ್ಯಾಪ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',

    // Alerts Page
    'alerts.title': 'ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು',
    'alerts.subtitle': 'ಭಾರತದಾದ್ಯಂತ ನೈಜ ಸಮಯದ ತೀವ್ರ ಹವಾಮಾನ ಮತ್ತು ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳು.',
    'alerts.searchPlaceholder': 'ಜಿಲ್ಲೆ, ರಾಜ್ಯ ಅಥವಾ ಘಟನೆಯ ಮೂಲಕ ಹುಡುಕಿ...',
    'alerts.all': 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು',
    'alerts.extreme': 'ಅತ್ಯಂತ ತೀವ್ರ',
    'alerts.severe': 'ತೀವ್ರ',
    'alerts.moderate': 'ಮಧ್ಯಮ',
    'alerts.minor': 'ಸಾಮಾನ್ಯ',
    'alerts.extremeLabel': 'ಅತ್ಯಂತ ತೀವ್ರ ಎಚ್ಚರಿಕೆಗಳು',
    'alerts.severeLabel': 'ತೀವ್ರ ಹವಾಮಾನ ಸಲಹೆಗಳು',
    'alerts.moderateLabel': 'ಮಧ್ಯಮ ಜಾಗರೂಕತೆ',
    'alerts.minorLabel': 'ಸಾಮಾನ್ಯ ಬುಲೆಟಿನ್',
    'alerts.noAlerts': 'ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.',

    // Climate Page
    'climate.title': 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ & ಮುಂಗಾರು ಲೆಕ್ಕಪತ್ರ',
    'climate.season': 'ಋತು: ನೈಋತ್ಯ ಮುಂಗಾರು (ಖಾರೀಫ್)',
    'climate.lpaTitle': 'ಅಖಿಲ ಭಾರತ ಮುಂಗಾರು LPA',
    'climate.lpaSub': '+೪.೨% ವಾಡಿಕೆಗಿಂತ ಹೆಚ್ಚು ಮಳೆ',
    'climate.anomalyTitle': 'ತಾಪಮಾನ ವ್ಯತ್ಯಾಸ',
    'climate.anomalySub': 'ವಾಡಿಕೆಗಿಂತ ಸ್ವಲ್ಪ ಹೆಚ್ಚು',
    'climate.subdivisionsTitle': 'ಸಕ್ರಿಯ ಹವಾಮಾನ ವಿಭಾಗಗಳು',
    'climate.subdivisionsSub': 'ಸಾಮಾನ್ಯ ಅಥವಾ ಅಧಿಕ ಮಳೆ ದಾಖಲು',

    // Settings Page
    'settings.title': 'ಕನ್ಸೋಲ್ ಮತ್ತು ಟೆಲಿಮೆಟ್ರಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'settings.themeTitle': 'ಥೀಮ್ ಮತ್ತು ನೋಟ',
    'settings.themeDesc': 'ಡಾರ್ಕ್ ಮೋಡ್ ಅಥವಾ ಲೈಟ್ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ.',
    'settings.langTitle': 'ಪ್ರಾದೇಶಿಕ ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ',
    'settings.langDesc': 'ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಧ್ವನಿ ಸಹಾಯಕಕ್ಕಾಗಿ ಮುಖ್ಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    'settings.saveButton': 'ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ',
    'settings.saved': 'ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
    'settings.dark': 'ಡಾರ್ಕ್ ಮೋಡ್',
    'settings.light': 'ಲೈಟ್ ಮೋಡ್',
  },

  ml: {
    // Nav
    'nav.home': 'ഹോം',
    'nav.features': 'സവിശേഷതകൾ',
    'nav.howItWorks': 'പ്രവർത്തനം എങ്ങനെ',
    'nav.contact': 'ബന്ധപ്പെടുക',
    'nav.login': 'സൈൻ ഇൻ',
    'nav.dashboard': 'ഡാഷ്‌ബോർഡ്',
    'nav.launchConsole': 'കൺസോൾ തുറക്കുക',

    // Sidebar
    'sidebar.chats': 'സംഭാഷണങ്ങൾ',
    'sidebar.map': 'തത്സമയ കാലാവസ്ഥാ ഭൂപടം',
    'sidebar.alerts': 'മുന്നറിയിപ്പുകൾ',
    'sidebar.climate': 'കാലാവസ്ഥാ വിശകലനം',
    'sidebar.settings': 'ക്രമീകരണങ്ങൾ',
    'sidebar.darkMode': 'ഡാർക്ക് മോഡ്',
    'sidebar.lightMode': 'ലൈറ്റ് മോഡ്',
    'sidebar.logout': 'സൈൻ ഔട്ട്',
    'sidebar.role': 'കാലാവസ്ഥാ വിദഗ്ദ്ധൻ',
    'sidebar.activeCount': 'സജീവം',

    // Chat Assistant
    'chat.voice': 'ശബ്ദം',
    'chat.liveVoice': 'തത്സമയ ശബ്ദം',
    'chat.newChat': 'പുതിയ സംഭാഷണം',
    'chat.title': 'വെതർജിപിടി (WeatherGPT)',
    'chat.subtitle': 'ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
    'chat.placeholder': 'മഴ, ചുഴലിക്കാറ്റ്, ചൂട് അല്ലെങ്കിൽ പ്രാദേശിക കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ...',
    'chat.metAnalysis': 'കാലാവസ്ഥാ വിശകലനവും റഡാർ വിവരങ്ങളും',
    'chat.copy': 'പകർത്തുക',
    'chat.copied': 'പകർത്തി!',
    'chat.speak': 'കേൾക്കുക',
    'chat.stopSpeak': 'നിർത്തുക',
    'chat.disclaimer': 'വെതർജിപിടി ഐഎംഡിയുടെയും MoES-ന്റെയും ലൈവ് ഡാറ്റയെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്.',
    'chat.thinkingWords': 'ഡോപ്ലർ റഡാർ പരിശോധിക്കുന്നു...|മേഖലാ വിവരങ്ങൾ വിശകലനം ചെയ്യുന്നു...|മുന്നറിയിപ്പുകൾ പരിശോധിക്കുന്നു...|കാലാവസ്ഥാ ബുള്ളറ്റിൻ തയ്യാറാക്കുന്നു...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'തത്സമയ കാലാവസ്ഥ ഭൂപടം & ജിഐഎസ്',
    'map.bulletins': 'IMD ബുള്ളറ്റിനുകൾ',
    'map.radars': 'റഡാറുകൾ സജീവം',
    'map.quakes': 'ഭൂകമ്പ നിരീക്ഷണം',
    'map.focus': 'ശ്രദ്ധാകേന്ദ്രം:',
    'map.projection': 'പ്രൊജക്ഷൻ: വെബ് മെർക്കേറ്റർ',
    'map.mounting': 'മാപ്പ് ലോഡ് ചെയ്യുന്നു...',

    // Alerts Page
    'alerts.title': 'തീവ്ര കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ',
    'alerts.subtitle': 'ഇന്ത്യയിലുടനീളമുള്ള തത്സമയ തീവ്ര കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ.',
    'alerts.searchPlaceholder': 'ജില്ല, സംസ്ഥാനം എന്നിവ പ്രകാരം തിരയുക...',
    'alerts.all': 'എല്ലാ മുന്നറിയിപ്പുകളും',
    'alerts.extreme': 'അതിതീവ്രം',
    'alerts.severe': 'തീവ്രം',
    'alerts.moderate': 'മിതമായത്',
    'alerts.minor': 'സാധാരണ',
    'alerts.extremeLabel': 'റെഡ് അലർട്ട് (അതിതീവ്രം)',
    'alerts.severeLabel': 'ഓറഞ്ച് അലർട്ട് (തീവ്രം)',
    'alerts.moderateLabel': 'യെല്ലോ അലർട്ട് (മിതമായത്)',
    'alerts.minorLabel': 'സാധാരണ വിവരങ്ങൾ',
    'alerts.noAlerts': 'സജീവമായ മുന്നറിയിപ്പുകളൊന്നുമില്ല.',

    // Climate Page
    'climate.title': 'കാലാവസ്ഥാ വിശകലനവും മൺസൂൺ കണക്കുകളും',
    'climate.season': 'കാലം: തെക്കുപടിഞ്ഞാറൻ മൺസൂൺ',
    'climate.lpaTitle': 'അഖിലേന്ത്യാ മൺസൂൺ LPA',
    'climate.lpaSub': '+4.2% അധിക മഴ ലഭിച്ചു',
    'climate.anomalyTitle': 'താപനില വ്യതിയാനം',
    'climate.anomalySub': 'സാധാരണയേക്കാൾ കൂടുതൽ ചൂട്',
    'climate.subdivisionsTitle': 'സജീവ മേഖലകൾ',
    'climate.subdivisionsSub': 'സാധാരണമോ അധികമോ മഴ രേഖപ്പെടുത്തി',

    // Settings Page
    'settings.title': 'കൺസോൾ ക്രമീകരണങ്ങൾ',
    'settings.themeTitle': 'തീമും ദൃശ്യരൂപവും',
    'settings.themeDesc': 'ഡാർക്ക് മോഡ് അല്ലെങ്കിൽ ലൈറ്റ് മോഡ് തിരഞ്ഞെടുക്കുക.',
    'settings.langTitle': 'പ്രാദേശിക ഭാഷയും ശബ്ദവും',
    'settings.langDesc': 'വെബ്‌സൈറ്റിനും വോയ്‌സ് അസിസ്റ്റന്റിനുമുള്ള പ്രധാന ഭാഷ തിരഞ്ഞെടുക്കുക.',
    'settings.saveButton': 'സേവ് ചെയ്യുക',
    'settings.saved': 'വിജയകരമായി സേവ് ചെയ്തു!',
    'settings.dark': 'ഡാർക്ക് മോഡ്',
    'settings.light': 'ലൈറ്റ് മോഡ്',
  },

  or: {
    // Nav
    'nav.home': 'ମୂଳପୃଷ୍ଠା',
    'nav.features': 'ବୈଶିଷ୍ଟ୍ୟ',
    'nav.howItWorks': 'କିପରି କାମ କରେ',
    'nav.contact': 'ଯୋଗାଯୋଗ',
    'nav.login': 'ଲଗ୍ ଇନ୍',
    'nav.dashboard': 'ଡ୍ୟାସବୋର୍ଡ',
    'nav.launchConsole': 'କନସୋଲ୍ ଖୋଲନ୍ତୁ',

    // Sidebar
    'sidebar.chats': 'ଚାଟ୍',
    'sidebar.map': 'ଲାଇଭ୍ ପାଣିପାଗ ମାନଚିତ୍ର',
    'sidebar.alerts': 'ସତର୍କତା ଓ ସୂଚନା',
    'sidebar.climate': 'ଜଳବାୟୁ ବିଶ୍ଳେଷଣ',
    'sidebar.settings': 'ସେଟିଙ୍ଗ୍ସ ଓ ଏକକ',
    'sidebar.darkMode': 'ଡାର୍କ ମୋଡ୍',
    'sidebar.lightMode': 'ଲାଇଟ୍ ମୋଡ୍',
    'sidebar.logout': 'ସାଇନ୍ ଆଉଟ୍',
    'sidebar.role': 'ପାଣିପାଗ ବିଶ୍ଳେଷକ',
    'sidebar.activeCount': 'ସକ୍ରିୟ',

    // Chat Assistant
    'chat.voice': 'ଭଏସ୍',
    'chat.liveVoice': 'ଲାଇଭ୍ ଭଏସ୍',
    'chat.newChat': 'ନୂଆ କଥାବାର୍ତ୍ତା ଆରମ୍ଭ କରନ୍ତୁ',
    'chat.title': 'ୱେଦରଜିପିଟି (WeatherGPT)',
    'chat.subtitle': 'ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    'chat.placeholder': 'ବର୍ଷା, ବାତ୍ୟା, ତାତି କିମ୍ବା ସ୍ଥାନୀୟ ପାଣିପାଗ ବିଷୟରେ ପଚାରନ୍ତୁ...',
    'chat.metAnalysis': 'ପାଣିପାଗ ବିଶ୍ଳେଷଣ ଓ ରାଡାର ଟେଲିମେଟ୍ରି',
    'chat.copy': 'କପି କରନ୍ତୁ',
    'chat.copied': 'କପି ହୋଇଗଲା!',
    'chat.speak': 'ଶୁଣନ୍ତୁ',
    'chat.stopSpeak': 'ବନ୍ଦ କରନ୍ତୁ',
    'chat.disclaimer': 'ୱେଦରଜିପିଟି IMD ଏବଂ MoES ର ପ୍ରତ୍ୟକ୍ଷ ତଥ୍ୟ ଉପରେ ଆଧାରିତ।',
    'chat.thinkingWords': 'ଡପଲର ରାଡାର ଅନୁଧ୍ୟାନ କରାଯାଉଛି...|ଆଞ୍ଚଳିକ ତଥ୍ୟ ଯାଞ୍ଚ ଚାଲିଛି...|ସତର୍କତା ପରୀକ୍ଷା ହେଉଛି...|ବୁଲେଟିନ୍ ପ୍ରସ୍ତୁତ ହେଉଛି...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'ଲାଇଭ୍ ପାଣିପାଗ ମାନଚିତ୍ର ଓ ବିପର୍ଯ୍ୟୟ ଜିଆଇଏସ୍',
    'map.bulletins': 'IMD ବୁଲେଟିନ୍',
    'map.radars': 'ଡପଲର ରାଡାର ସକ୍ରିୟ',
    'map.quakes': 'ଭୂକମ୍ପ ଲାଇଭ୍',
    'map.focus': 'ଫୋକସ୍:',
    'map.projection': 'ପ୍ରୋଜେକ୍ସନ୍: ୱେବ୍ ମର୍କେଟର',
    'map.mounting': 'ମାନଚିତ୍ର ଲୋଡ୍ ହେଉଛି...',

    // Alerts Page
    'alerts.title': 'ସକ୍ରିୟ ଗୁରୁତର ପାଣିପାଗ ସତର୍କତା',
    'alerts.subtitle': 'ସମଗ୍ର ଭାରତରେ ପ୍ରକୃତ ସମୟର ପାଣିପାଗ ଓ ବିପର୍ଯ୍ୟୟ ଚେତାବନୀ।',
    'alerts.searchPlaceholder': 'ଜିଲ୍ଲା, ରାଜ୍ୟ କିମ୍ବା ଘଟଣା ଅନୁଯାୟୀ ଖୋଜନ୍ତୁ...',
    'alerts.all': 'ସମସ୍ତ ସତର୍କତା',
    'alerts.extreme': 'ଅତି ଗୁରୁତର',
    'alerts.severe': 'ଗୁରୁତର',
    'alerts.moderate': 'ମଧ୍ୟମ',
    'alerts.minor': 'ସାଧାରଣ',
    'alerts.extremeLabel': 'ଅତି ଗୁରୁତର ଚେତାବନୀ',
    'alerts.severeLabel': 'ଗୁରୁତର ସତର୍କତା',
    'alerts.moderateLabel': 'ମଧ୍ୟମ ସତର୍କତା',
    'alerts.minorLabel': 'ସାଧାରଣ ବୁଲେଟିନ୍',
    'alerts.noAlerts': 'କୌଣସି ସକ୍ରିୟ ସତର୍କତା ମିଳିଲା ନାହିଁ।',

    // Climate Page
    'climate.title': 'ଜଳବାୟୁ ବିଶ୍ଳେଷଣ ଓ ମୌସୁମୀ ତଥ୍ୟ',
    'climate.season': 'ଋତୁ: ଦକ୍ଷିଣ-ପଶ୍ଚିମ ମୌସୁମୀ',
    'climate.lpaTitle': 'ସର୍ବଭାରତୀୟ ମୌସୁମୀ LPA',
    'climate.lpaSub': '+୪.୨% ସ୍ୱାଭାବିକଠାରୁ ଅଧିକ ବର୍ଷା',
    'climate.anomalyTitle': 'ତାପମାତ୍ରା ପରିବର୍ତ୍ତନ',
    'climate.anomalySub': 'ସ୍ୱାଭାବିକଠାରୁ ସାମାନ୍ୟ ଅଧିକ',
    'climate.subdivisionsTitle': 'ସକ୍ରିୟ ପାଣିପାଗ ମଣ୍ଡଳ',
    'climate.subdivisionsSub': 'ସ୍ୱାଭାବିକ କିମ୍ବା ଅଧିକ ବର୍ଷା ରେକର୍ଡ',

    // Settings Page
    'settings.title': 'କନସୋଲ୍ ଓ ଟେଲିମେଟ୍ରି ସେଟିଙ୍ଗ୍ସ',
    'settings.themeTitle': 'ଥିମ୍ ଓ ରୂପରେଖ',
    'settings.themeDesc': 'ଡାର୍କ ମୋଡ୍ କିମ୍ବା ଲାଇଟ୍ ମୋଡ୍ ବାଛନ୍ତୁ।',
    'settings.langTitle': 'ଆଞ୍ଚଳିକ ଭାଷା ଓ ଭଏସ୍',
    'settings.langDesc': 'ୱେବସାଇଟ୍ ଏବଂ ଭଏସ୍ ସହାୟକ ପାଇଁ ପ୍ରାଥମିକ ଭାଷା ଚୟନ କରନ୍ତୁ।',
    'settings.saveButton': 'ସେଭ୍ କରନ୍ତୁ',
    'settings.saved': 'ସଫଳତାର ସହ ସେଭ୍ ହେଲା!',
    'settings.dark': 'ଡାର୍କ ମୋଡ୍',
    'settings.light': 'ଲାଇଟ୍ ମୋଡ୍',
  },

  pa: {
    // Nav
    'nav.home': 'ਮੁੱਖ ਪੰਨਾ',
    'nav.features': 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
    'nav.howItWorks': 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    'nav.contact': 'ਸੰਪਰਕ ਕਰੋ',
    'nav.login': 'ਸਾਈਨ ਇਨ',
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.launchConsole': 'ਕੰਸੋਲ ਖੋਲ੍ਹੋ',

    // Sidebar
    'sidebar.chats': 'ਗੱਲਬਾਤ',
    'sidebar.map': 'ਲਾਈਵ ਮੌਸਮ ਨਕਸ਼ਾ',
    'sidebar.alerts': 'ਚੇਤਾਵਨੀਆਂ ਅਤੇ ਅਲਰਟ',
    'sidebar.climate': 'ਜਲਵਾਯੂ ਵਿਸ਼ਲੇਸ਼ਣ',
    'sidebar.settings': 'ਸੈਟਿੰਗਾਂ ਅਤੇ ਇਕਾਈਆਂ',
    'sidebar.darkMode': 'ਡਾਰਕ ਮੋਡ',
    'sidebar.lightMode': 'ਲਾਈਟ ਮੋਡ',
    'sidebar.logout': 'ਸਾਈਨ ਆਊਟ',
    'sidebar.role': 'ਮੌਸਮ ਵਿਸ਼ਲੇਸ਼ਕ',
    'sidebar.activeCount': 'ਸਰਗਰਮ',

    // Chat Assistant
    'chat.voice': 'ਆਵਾਜ਼',
    'chat.liveVoice': 'ਲਾਈਵ ਆਵਾਜ਼',
    'chat.newChat': 'ਨਵੀਂ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ',
    'chat.title': 'ਵੈਦਰਜੀਪੀਟੀ (WeatherGPT)',
    'chat.subtitle': 'ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    'chat.placeholder': 'ਮੀਂਹ, ਤੂਫ਼ਾਨ, ਗਰਮੀ ਦੀ ਲਹਿਰ ਜਾਂ ਸਥਾਨਕ ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ...',
    'chat.metAnalysis': 'ਮੌਸਮ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਾਡਾਰ ਟੈਲੀਮੈਟਰੀ',
    'chat.copy': 'ਕਾਪੀ ਕਰੋ',
    'chat.copied': 'ਕਾਪੀ ਹੋ ਗਿਆ!',
    'chat.speak': 'ਸੁਣੋ',
    'chat.stopSpeak': 'ਰੋਕੋ',
    'chat.disclaimer': 'ਵੈਦਰਜੀਪੀਟੀ IMD ਅਤੇ MoES ਦੇ ਲਾਈਵ ਡੇਟਾ ਤੇ ਅਧਾਰਤ ਹੈ।',
    'chat.thinkingWords': 'ਡੌਪਲਰ ਰਾਡਾਰ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...|ਖੇਤਰੀ ਡੇਟਾ ਦੀ ਸਮੀਖਿਆ...|ਚੇਤਾਵਨੀਆਂ ਦੀ ਪੁਸ਼ਟੀ...|ਮੌਸਮ ਬੁਲੇਟਿਨ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'ਲਾਈਵ ਮੌਸਮ ਨਕਸ਼ਾ ਅਤੇ ਆਫ਼ਤ ਜੀਆਈਐਸ',
    'map.bulletins': 'IMD ਬੁਲੇਟਿਨ',
    'map.radars': 'ਡੌਪਲਰ ਰਾਡਾਰ ਸਰਗਰਮ',
    'map.quakes': 'ਭੂਚਾਲ ਨਿਗਰਾਨੀ',
    'map.focus': 'ਕੇਂਦਰ:',
    'map.projection': 'ਪ੍ਰੋਜੈਕਸ਼ਨ: ਵੈੱਬ ਮਰਕੇਟਰ',
    'map.mounting': 'ਨਕਸ਼ਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',

    // Alerts Page
    'alerts.title': 'ਸਰਗਰਮ ਗੰਭੀਰ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ',
    'alerts.subtitle': 'ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਰੀਅਲ-ਟਾਈਮ ਗੰਭੀਰ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ।',
    'alerts.searchPlaceholder': 'ਜ਼ਿਲ੍ਹਾ, ਰਾਜ ਜਾਂ ਘਟਨਾ ਅਨੁਸਾਰ ਖੋਜੋ...',
    'alerts.all': 'ਸਾਰੀਆਂ ਚੇਤਾਵਨੀਆਂ',
    'alerts.extreme': 'ਅਤਿ ਗੰਭੀਰ',
    'alerts.severe': 'ਗੰਭੀਰ',
    'alerts.moderate': 'ਦਰਮਿਆਨਾ',
    'alerts.minor': 'ਆਮ',
    'alerts.extremeLabel': 'ਅਤਿ ਗੰਭੀਰ ਚੇਤਾਵਨੀਆਂ',
    'alerts.severeLabel': 'ਗੰਭੀਰ ਮੌਸਮ ਸਲਾਹ',
    'alerts.moderateLabel': 'ਦਰਮਿਆਨੀ ਚੌਕਸੀ',
    'alerts.minorLabel': 'ਆਮ ਬੁਲੇਟਿਨ',
    'alerts.noAlerts': 'ਕੋਈ ਸਰਗਰਮ ਚੇਤਾਵਨੀ ਨਹੀਂ ਮਿਲੀ।',

    // Climate Page
    'climate.title': 'ਜਲਵਾਯੂ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਮਾਨਸੂਨ ਖਾਤਾ',
    'climate.season': 'ਸੀਜ਼ਨ: ਦੱਖਣ-ਪੱਛਮੀ ਮਾਨਸੂਨ (ਸਾਉਣੀ)',
    'climate.lpaTitle': 'ਆਲ-ਇੰਡੀਆ ਮਾਨਸੂਨ LPA',
    'climate.lpaSub': '+੪.੨% ਆਮ ਨਾਲੋਂ ਵੱਧ ਮੀਂਹ',
    'climate.anomalyTitle': 'ਤਾਪਮਾਨ ਅਸੰਗਤਤਾ',
    'climate.anomalySub': 'ਆਮ ਨਾਲੋਂ ਥੋੜ੍ਹਾ ਵੱਧ ਤਾਪਮਾਨ',
    'climate.subdivisionsTitle': 'ਸਰਗਰਮ ਮੌਸਮ ਉਪ-ਮੰਡਲ',
    'climate.subdivisionsSub': 'ਆਮ ਜਾਂ ਵੱਧ ਮੀਂਹ ਦਰਜ',

    // Settings Page
    'settings.title': 'ਕੰਸੋਲ ਅਤੇ ਟੈਲੀਮੈਟਰੀ ਸੈਟਿੰਗਾਂ',
    'settings.themeTitle': 'ਥੀਮ ਅਤੇ ਦਿੱਖ',
    'settings.themeDesc': 'ਡਾਰਕ ਮੋਡ ਜਾਂ ਲਾਈਟ ਮੋਡ ਚੁਣੋ।',
    'settings.langTitle': 'ਖੇਤਰੀ ਭਾਸ਼ਾ ਅਤੇ ਆਵਾਜ਼',
    'settings.langDesc': 'ਪੂਰੀ ਵੈੱਬਸਾਈਟ ਅਤੇ ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਲਈ ਮੁੱਖ ਭਾਸ਼ਾ ਚੁਣੋ।',
    'settings.saveButton': 'ਸੈਟਿੰਗਾਂ ਸੁਰੱਖਿਅਤ ਕਰੋ',
    'settings.saved': 'ਸਫਲਤਾਪੂਰਵਕ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਗਿਆ!',
    'settings.dark': 'ਡਾਰਕ ਮੋਡ',
    'settings.light': 'ਲਾਈਟ ਮੋਡ',
  },

  as: {
    // Nav
    'nav.home': 'गृहপৃষ্ঠা',
    'nav.features': 'বৈশিষ্ট্যসমূহ',
    'nav.howItWorks': 'ই কেনেকৈ কাম কৰে',
    'nav.contact': 'যোগাযোগ',
    'nav.login': 'ছাইন ইন',
    'nav.dashboard': 'ডেশ্ববৰ্ড',
    'nav.launchConsole': 'কনচোল খোলক',

    // Sidebar
    'sidebar.chats': 'বার্তালাপ',
    'sidebar.map': 'লাইভ বতৰৰ মানচিত্ৰ',
    'sidebar.alerts': 'সতৰ্কবাৰ্তা আৰু জাননী',
    'sidebar.climate': 'জলবায়ু বিশ্লেষণ',
    'sidebar.settings': 'ছেটিংছ আৰু একক',
    'sidebar.darkMode': 'ডাৰ্ক মোড',
    'sidebar.lightMode': 'লাইট মোড',
    'sidebar.logout': 'ছাইন আউট',
    'sidebar.role': 'বতৰ বিশ্লেষক',
    'sidebar.activeCount': 'সক্ৰিয়',

    // Chat Assistant
    'chat.voice': 'কণ্ঠস্বৰ',
    'chat.liveVoice': 'লাইভ ভয়েচ',
    'chat.newChat': 'নতুন বার্তালাপ আৰম্ভ কৰক',
    'chat.title': 'ৱেদাৰজিপিটি (WeatherGPT)',
    'chat.subtitle': 'আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
    'chat.placeholder': 'বৰষুণ, ঘূৰ্ণীবতাহ, বানপানী বা স্থানীয় বতৰৰ বিষয়ে সোধক...',
    'chat.metAnalysis': 'বতৰ বিশ্লেষণ আৰু ৰাডাৰ টেলিমეტ্ৰী',
    'chat.copy': 'কপি কৰক',
    'chat.copied': 'কপি হ’ল!',
    'chat.speak': 'শুনক',
    'chat.stopSpeak': 'বন্ধ কৰক',
    'chat.disclaimer': 'ৱেদাৰজিপিটি IMD আৰু MoES ৰ লাইভ তথ্যৰ ওপৰত ভিত্তি কৰি চলে।',
    'chat.thinkingWords': 'ডপলাৰ ৰাডাৰ পৰীক্ষা চলি আছে...|আঞ্চলিক তথ্য পৰ্যালোচনা...|সতৰ্কবাৰ্তা পৰীক্ষণ...|বতৰ বুলেটিন প্ৰস্তুত হৈছে...',
    'chat.modelLabel': 'Mausami-V1',

    // Map Page
    'map.title': 'লাইভ বতৰৰ মানচিত্ৰ আৰু দুৰ্যোগ জিআইএছ',
    'map.bulletins': 'IMD বুলেটিন',
    'map.radars': 'ডপলাৰ ৰাডাৰ সক্ৰিয়',
    'map.quakes': 'ভূমিকম্প নিৰীক্ষণ',
    'map.focus': 'কেন্দ্ৰ:',
    'map.projection': 'প্ৰক্ষেপণ: ৱেব মাৰ্কেটৰ',
    'map.mounting': 'মানচিত্ৰ লোড হৈ আছে...',

    // Alerts Page
    'alerts.title': 'সক্ৰিয় বিপজ্জনক বতৰৰ সতৰ্কবাৰ্তা',
    'alerts.subtitle': 'সমগ্ৰ ভাৰতত বাস্তৱ সময়ৰ বতৰ আৰু দুৰ্যোগ সতৰ্কবাৰ্তা।',
    'alerts.searchPlaceholder': 'জিলা, ৰাজ্য বা ঘটনা অনুসৰি সন্ধান কৰক...',
    'alerts.all': 'সকলো সতৰ্কবাৰ্তা',
    'alerts.extreme': 'চৰম বিপদজনক',
    'alerts.severe': 'গুৰুতৰ',
    'alerts.moderate': 'মধ্যমীয়া',
    'alerts.minor': 'সাধাৰণ',
    'alerts.extremeLabel': 'চৰম বিপদ সতৰ্কবাৰ্তা',
    'alerts.severeLabel': 'গুৰুতৰ বতৰৰ পৰামৰ্শ',
    'alerts.moderateLabel': 'মধ্যমীয়া সতৰ্কতা',
    'alerts.minorLabel': 'সাধাৰণ বুলেটিন',
    'alerts.noAlerts': 'কোনো সক্ৰিয় সতৰ্কবাৰ্তা পোৱা নগ’ল।',

    // Climate Page
    'climate.title': 'জলবায়ু বিশ্লেষণ আৰু বাৰিষাৰ খতিয়ান',
    'climate.season': 'ঋতু: দক্ষিণ-পশ্চিম মৌচুমী (খাৰিফ)',
    'climate.lpaTitle': 'সৰ্বভাৰতীয় মৌচুমী LPA',
    'climate.lpaSub': '+৪.২% স্বাভাৱিকতকৈ অধিক বৰষুণ',
    'climate.anomalyTitle': 'উত্তাপৰ তাৰতম্য',
    'climate.anomalySub': 'স্বাভাৱিকতকৈ কিছু উষ্ণ',
    'climate.subdivisionsTitle': 'সক্ৰিয় বতৰ মণ্ডল',
    'climate.subdivisionsSub': 'স্বাভাৱিক বা অধিক বৰষুণ লিপিবদ্ধ',

    // Settings Page
    'settings.title': 'কনচোল আৰু টেলিমეტ্ৰী ছেটিংছ',
    'settings.themeTitle': 'থিম আৰু দৃশ্যপট',
    'settings.themeDesc': 'ডাৰ্ক মোড বা লাইট মোড বাছক।',
    'settings.langTitle': 'আঞ্চলিক ভাষা আৰু কণ্ঠস্বৰ',
    'settings.langDesc': 'সমগ্ৰ ৱেবছাইট আৰু ভইচ সহায়কৰ বাবে প্ৰাথমিক ভাষা বাছক।',
    'settings.saveButton': 'পছন্দসমূহ সংৰক্ষণ কৰক',
    'settings.saved': 'সফলভাৱে সংৰক্ষিত হ’ল!',
    'settings.dark': 'ডাৰ্ক মোড',
    'settings.light': 'লাইট মোড',
  },
}

interface LanguageContextType {
  currentLanguage: string
  selectedOption: LanguageOption
  setLanguage: (code: string) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'weathergpt_selected_language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved
      }
    }
    return 'en'
  })

  const setLanguage = useCallback((code: string) => {
    const valid = SUPPORTED_LANGUAGES.find((l) => l.code === code)
    const newCode = valid ? valid.code : 'en'
    setCurrentLanguageState(newCode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newCode)
      window.dispatchEvent(new CustomEvent('weathergpt-language-changed', { detail: newCode }))
    }
  }, [])

  const selectedOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
  }, [currentLanguage])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = TRANSLATIONS[currentLanguage]
      if (langDict && langDict[key]) {
        return langDict[key]
      }
      const enDict = TRANSLATIONS['en']
      if (enDict && enDict[key]) {
        return enDict[key]
      }
      return fallback || key
    },
    [currentLanguage]
  )

  const value = useMemo(
    () => ({
      currentLanguage,
      selectedOption,
      setLanguage,
      t,
    }),
    [currentLanguage, selectedOption, setLanguage, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
