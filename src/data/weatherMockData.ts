export interface WeatherAlert {
  id: string
  title: string
  region: string
  state: string
  severity: 'extreme' | 'severe' | 'moderate' | 'minor'
  category: 'Cyclone' | 'Heavy Rainfall' | 'Flood' | 'Heatwave' | 'Thunderstorm' | 'Landslide'
  issuedAt: string
  validUntil: string
  description: string
  affectedDistricts: string[]
  recommendedActions: string[]
  source: string
}

export interface ClimateTrend {
  month: string
  actualRainfall: number // mm
  normalRainfall: number // mm
  tempAnomaly: number // °C
}

export interface RegionalClimateStat {
  region: string
  avgTemp: number // °C
  humidity: number // %
  rainfallDeparture: number // % departure from normal
  monsoonStatus: 'Active' | 'Vigorous' | 'Normal' | 'Deficient'
  uvIndex: number
}

export interface WeatherChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  thinking?: string
  timestamp: string
  dataSnippet?: {
    type: 'forecast' | 'alert' | 'agro' | 'trend'
    title: string
    details: { label: string; value: string }[]
  }
}

export const INITIAL_ALERTS: WeatherAlert[] = [
  {
    id: 'alt-001',
    title: 'Severe Cyclonic Storm Advisory (Bay of Bengal)',
    region: 'Coastal Odisha & Northern Andhra Pradesh',
    state: 'Odisha',
    severity: 'extreme',
    category: 'Cyclone',
    issuedAt: 'Today, 04:30 IST',
    validUntil: 'Next 48 Hours',
    description: 'Deep depression over Westcentral Bay of Bengal intensified into severe cyclonic storm with sustained winds of 110-120 km/h gusting to 135 km/h.',
    affectedDistricts: ['Puri', 'Ganjam', 'Jagatsinghpur', 'Kendrapara', 'Srikakulam'],
    recommendedActions: [
      'Total suspension of fishing operations along Odisha and North Andhra coasts.',
      'Coastal evacuation protocols activated in low-lying panchayats.',
      'Stocking of drinking water, dry rations, and medical generators at shelter clusters.'
    ],
    source: 'IMD National Weather Forecasting Centre'
  },
  {
    id: 'alt-002',
    title: 'Extremely Heavy Rainfall & Flash Flood Warning',
    region: 'Barak Valley & South Assam',
    state: 'Assam',
    severity: 'severe',
    category: 'Heavy Rainfall',
    issuedAt: 'Today, 06:15 IST',
    validUntil: 'Next 24 Hours',
    description: 'Widespread torrential precipitation expected with isolated rainfall exceeding 200 mm. Barak and tributaries approaching danger marks.',
    affectedDistricts: ['Cachar', 'Karimganj', 'Hailakandi', 'Dima Hasao'],
    recommendedActions: [
      'Avoid transit through low-lying river embankments.',
      'Disaster quick-response teams placed on standby along NH-37 and NH-6.'
    ],
    source: 'Regional Meteorological Centre, Guwahati'
  },
  {
    id: 'alt-003',
    title: 'Heatwave to Severe Heatwave Bulletin',
    region: 'Western Rajasthan & Vidarbha',
    state: 'Rajasthan',
    severity: 'severe',
    category: 'Heatwave',
    issuedAt: 'Yesterday, 18:00 IST',
    validUntil: 'Next 72 Hours',
    description: 'Maximum temperatures likely to hover between 44°C and 47°C with severe dry hot westerly winds across arid districts.',
    affectedDistricts: ['Bikaner', 'Jaisalmer', 'Barmer', 'Jodhpur', 'Nagaur'],
    recommendedActions: [
      'Avoid sun exposure between 11:30 AM and 04:00 PM.',
      'Ensure adequate hydration; livestock shelters to provide active shading.'
    ],
    source: 'IMD New Delhi Agro-Met Division'
  },
  {
    id: 'alt-004',
    title: 'Thunderstorm with Gusty Winds & Lightning',
    region: 'Sub-Himalayan West Bengal & Sikkim',
    state: 'Sikkim',
    severity: 'moderate',
    category: 'Thunderstorm',
    issuedAt: 'Today, 08:00 IST',
    validUntil: 'Today, 20:00 IST',
    description: 'Convective thunderstorm cells with surface wind gusts up to 55 km/h and localized hail risk in elevated valleys.',
    affectedDistricts: ['East Sikkim', 'West Sikkim', 'Darjeeling', 'Kalimpong'],
    recommendedActions: [
      'Do not take shelter under solitary trees during active lightning.',
      'Farmers advised to postpone pesticide spraying on open terraces.'
    ],
    source: 'Meteorological Centre, Gangtok'
  },
  {
    id: 'alt-005',
    title: 'Moderate Rainfall with Hill Slope Instability',
    region: 'Garhwal & Kumaon Foothills',
    state: 'Uttarakhand',
    severity: 'moderate',
    category: 'Landslide',
    issuedAt: 'Today, 05:45 IST',
    validUntil: 'Next 36 Hours',
    description: 'Continuous moderate rainfall (60-90 mm) causing localized debris fall and mudslide potential along mountain arterial routes.',
    affectedDistricts: ['Rudraprayag', 'Chamoli', 'Uttarkashi', 'Pithoragarh'],
    recommendedActions: [
      'Pilgrimage convoys advised to travel only during daylight hours.',
      'Highway clearance machinery stationed at critical bends.'
    ],
    source: 'IMD Dehradun & State Disaster Authority'
  },
  {
    id: 'alt-006',
    title: 'Maritime High Swell & Wind Alert',
    region: 'Konkan Coast & Goa',
    state: 'Maharashtra',
    severity: 'minor',
    category: 'Cyclone',
    issuedAt: 'Today, 09:30 IST',
    validUntil: 'Next 48 Hours',
    description: 'Squally wind speed reaching 40-50 km/h gusting to 60 km/h along and off Maharashtra-Goa coasts with swell waves up to 3.2 meters.',
    affectedDistricts: ['Mumbai City', 'Mumbai Suburban', 'Raigad', 'Ratnagiri', 'Sindhudurg'],
    recommendedActions: [
      'Small craft and recreational vessels advised not to venture into deep sea.',
      'Beachside promenades to monitor tide swells.'
    ],
    source: 'Regional Meteorological Centre, Mumbai'
  }
]

