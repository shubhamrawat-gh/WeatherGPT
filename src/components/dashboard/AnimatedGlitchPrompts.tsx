import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  CloudRain, 
  Wind, 
  Sprout, 
  Sun, 
  Activity, 
  ArrowUpRight,
  Waves,
  Navigation,
  ThermometerSnowflake,
  Plane,
  Radio,
  Zap,
  ShieldAlert
} from 'lucide-react'

export interface PromptItem {
  id: string
  category: 'monsoon' | 'cyclone' | 'agro' | 'heatwave' | 'flood' | 'seismic' | 'marine' | 'aviation' | 'cold' | 'general'
  tag: string
  icon: React.ElementType
  query: string
}

// Fisher-Yates array shuffling utility
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

// 24+ Rich, Verified Intelligence Prompts per language
const PROMPT_POOLS: Record<string, PromptItem[]> = {
  en: [
    {
      id: 'en-1',
      category: 'monsoon',
      tag: 'Monsoon Forecast',
      icon: CloudRain,
      query: 'What is the 3-day rainfall forecast for Mumbai and coastal Maharashtra?'
    },
    {
      id: 'en-2',
      category: 'cyclone',
      tag: 'Cyclone Radar',
      icon: Wind,
      query: 'What is the current cyclone status and depression alert in the Bay of Bengal?'
    },
    {
      id: 'en-3',
      category: 'agro',
      tag: 'Agro-Climate',
      icon: Sprout,
      query: 'What agro-advisory applies to paddy sowing in Eastern India this week?'
    },
    {
      id: 'en-4',
      category: 'heatwave',
      tag: 'Heat Advisory',
      icon: Sun,
      query: 'Are there any active heatwave alerts in Rajasthan or Vidarbha today?'
    },
    {
      id: 'en-5',
      category: 'flood',
      tag: 'Flood Monitor',
      icon: Waves,
      query: 'What is the flood inundation and river water level status in Assam and Bihar?'
    },
    {
      id: 'en-6',
      category: 'monsoon',
      tag: 'Delhi Nowcast',
      icon: CloudRain,
      query: 'Will heavy rain cause waterlogging in Delhi-NCR over the next 24 hours?'
    },
    {
      id: 'en-7',
      category: 'seismic',
      tag: 'Seismic Intel',
      icon: Activity,
      query: 'Have there been any significant earthquakes or tremors in the Himalayan belt today?'
    },
    {
      id: 'en-8',
      category: 'agro',
      tag: 'Crop Weather',
      icon: Sprout,
      query: 'Should farmers irrigate cotton and soybean crops in Central India this week?'
    },
    {
      id: 'en-9',
      category: 'general',
      tag: 'Air Quality',
      icon: Activity,
      query: 'What is the current AQI and PM2.5 forecast for Delhi-NCR and the northern plains?'
    },
    {
      id: 'en-10',
      category: 'flood',
      tag: 'Mountain Hazard',
      icon: Waves,
      query: 'Are there active landslide or flash flood warnings for Uttarakhand and Himachal?'
    },
    {
      id: 'en-11',
      category: 'marine',
      tag: 'Maritime Warning',
      icon: Navigation,
      query: 'What are the sea state and rough wave advisories for fishermen along the Arabian Sea?'
    },
    {
      id: 'en-12',
      category: 'cold',
      tag: 'Western Disturbance',
      icon: ThermometerSnowflake,
      query: 'Is an active Western Disturbance affecting snowfall in Jammu & Kashmir and Himachal?'
    },
    {
      id: 'en-13',
      category: 'cold',
      tag: 'Cold Wave',
      icon: ThermometerSnowflake,
      query: 'Are night minimum temperatures dropping below normal in Punjab, Haryana, and Rajasthan?'
    },
    {
      id: 'en-14',
      category: 'monsoon',
      tag: 'Bengaluru Nowcast',
      icon: CloudRain,
      query: 'What is the thunderstorm and evening rainfall outlook for Bengaluru today?'
    },
    {
      id: 'en-15',
      category: 'cyclone',
      tag: 'Kolkata Squall',
      icon: Wind,
      query: 'Is there a squall or thunderstorm alert for Kolkata and coastal West Bengal?'
    },
    {
      id: 'en-16',
      category: 'monsoon',
      tag: 'Chennai Monsoon',
      icon: CloudRain,
      query: 'What is the Northeast Monsoon onset status and rainfall forecast for Chennai?'
    },
    {
      id: 'en-17',
      category: 'monsoon',
      tag: 'Hyderabad Alert',
      icon: CloudRain,
      query: 'Will thunderstorm activity bring heavy showers to Hyderabad this evening?'
    },
    {
      id: 'en-18',
      category: 'aviation',
      tag: 'Aviation Weather',
      icon: Plane,
      query: 'Are flight operations at Delhi IGI or Mumbai Airport facing weather or fog delays?'
    },
    {
      id: 'en-19',
      category: 'marine',
      tag: 'Ocean Telemetry',
      icon: Radio,
      query: 'What is the ocean surge and coastal wave forecast issued by INCOIS today?'
    },
    {
      id: 'en-20',
      category: 'monsoon',
      tag: 'Western Ghats',
      icon: CloudRain,
      query: 'What is the cumulative rainfall and ghat-road safety status in Mahabaleshwar?'
    },
    {
      id: 'en-21',
      category: 'cyclone',
      tag: 'Lightning Alert',
      icon: Zap,
      query: 'Are there active lightning and convective thunderstorm warnings in Madhya Pradesh?'
    },
    {
      id: 'en-22',
      category: 'flood',
      tag: 'Reservoir Inflow',
      icon: Waves,
      query: 'What are the water storage and dam discharge advisories for the Cauvery & Godavari basins?'
    },
    {
      id: 'en-23',
      category: 'cyclone',
      tag: 'Coastal Gujarat',
      icon: Wind,
      query: 'Is there a deep depression or gale wind alert along the Saurashtra and Kutch coast?'
    },
    {
      id: 'en-24',
      category: 'general',
      tag: 'Disaster Protocol',
      icon: ShieldAlert,
      query: 'What are the official emergency helpline numbers and safety protocols for active cyclone alerts?'
    }
  ],
  hi: [
    {
      id: 'hi-1',
      category: 'monsoon',
      tag: 'वर्षा पूर्वानुमान',
      icon: CloudRain,
      query: 'मुंबई और तटीय महाराष्ट्र के लिए अगले 3 दिनों का वर्षा पूर्वानुमान क्या है?'
    },
    {
      id: 'hi-2',
      category: 'cyclone',
      tag: 'चक्रवात स्थिति',
      icon: Wind,
      query: 'बंगाल की खाड़ी में सक्रिय चक्रवात की वर्तमान स्थिति क्या है?'
    },
    {
      id: 'hi-3',
      category: 'agro',
      tag: 'कृषि मौसम सलाह',
      icon: Sprout,
      query: 'इस सप्ताह पूर्वी भारत में धान की बुवाई के लिए क्या कृषि सलाह है?'
    },
    {
      id: 'hi-4',
      category: 'heatwave',
      tag: 'लू की चेतावनी',
      icon: Sun,
      query: 'क्या राजस्थान या विदर्भ में लू (Heatwave) की कोई सक्रिय चेतावनी है?'
    },
    {
      id: 'hi-5',
      category: 'flood',
      tag: 'बाढ़ चेतावनी',
      icon: Waves,
      query: 'असम और बिहार में प्रमुख नदियों के जलस्तर और बाढ़ की क्या स्थिति है?'
    },
    {
      id: 'hi-6',
      category: 'monsoon',
      tag: 'दिल्ली मौसम',
      icon: CloudRain,
      query: 'क्या अगले 24 घंटों में दिल्ली-एनसीआर में भारी बारिश और जलभराव होगा?'
    },
    {
      id: 'hi-7',
      category: 'seismic',
      tag: 'भूकंप सूचना',
      icon: Activity,
      query: 'क्या आज उत्तर भारत या हिमालयी क्षेत्र में कोई भूकंपीय हलचल दर्ज हुई है?'
    },
    {
      id: 'hi-8',
      category: 'agro',
      tag: 'फसल सुरक्षा',
      icon: Sprout,
      query: 'वर्तमान मौसम में खरीफ फसलों में कीट नियंत्रण के लिए क्या उपाय करें?'
    },
    {
      id: 'hi-9',
      category: 'general',
      tag: 'वायु गुणवत्ता',
      icon: Activity,
      query: 'दिल्ली-एनसीआर में आज वायु गुणवत्ता सूचकांक (AQI) का क्या स्तर है?'
    },
    {
      id: 'hi-10',
      category: 'flood',
      tag: 'पहाड़ी भूस्खलन',
      icon: Waves,
      query: 'उत्तराखंड और हिमाचल प्रदेश में भारी बारिश और भूस्खलन की क्या चेतावनी है?'
    },
    {
      id: 'hi-11',
      category: 'marine',
      tag: 'मछुआरों को चेतावनी',
      icon: Navigation,
      query: 'क्या अरब सागर और बंगाल की खाड़ी में मछुआरों के लिए समुद्र में न जाने की चेतावनी है?'
    },
    {
      id: 'hi-12',
      category: 'cold',
      tag: 'पश्चिमी विक्षोभ',
      icon: ThermometerSnowflake,
      query: 'क्या उत्तर भारत में सक्रिय पश्चिमी विक्षोभ के कारण वर्षा या बर्फबारी होगी?'
    },
    {
      id: 'hi-13',
      category: 'cold',
      tag: 'शीतलहर अलर्ट',
      icon: ThermometerSnowflake,
      query: 'पंजाब, हरियाणा और राजस्थान में न्यूनतम तापमान कितना गिरने की संभावना है?'
    },
    {
      id: 'hi-14',
      category: 'monsoon',
      tag: 'उत्तर प्रदेश मौसम',
      icon: CloudRain,
      query: 'लखनऊ, वाराणसी और पूर्वी उत्तर प्रदेश में अगले 48 घंटों में बारिश का क्या अनुमान है?'
    },
    {
      id: 'hi-15',
      category: 'cyclone',
      tag: 'आंधी-तूफान',
      icon: Zap,
      query: 'मध्य प्रदेश और छत्तीसगढ़ में गरज-चमक और आकाशीय बिजली की क्या चेतावनी है?'
    },
    {
      id: 'hi-16',
      category: 'general',
      tag: 'आपदा हेल्पलाइन',
      icon: ShieldAlert,
      query: 'चक्रवात या बाढ़ की स्थिति में एनडीएमए (NDMA 1078) और आपातकालीन नंबर क्या हैं?'
    },
    {
      id: 'hi-17',
      category: 'agro',
      tag: 'सिंचाई सलाह',
      icon: Sprout,
      query: 'मध्य भारत में कपास और सोयाबीन की फसलों में सिंचाई की क्या आवश्यकता है?'
    },
    {
      id: 'hi-18',
      category: 'aviation',
      tag: 'उड़ान मौसम',
      icon: Plane,
      query: 'क्या कोहरे या खराब मौसम के कारण दिल्ली एयरपोर्ट पर उड़ानों में देरी हो रही है?'
    },
    {
      id: 'hi-19',
      category: 'flood',
      tag: 'यमुना जलस्तर',
      icon: Waves,
      query: 'दिल्ली में यमुना नदी का जलस्तर खतरे के निशान से कितना ऊपर या नीचे है?'
    },
    {
      id: 'hi-20',
      category: 'monsoon',
      tag: 'राजस्थान बारिश',
      icon: CloudRain,
      query: 'जयपुर, जोधपुर और कोटा संभाग में मानसून की सक्रियता की क्या स्थिति है?'
    },
    {
      id: 'hi-21',
      category: 'heatwave',
      tag: 'लू से बचाव',
      icon: Sun,
      query: 'विदर्भ और मराठवाड़ा में अत्यधिक तापमान से बचाव के लिए स्वास्थ्य सलाह क्या है?'
    }
  ],
  mr: [
    {
      id: 'mr-1',
      category: 'monsoon',
      tag: 'पाऊस अंदाज',
      icon: CloudRain,
      query: 'मुंबई, कोकण आणि पश्चिम महाराष्ट्रात पुढील 3 दिवसांत किती पाऊस पडेल?'
    },
    {
      id: 'mr-2',
      category: 'agro',
      tag: 'शेती सल्ला',
      icon: Sprout,
      query: 'विदर्भ आणि मराठवाड्यातील कापूस व सोयाबीन पिकांसाठी हवामान सल्ला काय आहे?'
    },
    {
      id: 'mr-3',
      category: 'heatwave',
      tag: 'उष्णतेची लाट',
      icon: Sun,
      query: 'महाराष्ट्रातील कोणत्या जिल्ह्यांमध्ये उष्णतेच्या लाटेचा (Heatwave) यलो अलर्ट आहे?'
    },
    {
      id: 'mr-4',
      category: 'flood',
      tag: 'पूर इशारा',
      icon: Waves,
      query: 'कोल्हापूर, सांगली आणि पंचगंगा नदीच्या पाणी पातळीची सद्यस्थिती काय आहे?'
    },
    {
      id: 'mr-5',
      category: 'monsoon',
      tag: 'पुणे हवामान',
      icon: CloudRain,
      query: 'पुणे आणि घाटमाथ्यावर मुसळधार पावसाचा अंदाज हवामान विभागाने काय दिला आहे?'
    },
    {
      id: 'mr-6',
      category: 'cyclone',
      tag: 'चक्रीवादळ इशारा',
      icon: Wind,
      query: 'अरबी समुद्रात कमी दाबाचा पट्टा निर्माण होऊन चक्रीवादळाचा धोका आहे का?'
    },
    {
      id: 'mr-7',
      category: 'marine',
      tag: 'कोकण किनारा',
      icon: Navigation,
      query: 'कोकणातील मच्छीमारांसाठी समुद्रातील वादळी वाऱ्यांचा काय इशारा आहे?'
    },
    {
      id: 'mr-8',
      category: 'agro',
      tag: 'ऊस व फळबागा',
      icon: Sprout,
      query: 'सध्याच्या हवामानात डाळिंब व द्राक्ष बागांवर कीड नियंत्रणासाठी काय उपाय करावेत?'
    }
  ],
  bn: [
    {
      id: 'bn-1',
      category: 'cyclone',
      tag: 'ঘূর্ণিঝড় সতর্কতা',
      icon: Wind,
      query: 'বঙ্গোপসাগরে সৃষ্ট নিম্নচাপ কি ঘূর্ণিঝড়ে রূপ নিতে পারে?'
    },
    {
      id: 'bn-2',
      category: 'monsoon',
      tag: 'বৃষ্টির পূর্বাভাস',
      icon: CloudRain,
      query: 'কলকাতা ও দক্ষিণবঙ্গে আগামী ৪৮ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা আছে কি?'
    },
    {
      id: 'bn-3',
      category: 'agro',
      tag: 'কৃষি আবহাওয়া',
      icon: Sprout,
      query: 'বর্তমান আবহাওয়ায় আমন ধান রোপণের জন্য কী সতর্কতা অবলম্বন করা উচিত?'
    },
    {
      id: 'bn-4',
      category: 'flood',
      tag: 'বন্যা সতর্কতা',
      icon: Waves,
      query: 'উত্তরবঙ্গ ও তিস্তা নদীর জলস্তর বৃদ্ধির কোনো সতর্কতা জারি হয়েছে কি?'
    },
    {
      id: 'bn-5',
      category: 'marine',
      tag: 'উপকূলীয় সতর্কবার্তা',
      icon: Navigation,
      query: 'দীঘা ও সুন্দরবন উপকূলীয় মৎস্যজীবীদের জন্য সমুদ্রের পূর্বাভাস কী?'
    },
    {
      id: 'bn-6',
      category: 'seismic',
      tag: 'ভূমিকম্প পর্যবেক্ষণ',
      icon: Activity,
      query: 'আজ উত্তর-পূর্ব ভারত বা হিমালয় অঞ্চলে কোনো ভূমিকম্প অনুভূত হয়েছে কি?'
    }
  ],
  ta: [
    {
      id: 'ta-1',
      category: 'monsoon',
      tag: 'மழை முன்னறிவிப்பு',
      icon: CloudRain,
      query: 'சென்னை மற்றும் கடலோர தமிழகத்தில் அடுத்த 3 நாட்களுக்கு மழை நிலவரம் என்ன?'
    },
    {
      id: 'ta-2',
      category: 'cyclone',
      tag: 'புயல் எச்சரிக்கை',
      icon: Wind,
      query: 'வங்கக்கடலில் புதிய காற்றழுத்த தாழ்வு நிலை உருவாகியுள்ளதா?'
    },
    {
      id: 'ta-3',
      category: 'agro',
      tag: 'விவசாய ஆலோசனை',
      icon: Sprout,
      query: 'தற்போதைய பருவமழைக்கு ஏற்ப குறுவை நெல் சாகுபடிக்கான பயிர் பாதுகாப்பு என்ன?'
    },
    {
      id: 'ta-4',
      category: 'heatwave',
      tag: 'வெப்ப அலை',
      icon: Sun,
      query: 'தமிழக உள் மாவட்டங்களில் வெப்பநிலை இயல்பை விட அதிகமாக பதிவாகுமா?'
    },
    {
      id: 'ta-5',
      category: 'marine',
      tag: 'மீனவர் எச்சரிக்கை',
      icon: Navigation,
      query: 'மன்னார் வளைகுடா மற்றும் கன்னியாகுமரி கடற்பகுதியில் காற்றின் வேகம் என்ன?'
    }
  ],
  te: [
    {
      id: 'te-1',
      category: 'monsoon',
      tag: 'వర్షపాత సూచన',
      icon: CloudRain,
      query: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో రాబోయే 3 రోజుల్లో వర్షపాతం ఎలా ఉంటుంది?'
    },
    {
      id: 'te-2',
      category: 'cyclone',
      tag: 'తుఫాను హెచ్చరిక',
      icon: Wind,
      query: 'బంగాళాఖాతంలో వాయుగుండం ప్రభావం కోస్తాంధ్రపై ఎంతవరకు ఉంటుంది?'
    },
    {
      id: 'te-3',
      category: 'agro',
      tag: 'వ్యవసాయ సలహా',
      icon: Sprout,
      query: 'ప్రస్తుత వర్షాల దృష్ట్యా వరి, పత్తి పంటల సంరక్షణకు తీసుకోవాల్సిన జాగ్రత్తలు ఏమిటి?'
    },
    {
      id: 'te-4',
      category: 'flood',
      tag: 'వరద సమాచారం',
      icon: Waves,
      query: 'గోదావరి, కృష్ణా నదుల ప్రస్తుత నీటిమట్టం మరియు వరద ప్రవాహం ఎంత ఉంది?'
    }
  ],
  gu: [
    {
      id: 'gu-1',
      category: 'monsoon',
      tag: 'વરસાદની આગાહી',
      icon: CloudRain,
      query: 'સૌરાષ્ટ્ર અને દક્ષિણ ગુજરાતમાં આગામી 3 દિવસમાં ભારે વરસાદની શક્યતા છે?'
    },
    {
      id: 'gu-2',
      category: 'cyclone',
      tag: 'વાવાઝોડાની સ્થિતિ',
      icon: Wind,
      query: 'અરબી સમુદ્રમાં સર્જાયેલ ડિપ્રેશનથી ગુજરાતના દરિયાકાંઠે શું ચેતવણી છે?'
    },
    {
      id: 'gu-3',
      category: 'agro',
      tag: 'કૃષિ સલાહ',
      icon: Sprout,
      query: 'વર્તમાન ભેજવાળા વાતાવરણમાં મગફળી અને કપાસના પાકને રક્ષણ માટે શું કરવું?'
    },
    {
      id: 'gu-4',
      category: 'heatwave',
      tag: 'ગરમીની ચેતવણી',
      icon: Sun,
      query: 'અમદાવાદ અને કચ્છમાં લૂ (હીટવેવ) અંગે હવામાન વિભાગની શું આગાહી છે?'
    }
  ],
  kn: [
    {
      id: 'kn-1',
      category: 'monsoon',
      tag: 'ಮಳೆ ಮುನ್ಸೂಚನೆ',
      icon: CloudRain,
      query: 'ಬೆಂಗಳೂರು ಮತ್ತು ಕರಾವಳಿ ಕರ್ನಾಟಕದಲ್ಲಿ ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಏನು?'
    },
    {
      id: 'kn-2',
      category: 'cyclone',
      tag: 'ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ',
      icon: Wind,
      query: 'ಅರಬ್ಬಿ ಸಮುದ್ರದಲ್ಲಿ ಚಂಡಮಾರುತ ಅಥವಾ ವಾಯುಭಾರ ಕುಸಿತದ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?'
    },
    {
      id: 'kn-3',
      category: 'agro',
      tag: 'ಕೃಷಿ ಹವಾಮಾನ',
      icon: Sprout,
      query: 'ಈ ವಾರ ಭತ್ತ ಮತ್ತು ರಾಗಿ ಬೆಳೆಗೆ ಯಾವ ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆ ಅನ್ವಯಿಸುತ್ತದೆ?'
    },
    {
      id: 'kn-4',
      category: 'flood',
      tag: 'ಜಲಾಶಯ ಮಟ್ಟ',
      icon: Waves,
      query: 'ಕಾವೇರಿ ಜಲಾನಯನ ಪ್ರದೇಶದಲ್ಲಿ ಜಲಾಶಯಗಳ ಒಳಹರಿವು ಮತ್ತು ನೀರಿನ ಮಟ್ಟದ ಸ್ಥಿತಿ ಏನು?'
    }
  ],
  ml: [
    {
      id: 'ml-1',
      category: 'monsoon',
      tag: 'മഴ പ്രവചനം',
      icon: CloudRain,
      query: 'കേരള തീരത്തും കൊച്ചിയിലും അടുത്ത 3 ദിവസത്തെ മഴ പ്രവചനം എന്താണ്?'
    },
    {
      id: 'ml-2',
      category: 'marine',
      tag: 'തീരദേശ മുന്നറിയിപ്പ്',
      icon: Navigation,
      query: 'അറബിക്കടലിൽ ന്യൂനമർദ്ദമോ കാറ്റോ സംബന്ധിച്ച് മത്സ്യത്തൊഴിലാളികൾക്ക് മുന്നറിയിപ്പുണ്ടോ?'
    },
    {
      id: 'ml-3',
      category: 'flood',
      tag: 'ഉരുൾപൊട്ടൽ ജാഗ്രത',
      icon: Waves,
      query: 'ഇടുക്കി, വയനാട് ജില്ലകളിൽ ഉരുൾപൊട്ടൽ അല്ലെങ്കിൽ മലയോര ജാഗ്രതാ നിർദ്ദേശങ്ങൾ ഉണ്ടോ?'
    },
    {
      id: 'ml-4',
      category: 'agro',
      tag: 'കാർഷിക ഉപദേശം',
      icon: Sprout,
      query: 'നെല്ല്, റബ്ബർ കർഷകർക്കായി ഈ ആഴ്ചയിലെ പ്രധാന കാർഷിക കാലാവസ്ഥാ ഉപദേശം എന്താണ്?'
    }
  ],
  or: [
    {
      id: 'or-1',
      category: 'monsoon',
      tag: 'ବର୍ଷା ପୂର୍ବାନୁମାନ',
      icon: CloudRain,
      query: 'ଓଡ଼ିଶା ଉପକୂଳ ଏବଂ ଭୁବନେଶ୍ୱରରେ ଆସନ୍ତା ୩ ଦିନର ବର୍ଷା ପୂର୍ବାନୁମାନ କ’ଣ?'
    },
    {
      id: 'or-2',
      category: 'cyclone',
      tag: 'ବାତ୍ୟା ସତର୍କତା',
      icon: Wind,
      query: 'ବଙ୍ଗୋପସାଗରରେ ସୃଷ୍ଟି ହୋଇଥିବା ଲଘୁଚାପ ବାତ୍ୟାରେ ପରିଣତ ହେବାର ସମ୍ଭାବନା ଅଛି କି?'
    },
    {
      id: 'or-3',
      category: 'agro',
      tag: 'କୃଷି ପରାମର୍ଶ',
      icon: Sprout,
      query: 'ଚଳିତ ଋତୁରେ ଧାନ ଫସଲ ପାଇଁ କୃଷି ପାଣିପାଗ ପରାମର୍ଶ କ’ଣ ରହିଛି?'
    },
    {
      id: 'or-4',
      category: 'flood',
      tag: 'ନଦୀ ଜଳସ୍ତର',
      icon: Waves,
      query: 'ମହାନଦୀ ଅବବାହିକା ଏବଂ ହୀରାକୁଦ ଡ୍ୟାମର ଜଳସ୍ତର ସ୍ଥିତି କ’ଣ?'
    }
  ],
  pa: [
    {
      id: 'pa-1',
      category: 'monsoon',
      tag: 'ਮੀਂਹ ਦੀ ਭਵਿੱਖਬਾਣੀ',
      icon: CloudRain,
      query: 'ਪੰਜਾਬ ਅਤੇ ਹਰਿਆਣਾ ਵਿੱਚ ਅਗਲੇ 3 ਦਿਨਾਂ ਦੌਰਾਨ ਮੌਸਮ ਅਤੇ ਮੀਂਹ ਦੀ ਕੀ ਭਵਿੱਖਬਾਣੀ ਹੈ?'
    },
    {
      id: 'pa-2',
      category: 'agro',
      tag: 'ਖੇਤੀ ਮੌਸਮ ਸਲਾਹ',
      icon: Sprout,
      query: 'ਸਾਉਣੀ ਦੀਆਂ ਫ਼ਸਲਾਂ (ਝੋਨਾ ਤੇ ਨਰਮਾ) ਲਈ ਇਸ ਹਫ਼ਤੇ ਖੇਤੀ ਮੌਸਮ ਸਲਾਹ ਕੀ ਹੈ?'
    },
    {
      id: 'pa-3',
      category: 'heatwave',
      tag: 'ਗਰਮ ਹਵਾਵਾਂ ਦੀ ਚੇਤਾਵਨੀ',
      icon: Sun,
      query: 'ਕੀ ਪੰਜਾਬ ਦੇ ਮੈਦਾਨੀ ਇਲਾਕਿਆਂ ਵਿੱਚ ਹੀਟਵੇਵ ਜਾਂ ਗਰਮ ਹਵਾਵਾਂ ਦੀ ਚੇਤਾਵਨੀ ਹੈ?'
    },
    {
      id: 'pa-4',
      category: 'flood',
      tag: 'ਹੜ੍ਹ ਸੰਬੰਧੀ ਸਥਿਤੀ',
      icon: Waves,
      query: 'ਸਤਲੁਜ ਅਤੇ ਬਿਆਸ ਦਰਿਆਵਾਂ ਵਿੱਚ ਪਾਣੀ ਦੇ ਪੱਧਰ ਅਤੇ ਸੰਭਾਵੀ ਹੜ੍ਹਾਂ ਦੀ ਕੀ ਸਥਿਤੀ ਹੈ?'
    }
  ],
  as: [
    {
      id: 'as-1',
      category: 'monsoon',
      tag: 'বৰষুণৰ পূৰ্বানুমান',
      icon: CloudRain,
      query: 'গুৱাহাটী আৰু অসমৰ বাবে অহা ৩ দিনৰ বৰষুণৰ পূৰ্বানুমান কি?'
    },
    {
      id: 'as-2',
      category: 'flood',
      tag: 'বানপানীৰ স্থিতি',
      icon: Waves,
      query: 'ব্ৰহ্মপুত্ৰ আৰু বৰাক নদীৰ জলপৃষ্ঠ বৃদ্ধি তথা বানপানীৰ স্থিতি কেনেকুৱা?'
    },
    {
      id: 'as-3',
      category: 'agro',
      tag: 'কৃষি বতৰ পৰামৰ্শ',
      icon: Sprout,
      query: 'অসমৰ চাহ বাগিচা আৰু শালি ধানৰ খেতিৰ বাবে বতৰৰ পৰামৰ্শ কি?'
    },
    {
      id: 'as-4',
      category: 'cyclone',
      tag: 'ধুমুহাৰ সজাগতা',
      icon: Wind,
      query: 'উত্তৰ-পূৰ্বাঞ্চলত বজ্ৰপাত আৰু ধুমুহাৰ কোনো সজাগতা জাৰি কৰা হৈছে নেকি?'
    }
  ]
}

