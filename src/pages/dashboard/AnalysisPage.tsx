import { 
  Cpu, 
  FileText, 
  Plus, 
  Eye, 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Compass, 
  Globe 
} from 'lucide-react'
import PageHeader from '../../components/dashboard/PageHeader'
import SectionContainer from '../../components/dashboard/SectionContainer'
import ActionButton from '../../components/dashboard/ActionButton'
import AnalysisEmptyState from '../../components/dashboard/analysis/AnalysisEmptyState'
import { motion } from 'framer-motion'

export default function AnalysisPage() {
  const capabilities = [
    {
      id: 'disaster_classification',
      title: 'Disaster Classification',
      description: 'Multimodal categorization of disaster types from aerial and ground-level telemetry feeds.',
      icon: Cpu,
      status: 'STAGED'
    },
    {
      id: 'flood_detection',
      title: 'Flood Detection & Boundary Tracking',
      description: 'Water body segmentation and flood boundary delineation using synthetic-aperture radar (SAR) feeds.',
      icon: Globe,
      status: 'STAGED'
    },
    {
      id: 'earthquake_damage',
      title: 'Earthquake Damage Detection',
      description: 'Structural integrity scanning and volumetric rubble tracking for urban search and rescue staging.',
      icon: ShieldAlert,
      status: 'STAGED'
    },
    {
      id: 'wildfire_assessment',
      title: 'Wildfire Progression Assessment',
      description: 'Thermal boundary profiling and multi-spectral burn severity index calculations.',
      icon: Flame,
      status: 'STAGED'
    },
    {
      id: 'infrastructure_damage',
      title: 'Infrastructure Integrity',
      description: 'Occluded corridor classifications, bridge collapse detection, and electrical line damage mapping.',
      icon: Activity,
      status: 'STAGED'
    },
    {
      id: 'resource_recognition',
      title: 'Emergency Asset Recognition',
      description: 'Visual localization of evacuation camps, emergency vehicles, and resource drop zones.',
      icon: MapPin,
      status: 'STAGED'
    },
    {
      id: 'satellite_analysis',
      title: 'Multi-Spectral Satellite Analysis',
      description: 'Geospatial mapping and vegetation classification to assess pre-and-post event terrain changes.',
      icon: TrendingUp,
      status: 'STAGED'
    },
    {
      id: 'risk_prediction',
      title: 'Predictive Landslide & Flood Risk',
      description: 'Slope stability modeling and elevation flow maps for active risk forecasting.',
      icon: Compass,
      status: 'STAGED'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader 
        title="Disaster Intelligence Hub" 
        description="Scaffolded multi-provider pipelines for drone, satellite, and ground imagery analysis."
        action={
          <ActionButton to="/dashboard/analysis/new" icon={Plus}>
            New Analysis Run
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full">
        {/* Left Columns - Queue & History */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Analysis Queue */}
          <SectionContainer title="Pipeline Queue Status">
            <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10">
              <AnalysisEmptyState 
                icon={Cpu} 
                title="Analysis Pipeline Idle" 
                description="Ingestion telemetry queues are standby. Stage files via the ingestion wizard to trigger computer vision and LLM analysis." 
                action={
                  <ActionButton to="/dashboard/analysis/new" variant="secondary" icon={Plus}>
                    Launch Ingestion Wizard
                  </ActionButton>
                }
                badgeText="Pipeline Queue: Active Standby"
              />
            </div>
          </SectionContainer>

          {/* Recent Analyses */}
          <SectionContainer title="Recent Operations Logs">
            <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10">
              <AnalysisEmptyState 
                icon={FileText} 
                title="No Recent Diagnostics" 
                description="Historically processed image segments, building polygon damage classifications, and executive summaries will compile here on run completion." 
                badgeText="Telemetry Archive: Empty"
              />
            </div>
          </SectionContainer>

        </div>

        {/* Right Column - Actions & Capabilities */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Actions */}
          <SectionContainer title="Operational Actions">
            <div className="flex flex-col gap-4 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/20">
              
              <div className="flex flex-col gap-3">
                {/* Action 1 */}
                <div className="group flex flex-col gap-2 p-4 rounded-lg bg-surface-dark/30 hover:bg-surface-dark/50 border border-hairline-dark/40 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white group-hover:text-brand-green transition-colors">
                      New Analysis Wizard
                    </span>
                    <Plus className="w-3.5 h-3.5 text-muted-dark group-hover:text-brand-green transition-colors" />
                  </div>
                  <p className="text-[10px] text-muted-dark/80 leading-normal m-0">
                    Stage drone/satellite imagery, configure model pipelines, and run telemetry diagnostics.
                  </p>
                  <ActionButton to="/dashboard/analysis/new" variant="secondary" className="mt-1.5 self-start">
                    Launch Ingestion
                  </ActionButton>
                </div>

                {/* Action 2 */}
                <div className="group flex flex-col gap-2 p-4 rounded-lg bg-surface-dark/30 hover:bg-surface-dark/50 border border-hairline-dark/40 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white group-hover:text-brand-green transition-colors">
                      View Results Standby
                    </span>
                    <Eye className="w-3.5 h-3.5 text-muted-dark group-hover:text-brand-green transition-colors" />
                  </div>
                  <p className="text-[10px] text-muted-dark/80 leading-normal m-0">
                    Monitor telemetry metrics, damage segments, and spatial mapping overlays.
                  </p>
                  <ActionButton to="/dashboard/analysis/results" variant="secondary" className="mt-1.5 self-start">
                    Access Dashboard
                  </ActionButton>
                </div>
              </div>

            </div>
          </SectionContainer>

          {/* AI Capabilities */}
          <SectionContainer title="AI Pipeline Capabilities">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-3.5 max-h-[440px] overflow-y-auto pr-1"
            >
              {capabilities.map((cap) => {
                const Icon = cap.icon
                return (
                  <motion.div 
                    key={cap.id}
                    variants={itemVariants}
                    className="flex gap-3 p-3.5 rounded-lg border border-hairline-dark/40 bg-surface-dark/15 hover:border-brand-green/35 transition-all duration-150"
                  >
                    <div className="w-8 h-8 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">
                          {cap.title}
                        </span>
                        <span className="font-mono text-[8px] tracking-widest text-brand-green/80 bg-brand-teal-deep border border-brand-green/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          {cap.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                        {cap.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </SectionContainer>

        </div>
      </div>
    </div>
  )
}
