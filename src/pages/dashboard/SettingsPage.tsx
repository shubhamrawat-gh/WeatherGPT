import { useState } from 'react'
import SEO from '../../components/SEO'
import { Settings, Check, Radio, Bell, Globe2, Save, Sun, Moon, Mic, Languages } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext'

export default function SettingsPage() {
  const { theme, isDark, setTheme } = useTheme()
  const { currentLanguage, setLanguage, t } = useLanguage()
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [rainUnit, setRainUnit] = useState<'mm' | 'inches'>('mm')
  const [windUnit, setWindUnit] = useState<'kmh' | 'knots' | 'ms'>('kmh')
  const [syncFreq, setSyncFreq] = useState<'15' | '30' | '60'>('15')
  const [saved, setSaved] = useState(false)
  const [voiceRelayUrl, setVoiceRelayUrl] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('weathergpt_voice_relay_url') || '' : ''
  )
  const [voiceModePref, setVoiceModePref] = useState<'auto' | 'browser' | 'relay'>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('weathergpt_voice_preferred_mode') as any) || 'auto' : 'auto'
  )

  const [alertThresholds, setAlertThresholds] = useState({
    extreme: true,
    severe: true,
    moderate: true,
    minor: false,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('weathergpt_voice_relay_url', voiceRelayUrl.trim())
      localStorage.setItem('weathergpt_voice_preferred_mode', voiceModePref)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <SEO
        title="WeatherGPT | System Configuration"
        description="Configure unit preferences, alert dispatch thresholds, and meteorological API connections."
      />

      <div className="flex flex-col h-full w-full dark:bg-[#0a0a0a] bg-[#f8fafc] dark:text-slate-200 text-slate-800">
        {/* Header */}
        <div className="h-12 border-b dark:border-white/[0.08] border-slate-200 px-6 flex items-center justify-between shrink-0 dark:bg-[#0a0a0a] bg-white">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-brand-green" />
            <h1 className="text-xs font-semibold dark:text-white text-slate-900 tracking-wide">
              {t('settings.title')}
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <form onSubmit={handleSave} className="max-w-2xl mx-auto flex flex-col gap-6">
            
            {/* Regional Language & Multilingual AI */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                  <Languages className="w-4 h-4 text-brand-green" />
                  <span>{t('settings.langTitle')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
                  12 REGIONAL LANGUAGES
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                {t('settings.langDesc')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage.code === lang.code
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-green bg-brand-green/10 dark:text-white text-slate-900 font-medium shadow-xs'
                          : 'dark:border-white/[0.08] border-slate-200 dark:bg-[#0a0a0a] bg-slate-50 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.2] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs dark:text-white text-slate-900">{lang.nativeName}</span>
                        {isSelected && <Check className="w-3 h-3 text-brand-green" />}
                      </div>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono">{lang.name} ({lang.code.toUpperCase()})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Theme & Visual Appearance */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                {isDark ? <Moon className="w-4 h-4 text-brand-green" /> : <Sun className="w-4 h-4 text-brand-green" />}
                <span>{t('settings.themeTitle')}</span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                {t('settings.themeDesc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-brand-green bg-brand-green/10 dark:text-white text-slate-900 font-medium shadow-xs'
                      : 'dark:border-white/[0.08] border-slate-200 dark:bg-[#0a0a0a] bg-slate-50 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.2] hover:border-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-brand-green shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs dark:text-white text-slate-900">{t('settings.dark')}</span>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500">Tactical Night Console</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-brand-green bg-brand-green/10 dark:text-white text-slate-900 font-medium shadow-xs'
                      : 'dark:border-white/[0.08] border-slate-200 dark:bg-[#0a0a0a] bg-slate-50 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.2] hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-brand-green shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs dark:text-white text-slate-900">{t('settings.light')}</span>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500">Daylight High Visibility</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('auto')}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                    theme === 'auto'
                      ? 'border-brand-green bg-brand-green/10 dark:text-white text-slate-900 font-medium shadow-xs'
                      : 'dark:border-white/[0.08] border-slate-200 dark:bg-[#0a0a0a] bg-slate-50 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/[0.2] hover:border-slate-300'
                  }`}
                >
                  <Radio className="w-4 h-4 text-brand-green shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs dark:text-white text-slate-900">System Sync</span>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500">Auto OS Detection</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Display & Measurement Units */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                <Globe2 className="w-4 h-4 text-brand-green" />
                <span>Measurement &amp; Unit Preferences</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Temperature */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">
                    Temperature Unit
                  </label>
                  <select
                    value={tempUnit}
                    onChange={(e) => setTempUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-green"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>

                {/* Rainfall */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">
                    Rainfall Unit
                  </label>
                  <select
                    value={rainUnit}
                    onChange={(e) => setRainUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-green"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="inches">Inches (in)</option>
                  </select>
                </div>

                {/* Wind */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">
                    Wind Speed Unit
                  </label>
                  <select
                    value={windUnit}
                    onChange={(e) => setWindUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-green"
                  >
                    <option value="kmh">Kilometers/hour (km/h)</option>
                    <option value="knots">Knots (kts)</option>
                    <option value="ms">Meters/second (m/s)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Alert Severity Subscriptions */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                <Bell className="w-4 h-4 text-red-400" />
                <span>Severe Weather Alert Subscriptions</span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Configure which notification severity tiers will trigger emergency bulletin broadcasts.
              </p>

              <div className="flex flex-col gap-2.5 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.extreme}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, extreme: e.target.checked })}
                    className="w-4 h-4 rounded dark:bg-[#0a0a0a] bg-slate-100 border dark:border-white/[0.08] border-slate-300 text-brand-green focus:ring-0"
                  />
                  <span className="dark:text-slate-200 text-slate-800">
                    <strong className="text-red-400 font-mono">[EXTREME]</strong> Cyclones, major floods, cloudbursts
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.severe}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, severe: e.target.checked })}
                    className="w-4 h-4 rounded dark:bg-[#0a0a0a] bg-slate-100 border dark:border-white/[0.08] border-slate-300 text-brand-green focus:ring-0"
                  />
                  <span className="dark:text-slate-200 text-slate-800">
                    <strong className="text-orange-400 font-mono">[SEVERE]</strong> Heavy torrential rain, severe heatwave
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.moderate}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, moderate: e.target.checked })}
                    className="w-4 h-4 rounded dark:bg-[#0a0a0a] bg-slate-100 border dark:border-white/[0.08] border-slate-300 text-brand-green focus:ring-0"
                  />
                  <span className="dark:text-slate-200 text-slate-800">
                    <strong className="text-amber-400 font-mono">[MODERATE]</strong> Thunderstorms, gusty winds, localized landslides
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.minor}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, minor: e.target.checked })}
                    className="w-4 h-4 rounded dark:bg-[#0a0a0a] bg-slate-100 border dark:border-white/[0.08] border-slate-300 text-brand-green focus:ring-0"
                  />
                  <span className="dark:text-slate-200 text-slate-800">
                    <strong className="text-slate-400 font-mono">[MINOR]</strong> Moderate swell waves, light showers
                  </span>
                </label>
              </div>
            </div>

            {/* Voice Assistant & Live Relay Configuration */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                  <Mic className="w-4 h-4 text-brand-green" />
                  <span>Voice AI Engine &amp; Relay Endpoint</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
                  DUAL-MODE READY
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                Choose between serverless client-side Web Voice (runs anywhere without a backend) or high-fidelity WeatherGPT Live bi-directional audio streaming via WebSocket relay.
              </p>

              <div className="flex flex-col gap-3 text-xs">
                {/* Mode selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">
                    Voice Operation Mode
                  </label>
                  <select
                    value={voiceModePref}
                    onChange={(e) => setVoiceModePref(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-brand-green"
                  >
                    <option value="auto">Auto (WeatherGPT Live Relay with Web Speech AI fallback)</option>
                    <option value="browser">Browser Web Voice AI (Client-side, zero backend needed)</option>
                    <option value="relay">WeatherGPT Live WebSocket Relay (Requires hosted server)</option>
                  </select>
                </div>

                {/* Custom WebSocket Relay URL */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">
                      Remote Relay WebSocket URL (Optional)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">e.g. wss://your-relay.onrender.com</span>
                  </div>
                  <input
                    type="text"
                    value={voiceRelayUrl}
                    onChange={(e) => setVoiceRelayUrl(e.target.value)}
                    placeholder="wss://your-cloud-relay-service.com or ws://localhost:3001"
                    className="h-8 px-3 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-xs font-mono dark:text-white text-slate-900 focus:outline-none focus:border-brand-green placeholder:text-slate-500"
                  />
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 leading-normal">
                    When hosted on static CDN (Firebase Hosting), leave blank to automatically use Browser Voice AI, or paste your deployed relay endpoint if running on Render / Railway / Cloud Run.
                  </span>
                </div>
              </div>
            </div>

            {/* Data Ingestion & Feed Endpoints */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 dark:text-white text-slate-900 font-semibold text-xs tracking-tight">
                  <Radio className="w-4 h-4 text-brand-green" />
                  <span>Telemetry Ingestion Providers</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-mono uppercase dark:text-slate-400 text-slate-500">Sync Cycle:</span>
                  <select
                    value={syncFreq}
                    onChange={(e) => setSyncFreq(e.target.value as any)}
                    className="h-7 px-2 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200 text-[11px] font-mono dark:text-white text-slate-900 focus:outline-none focus:border-brand-green"
                  >
                    <option value="15">Every 15 min</option>
                    <option value="30">Every 30 min</option>
                    <option value="60">Every 60 min</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
                  <span className="dark:text-slate-300 text-slate-700">IMD Doppler Radar Network</span>
                  <span className="text-brand-green text-[10px]">CONNECTED · 15m POLLING</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
                  <span className="dark:text-slate-300 text-slate-700">INSAT-3DR Geostationary Imagery</span>
                  <span className="text-brand-green text-[10px]">SYNCED · 30m CYCLE</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg dark:bg-[#0a0a0a] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
                  <span className="dark:text-slate-300 text-slate-700">GFS &amp; ECMWF Model Ensembles</span>
                  <span className="text-brand-green text-[10px]">00Z &amp; 12Z RUNS ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                {saved && (
                  <span className="text-brand-green flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t('settings.saved')}
                  </span>
                )}
              </span>

              <button
                type="submit"
                className="btn-primary"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('settings.saveButton')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