// Futuristic cyber encryption/matrix glyphs for glitch decoding
const GLITCH_CIPHER_GLYPHS = '01#@$%&<>_~-+=/[]{}*^!?010101XYZ09█▓▒░∆∑λµ¢'

/**
 * Advanced Multi-Stage Glitch Decoding Hook
 * PURE CYBER GLITCH: Unscrambles text via matrix glyphs with chromatic jitter
 */
function useAdvancedGlitchText(targetText: string, triggerKey: number, delayMs = 0) {
  const [displayText, setDisplayText] = useState(targetText)
  const [isGlitching, setIsGlitching] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      let frame = 0
      const totalFrames = 18
      setIsGlitching(true)

      const animate = () => {
        frame++
        if (frame >= totalFrames) {
          setDisplayText(targetText)
          setIsGlitching(false)
          return
        }

        const progress = frame / totalFrames
        const chars = targetText.split('')
        const resolvedCount = Math.floor(chars.length * progress)

        const scrambled = chars
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < resolvedCount) return char
            return GLITCH_CIPHER_GLYPHS[Math.floor(Math.random() * GLITCH_CIPHER_GLYPHS.length)]
          })
          .join('')

        setDisplayText(scrambled)
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }, delayMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [targetText, triggerKey, delayMs])

  return { displayText, isGlitching }
}