export const CLIMATE_TRENDS: ClimateTrend[] = [
  { month: 'Jan', actualRainfall: 18.2, normalRainfall: 17.5, tempAnomaly: +0.4 },
  { month: 'Feb', actualRainfall: 22.4, normalRainfall: 23.1, tempAnomaly: +0.6 },
  { month: 'Mar', actualRainfall: 34.0, normalRainfall: 31.8, tempAnomaly: +0.9 },
  { month: 'Apr', actualRainfall: 41.5, normalRainfall: 38.2, tempAnomaly: +1.2 },
  { month: 'May', actualRainfall: 68.2, normalRainfall: 62.0, tempAnomaly: +0.8 },
  { month: 'Jun', actualRainfall: 174.6, normalRainfall: 165.3, tempAnomaly: +0.3 },
  { month: 'Jul', actualRainfall: 289.4, normalRainfall: 280.5, tempAnomaly: -0.1 },
  { month: 'Aug', actualRainfall: 262.1, normalRainfall: 254.9, tempAnomaly: +0.2 },
  { month: 'Sep', actualRainfall: 185.3, normalRainfall: 167.9, tempAnomaly: +0.5 },
  { month: 'Oct', actualRainfall: 84.7, normalRainfall: 75.4, tempAnomaly: +0.7 },
  { month: 'Nov', actualRainfall: 29.8, normalRainfall: 30.2, tempAnomaly: +0.4 },
  { month: 'Dec', actualRainfall: 14.1, normalRainfall: 16.0, tempAnomaly: +0.5 }
]

export const REGIONAL_CLIMATE_STATS: RegionalClimateStat[] = [
  { region: 'Northern Plains (Delhi, UP, Punjab)', avgTemp: 34.2, humidity: 58, rainfallDeparture: +12, monsoonStatus: 'Active', uvIndex: 8 },
  { region: 'Western Arid Zone (Rajasthan, Gujarat)', avgTemp: 39.8, humidity: 42, rainfallDeparture: -18, monsoonStatus: 'Deficient', uvIndex: 10 },
  { region: 'Central India (MP, Chhattisgarh, Vidarbha)', avgTemp: 32.5, humidity: 68, rainfallDeparture: +6, monsoonStatus: 'Normal', uvIndex: 7 },
  { region: 'Eastern & Ganga Basin (Bihar, WB, Odisha)', avgTemp: 31.0, humidity: 82, rainfallDeparture: +24, monsoonStatus: 'Vigorous', uvIndex: 6 },
  { region: 'North Eastern Region (Assam, Meghalaya, NER)', avgTemp: 28.4, humidity: 88, rainfallDeparture: +31, monsoonStatus: 'Vigorous', uvIndex: 5 },
  { region: 'Southern Peninsula (Karnataka, TN, Kerala)', avgTemp: 29.6, humidity: 76, rainfallDeparture: -4, monsoonStatus: 'Normal', uvIndex: 8 }
]

