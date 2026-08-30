import { User, Bell, Settings, Lock } from 'lucide-react'
import PageHeader from '../../components/dashboard/PageHeader'
import DashboardCard from '../../components/dashboard/DashboardCard'
import SectionContainer from '../../components/dashboard/SectionContainer'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left select-none">
      <PageHeader 
        title="Console Settings" 
        description="Configure your disaster command profile, alerts, and platform credentials."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Settings */}
        <DashboardCard title="Profile & Credentials">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-dark">
              <User className="w-5 h-5 text-brand-green/70" />
              <span className="text-xs font-semibold text-white">Profile Configurations</span>
            </div>
            <p className="text-xs text-muted-dark leading-relaxed m-0">
              Personal identity details, tactical team designations, and agency affiliations will be configurable in a future console update.
            </p>
            <div className="font-mono text-[9px] text-brand-teal uppercase tracking-widest mt-2 border border-brand-green/20 px-2.5 py-1.5 rounded bg-brand-green/5 w-fit">
              Identity Sync Offline
            </div>
          </div>
        </DashboardCard>

        {/* Notification Settings */}
        <DashboardCard title="Emergency Notifications">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-dark">
              <Bell className="w-5 h-5 text-brand-green/70" />
              <span className="text-xs font-semibold text-white">System Alerts</span>
            </div>
            <p className="text-xs text-muted-dark leading-relaxed m-0">
              Configure priority channels for natural disaster sirens, severe weather SMS warnings, and tactical responder dispatch alerts.
            </p>
            <div className="font-mono text-[9px] text-brand-teal uppercase tracking-widest mt-2 border border-brand-green/20 px-2.5 py-1.5 rounded bg-brand-green/5 w-fit">
              Alerts Ingestion Offline
            </div>
          </div>
        </DashboardCard>

        {/* Security Settings */}
        <DashboardCard title="Platform Preferences">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-dark">
              <Settings className="w-5 h-5 text-brand-green/70" />
              <span className="text-xs font-semibold text-white">Console Display</span>
            </div>
            <p className="text-xs text-muted-dark leading-relaxed m-0">
              Tactical overlay setups, coordinate formats (UTM/MGRS), default map zoom options, and console dark-mode overrides.
            </p>
            <div className="font-mono text-[9px] text-brand-teal uppercase tracking-widest mt-2 border border-brand-green/20 px-2.5 py-1.5 rounded bg-brand-green/5 w-fit">
              Preferences Locked
            </div>
          </div>
        </DashboardCard>
      </div>

      <SectionContainer title="Security Protocols">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-dark border border-hairline-dark/50">
          <Lock className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs text-muted-dark leading-relaxed font-mono">
            <span className="text-white font-semibold">Diagnostic Mode Console Key active</span>
            <span>All operations settings updates are locked until platform authentication is connected to an active security directory (Firebase Auth/Clerk).</span>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