interface SingleGlitchCardProps {
  item: PromptItem
  triggerKey: number
  delayMs: number
  onSelect: (query: string) => void
}

function SingleGlitchCard({ item, triggerKey, delayMs, onSelect }: SingleGlitchCardProps) {
  const { displayText, isGlitching } = useAdvancedGlitchText(item.query, triggerKey, delayMs)
  const IconComponent = item.icon

  // Billion-Dollar Minimalist Color System (Restrained, Muted, Tone-on-Tone Capsules)
  const getPillStyle = (cat: string) => {
    switch (cat) {
      case 'monsoon':
        return {
          pill: 'bg-sky-50 text-sky-900 border-sky-200/70 dark:bg-sky-500/[0.09] dark:text-sky-300/95 dark:border-sky-500/20',
          dot: 'bg-sky-500 dark:bg-sky-400'
        }
      case 'cyclone':
        return {
          pill: 'bg-amber-50 text-amber-900 border-amber-200/70 dark:bg-amber-500/[0.09] dark:text-amber-300/95 dark:border-amber-500/20',
          dot: 'bg-amber-500 dark:bg-amber-400'
        }
      case 'agro':
        return {
          pill: 'bg-emerald-50 text-emerald-900 border-emerald-200/70 dark:bg-emerald-500/[0.09] dark:text-emerald-300/95 dark:border-emerald-500/20',
          dot: 'bg-emerald-500 dark:bg-emerald-400'
        }
      case 'heatwave':
        return {
          pill: 'bg-orange-50 text-orange-900 border-orange-200/70 dark:bg-orange-500/[0.09] dark:text-orange-300/95 dark:border-orange-500/20',
          dot: 'bg-orange-500 dark:bg-orange-400'
        }
      case 'flood':
        return {
          pill: 'bg-blue-50 text-blue-900 border-blue-200/70 dark:bg-blue-500/[0.09] dark:text-blue-300/95 dark:border-blue-500/20',
          dot: 'bg-blue-500 dark:bg-blue-400'
        }
      case 'seismic':
        return {
          pill: 'bg-purple-50 text-purple-900 border-purple-200/70 dark:bg-purple-500/[0.09] dark:text-purple-300/95 dark:border-purple-500/20',
          dot: 'bg-purple-500 dark:bg-purple-400'
        }
      case 'marine':
        return {
          pill: 'bg-cyan-50 text-cyan-900 border-cyan-200/70 dark:bg-cyan-500/[0.09] dark:text-cyan-300/95 dark:border-cyan-500/20',
          dot: 'bg-cyan-500 dark:bg-cyan-400'
        }
      case 'aviation':
        return {
          pill: 'bg-slate-100 text-slate-900 border-slate-300/70 dark:bg-slate-500/[0.12] dark:text-slate-200 dark:border-slate-500/20',
          dot: 'bg-slate-500 dark:bg-slate-300'
        }
      case 'cold':
        return {
          pill: 'bg-indigo-50 text-indigo-900 border-indigo-200/70 dark:bg-indigo-500/[0.09] dark:text-indigo-300/95 dark:border-indigo-500/20',
          dot: 'bg-indigo-500 dark:bg-indigo-400'
        }
      default:
        return {
          pill: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-white/[0.06] dark:text-neutral-300 dark:border-white/[0.1]',
          dot: 'bg-slate-400 dark:bg-neutral-400'
        }
    }
  }

  const { pill, dot } = getPillStyle(item.category)

  return (
    <button
      type="button"
      onClick={() => onSelect(item.query)}
      className={`relative group w-full h-[88px] sm:h-[94px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border transition-colors duration-150 cursor-pointer overflow-hidden flex flex-col justify-between select-none
        bg-white/90 dark:bg-[#141418]
        border-slate-200/70 dark:border-white/[0.07]
        hover:border-slate-300 dark:hover:border-white/[0.16]
        shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]
        ${isGlitching ? 'border-emerald-500/50 dark:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]' : ''}`}
    >
      {/* Top Row: Compact Billion-Dollar Capsule Pill and Minimal Arrow */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        {/* Capsule Pill */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-medium tracking-tight border transition-colors ${pill}`}>
          <span className={`w-1 h-1 rounded-full shrink-0 ${dot}`} />
          <IconComponent className="w-2.5 h-2.5 opacity-80 shrink-0" />
          <span>{item.tag}</span>
        </span>

        {/* Minimal Arrow Icon */}
        <ArrowUpRight className="w-3 h-3 text-slate-400 dark:text-neutral-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-150 shrink-0" />
      </div>

      {/* Query Text with Compact Fixed Container */}
      <div className="h-[34px] sm:h-[38px] overflow-hidden flex items-center">
        <p 
          className={`text-[12px] sm:text-[12.5px] leading-snug font-normal transition-colors duration-150 font-sans line-clamp-2
            ${isGlitching 
              ? 'font-mono text-emerald-600 dark:text-emerald-300 tracking-tight select-none animate-glitch-chromatic' 
              : 'text-slate-700 dark:text-[#a0aab6] group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
        >
          {displayText}
        </p>
      </div>
    </button>
  )
}

interface AnimatedGlitchPromptsProps {
  selectedLanguage: string
  onSelectPrompt: (query: string) => void
}

export default function AnimatedGlitchPrompts({
  selectedLanguage,
  onSelectPrompt,
}: AnimatedGlitchPromptsProps) {
  // Retrieve raw pool for the chosen language
  const rawPool = PROMPT_POOLS[selectedLanguage] || PROMPT_POOLS.en

  // Keep a randomized queue so questions rotate across all 24+ items without immediate repetition
  const queueRef = useRef<PromptItem[]>([])
  const cycleIndexRef = useRef(0)

  // 4 active cards shown in the 2x2 grid
  const [activeItems, setActiveItems] = useState<PromptItem[]>(() => {
    const shuffled = shuffleArray(rawPool)
    return shuffled.slice(0, 4)
  })

  const [glitchCycles, setGlitchCycles] = useState<number[]>([0, 0, 0, 0])
  const [isHovered, setIsHovered] = useState(false)

  // When language changes, re-shuffle the 24+ pool completely
  useEffect(() => {
    const freshPool = PROMPT_POOLS[selectedLanguage] || PROMPT_POOLS.en
    const shuffled = shuffleArray(freshPool)
    setActiveItems(shuffled.slice(0, 4))
    queueRef.current = shuffled.slice(4)
    setGlitchCycles([0, 0, 0, 0])
    cycleIndexRef.current = 0
  }, [selectedLanguage])

  // Autonomous side-by-side glitch transformation: rotates through the 24+ item pool
  const triggerAutonomousGlitch = useCallback(() => {
    const pool = PROMPT_POOLS[selectedLanguage] || PROMPT_POOLS.en
    if (pool.length <= 4) return

    setActiveItems((prev) => {
      // Pick 2 slots to cycle on each step (top row 0 & 1, then bottom row 2 & 3)
      const isTopRow = cycleIndexRef.current % 2 === 0
      const targetSlots = isTopRow ? [0, 1] : [2, 3]
      cycleIndexRef.current++

      const updated = [...prev]
      const currentlyDisplayedIds = new Set(updated.map((i) => i.id))

      targetSlots.forEach((slot) => {
        // Refill queue if depleted
        if (queueRef.current.length === 0) {
          const freshShuffle = shuffleArray(pool).filter((item) => !currentlyDisplayedIds.has(item.id))
          queueRef.current = freshShuffle
        }

        // Shift next candidate from queue
        let nextItem = queueRef.current.shift()
        if (!nextItem || currentlyDisplayedIds.has(nextItem.id)) {
          const candidates = pool.filter((item) => !currentlyDisplayedIds.has(item.id))
          nextItem = candidates[Math.floor(Math.random() * candidates.length)]
        }

        if (nextItem) {
          updated[slot] = nextItem
          currentlyDisplayedIds.add(nextItem.id)
        }
      })

      // Increment glitch cycles to trigger glitch decode animation
      setGlitchCycles((c) => {
        const next = [...c]
        targetSlots.forEach((s) => {
          next[s] = (next[s] || 0) + 1
        })
        return next
      })

      return updated
    })
  }, [selectedLanguage])

  // Continuous autonomous cycle every 4.8 seconds (paused on hover)
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      triggerAutonomousGlitch()
    }, 4800)

    return () => clearInterval(interval)
  }, [isHovered, triggerAutonomousGlitch])

  return (
    <div 
      className="mt-4 sm:mt-5 w-full max-w-2xl mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 2x2 Grid with Compact Gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full text-left">
        {activeItems.map((item, idx) => (
          <SingleGlitchCard
            key={item.id + '-' + idx}
            item={item}
            triggerKey={glitchCycles[idx]}
            delayMs={idx * 130}
            onSelect={onSelectPrompt}
          />
        ))}
      </div>
    </div>
  )
}