export const SUGGESTED_QUERIES = [
  'What is the 3-day rainfall forecast for Mumbai and coastal Maharashtra?',
  'Are there any active cyclone or severe weather warnings in India today?',
  'What agro-climate advisory applies to paddy sowing in Eastern India this week?',
  'Compare monsoon rainfall departure across all meteorological sub-divisions.'
]

export const SAMPLE_CHAT_RESPONSES: Record<string, WeatherChatMessage> = {
  forecast: {
    id: 'resp-forecast',
    sender: 'assistant',
    text: 'According to the latest IMD numerical model ensemble (GFS + ECMWF 00Z runs), coastal Maharashtra and Konkan will receive moderate to heavy rainfall over the next 72 hours. Peak precipitation is expected between 14:00 and 22:00 IST tomorrow.',
    timestamp: 'Just now',
    dataSnippet: {
      type: 'forecast',
      title: 'Mumbai & Konkan 3-Day Forecast',
      details: [
        { label: 'Today', value: '28°C / 25°C · Heavy rain (75-110 mm)' },
        { label: 'Tomorrow', value: '27°C / 24°C · Very heavy rain (115-150 mm)' },
        { label: 'Day 3', value: '29°C / 25°C · Moderate showers (40-60 mm)' },
        { label: 'Wind Speed', value: '35-45 km/h gusting to 55 km/h' }
      ]
    }
  },
  alerts: {
    id: 'resp-alerts',
    sender: 'assistant',
    text: 'There are currently 6 active bulletins across India. The most critical event is an Extreme Cyclone Advisory in the Bay of Bengal affecting Coastal Odisha and North Andhra Pradesh, alongside a Severe Flash Flood warning in the Barak Valley.',
    timestamp: 'Just now',
    dataSnippet: {
      type: 'alert',
      title: 'Active High-Severity Weather Bulletins',
      details: [
        { label: 'Extreme Warning', value: 'Severe Cyclonic Storm (Odisha & AP Coast)' },
        { label: 'Severe Warning', value: 'Flash Flood & Inundation (Barak Valley, Assam)' },
        { label: 'Severe Warning', value: 'Heatwave Condition (West Rajasthan, Vidarbha)' },
        { label: 'Moderate Advisory', value: 'Thunderstorm & Lightning (Sub-Himalayan WB)' }
      ]
    }
  },
  agro: {
    id: 'resp-agro',
    sender: 'assistant',
    text: 'For paddy farmers in Eastern India (Odisha, West Bengal, Bihar): Soil moisture saturation is at 85-92%. Nursery transplantation can proceed smoothly in upland plots. In low-lying riverine basins, delay transplantation by 48 hours until runoff drainage stabilizes.',
    timestamp: 'Just now',
    dataSnippet: {
      type: 'agro',
      title: 'Kharif Season Agro-Met Advisory',
      details: [
        { label: 'Crop Focus', value: 'Kharif Paddy (Transplantation Phase)' },
        { label: 'Soil Moisture', value: '88% (Adequate to Surplus)' },
        { label: 'Irrigation', value: 'Withhold artificial irrigation; allow natural drainage' },
        { label: 'Pesticide Window', value: 'Postpone spraying until Friday due to wind/rain' }
      ]
    }
  },
  climate: {
    id: 'resp-climate',
    sender: 'assistant',
    text: 'Cumulative monsoon rainfall across India stands at 104% of the Long Period Average (LPA). Eastern and North Eastern subdivisions are experiencing vigorous activity (+24% to +31% departure), while Western Arid zones show a slight deficit (-18%).',
    timestamp: 'Just now',
    dataSnippet: {
      type: 'trend',
      title: 'All-India Monsoon Progress',
      details: [
        { label: 'All-India Cumulative', value: '104% of LPA (Normal)' },
        { label: 'North East & East', value: '+28% (Surplus)' },
        { label: 'Central India', value: '+6% (Normal)' },
        { label: 'Northwest India', value: '+12% (Normal to Above)' },
        { label: 'Southern Peninsula', value: '-4% (Normal)' }
      ]
    }
  }
}
