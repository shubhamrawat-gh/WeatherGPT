import { useState } from 'react'
import SEO from '../../components/SEO'
import { Settings, Check, Radio, Bell, Globe2, Save } from 'lucide-react'

export default function SettingsPage() {
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [rainUnit, setRainUnit] = useState<'mm' | 'inches'>('mm')
  const [windUnit, setWindUnit] = useState<'kmh' | 'knots' | 'ms'>('kmh')
  const [syncFreq, setSyncFreq] = useState<'15' | '30' | '60'>('15')
  const [saved, setSaved] = useState(false)

  const [alertThresholds, setAlertThresholds] = useState({
    extreme: true,
    severe: true,
    moderate: true,
    minor: false,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <SEO
        title="WeatherGPT | System Configuration"
        description="Configure unit preferences, alert dispatch thresholds, and meteorological API connections."
      />

      <div className="flex flex-col h-full w-full bg-[#0a0e14] text-slate-200">
        {/* Header */}
        <div className="h-12 border-b border-[#1c2333] px-6 flex items-center justify-between shrink-0 bg-[#0f141c]/60">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-brand-green" />
            <h1 className="text-xs font-semibold text-white tracking-wide">
              Console &amp; Telemetry Settings
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <form onSubmit={handleSave} className="max-w-2xl mx-auto flex flex-col gap-6">
            
            {/* Display & Measurement Units */}
            <div className="p-5 rounded-lg bg-[#0f141c] border border-[#1c2333] flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-tight">
                <Globe2 className="w-4 h-4 text-brand-green" />
                <span>Measurement &amp; Unit Preferences</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Temperature */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Temperature Unit
                  </label>
                  <select
                    value={tempUnit}
                    onChange={(e) => setTempUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded bg-[#0a0e14] border border-[#1c2333] text-xs text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>

                {/* Rainfall */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Rainfall Unit
                  </label>
                  <select
                    value={rainUnit}
                    onChange={(e) => setRainUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded bg-[#0a0e14] border border-[#1c2333] text-xs text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="inches">Inches (in)</option>
                  </select>
                </div>

                {/* Wind */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Wind Speed Unit
                  </label>
                  <select
                    value={windUnit}
                    onChange={(e) => setWindUnit(e.target.value as any)}
                    className="h-8 px-2.5 rounded bg-[#0a0e14] border border-[#1c2333] text-xs text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="kmh">Kilometers/hour (km/h)</option>
                    <option value="knots">Knots (kts)</option>
                    <option value="ms">Meters/second (m/s)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Alert Severity Subscriptions */}
            <div className="p-5 rounded-lg bg-[#0f141c] border border-[#1c2333] flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-tight">
                <Bell className="w-4 h-4 text-red-400" />
                <span>Severe Weather Alert Subscriptions</span>
              </div>
              <p className="text-xs text-slate-400">
                Configure which notification severity tiers will trigger emergency bulletin broadcasts.
              </p>

              <div className="flex flex-col gap-2.5 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.extreme}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, extreme: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0a0e14] border border-[#1c2333] text-brand-green focus:ring-0"
                  />
                  <span className="text-slate-200">
                    <strong className="text-red-400 font-mono">[EXTREME]</strong> Cyclones, major floods, cloudbursts
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.severe}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, severe: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0a0e14] border border-[#1c2333] text-brand-green focus:ring-0"
                  />
                  <span className="text-slate-200">
                    <strong className="text-orange-400 font-mono">[SEVERE]</strong> Heavy torrential rain, severe heatwave
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.moderate}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, moderate: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0a0e14] border border-[#1c2333] text-brand-green focus:ring-0"
                  />
                  <span className="text-slate-200">
                    <strong className="text-amber-400 font-mono">[MODERATE]</strong> Thunderstorms, gusty winds, localized landslides
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertThresholds.minor}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, minor: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0a0e14] border border-[#1c2333] text-brand-green focus:ring-0"
                  />
                  <span className="text-slate-200">
                    <strong className="text-slate-400 font-mono">[MINOR]</strong> Moderate swell waves, light showers
                  </span>
                </label>
              </div>
            </div>

            {/* Data Ingestion & Feed Endpoints */}
            <div className="p-5 rounded-lg bg-[#0f141c] border border-[#1c2333] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-tight">
                  <Radio className="w-4 h-4 text-brand-green" />
                  <span>Telemetry Ingestion Providers</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Sync Cycle:</span>
                  <select
                    value={syncFreq}
                    onChange={(e) => setSyncFreq(e.target.value as any)}
                    className="h-7 px-2 rounded bg-[#0a0e14] border border-[#1c2333] text-[11px] font-mono text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="15">Every 15 min</option>
                    <option value="30">Every 30 min</option>
                    <option value="60">Every 60 min</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#0a0e14] border border-[#1c2333]/80">
                  <span className="text-slate-300">IMD Doppler Radar Network</span>
                  <span className="text-brand-green text-[10px]">CONNECTED · 15m POLLING</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0a0e14] border border-[#1c2333]/80">
                  <span className="text-slate-300">INSAT-3DR Geostationary Imagery</span>
                  <span className="text-brand-green text-[10px]">SYNCED · 30m CYCLE</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0a0e14] border border-[#1c2333]/80">
                  <span className="text-slate-300">GFS &amp; ECMWF Model Ensembles</span>
                  <span className="text-brand-green text-[10px]">00Z &amp; 12Z RUNS ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                {saved && (
                  <span className="text-brand-green flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Preferences saved successfully
                  </span>
                )}
              </span>

              <button
                type="submit"
                className="btn-primary"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
