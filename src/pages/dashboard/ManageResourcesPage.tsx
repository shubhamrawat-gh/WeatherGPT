import { useState } from 'react'
import PageHeader from '../../components/dashboard/PageHeader'
import ActionButton from '../../components/dashboard/ActionButton'
import ResourceEmptyState from '../../components/dashboard/resources/ResourceEmptyState'
import { RESOURCE_CATEGORIES } from '../../services/resource'
import { 
  ArrowLeft, 
  PlusCircle, 
  CheckSquare, 
  Settings, 
  ShieldCheck, 
  Users 
} from 'lucide-react'

export default function ManageResourcesPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'verify' | 'status'>('add')
  
  // Staged Form State placeholders (for UI input only)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formLat, setFormLat] = useState('')
  const [formLng, setFormLng] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formCapCurrent, setFormCapCurrent] = useState('')
  const [formCapMax, setFormCapMax] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formRadio, setFormRadio] = useState('')

  const tabs = [
    { id: 'add', label: 'Add Staging Node', icon: PlusCircle },
    { id: 'verify', label: 'Verify Coordinates', icon: CheckSquare },
    { id: 'status', label: 'Update Status & capacity', icon: Settings }
  ] as const

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader
        title="Registry Administration Console"
        description="Stage new emergency resources, coordinate responder verifications, and broadcast capacity updates."
        action={
          <ActionButton to="/dashboard/resources" variant="secondary" icon={ArrowLeft}>
            Back to Hub
          </ActionButton>
        }
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-hairline-dark/35 pb-1 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-semibold tracking-wide border-b-2 transition-all duration-150 cursor-pointer focus:outline-none ${
                isActive 
                  ? 'border-brand-green text-brand-green' 
                  : 'border-transparent text-muted-dark hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <div className="w-full">
        {activeTab === 'add' ? (
          <div className="max-w-2xl mx-auto p-6 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 backdrop-blur-sm flex flex-col gap-6">
            
            <div className="flex flex-col gap-1 border-b border-hairline-dark/20 pb-3">
              <span className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-widest">
                Protocol: Add New Node
              </span>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider m-0">
                Register Staging Resource
              </h3>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
              {/* Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sector 4 Evacuation Shelter"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Resource Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs focus:border-brand-green/45 focus:outline-none h-10"
                >
                  <option value="">Select Category...</option>
                  {RESOURCE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Physical Location Address
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Grid Cell B-12, Main Highway"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Lat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Latitude Coord (DD)
                </label>
                <input
                  type="text"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  placeholder="e.g. 34.052235"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Lng */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Longitude Coord (DD)
                </label>
                <input
                  type="text"
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  placeholder="e.g. -118.243683"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Current Cap */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Current Occupancy / Level
                </label>
                <input
                  type="number"
                  value={formCapCurrent}
                  onChange={(e) => setFormCapCurrent(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Max Cap */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Maximum Capacity Threshold
                </label>
                <input
                  type="number"
                  value={formCapMax}
                  onChange={(e) => setFormCapMax(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +1-555-0199"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Radio Channel */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-dark uppercase font-semibold">
                  Radio Call Channel
                </label>
                <input
                  type="text"
                  value={formRadio}
                  onChange={(e) => setFormRadio(e.target.value)}
                  placeholder="e.g. UHF 155.45"
                  className="w-full px-3.5 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none h-10"
                />
              </div>

              {/* Submit placeholder (no CRUD backend) */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-hairline-dark/20 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormName('')
                    setFormCategory('')
                    setFormLat('')
                    setFormLng('')
                    setFormAddress('')
                    setFormCapCurrent('')
                    setFormCapMax('')
                    setFormPhone('')
                    setFormRadio('')
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-hairline-dark hover:bg-surface-dark/50 text-white rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  Clear Fields
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-canvas-dark rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  Register Node (Standby)
                </button>
              </div>

            </form>
          </div>
        ) : null}

        {activeTab === 'verify' ? (
          <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10">
            <ResourceEmptyState
              icon={ShieldCheck}
              title="Verification Queries Standby"
              description="Responder verification checklists and authorization triggers will load here once resources are added to the active registry."
              badgeText="Authorization Control: Idle"
            />
          </div>
        ) : null}

        {activeTab === 'status' ? (
          <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10">
            <ResourceEmptyState
              icon={Users}
              title="Operational Updates Standby"
              description="Real-time capacity monitors, inventory ratios, and offline standby status updates are on standby."
              badgeText="Capacity Metrics: Standby"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
