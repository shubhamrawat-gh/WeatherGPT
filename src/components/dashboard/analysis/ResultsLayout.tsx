import { ShieldAlert, HardHat, Compass, AlertTriangle, Cpu, RotateCcw, FileText } from 'lucide-react'
import InsightCard from './InsightCard'
import AnalysisEmptyState from './AnalysisEmptyState'
import { Link } from 'react-router-dom'

interface ResultsLayoutProps {
  providerName: string
  selectedModules: string[]
  filesCount: number
}

export default function ResultsLayout({
  providerName,
  selectedModules,
  filesCount,
}: ResultsLayoutProps) {
  return (
    <div className="flex flex-col gap-6 select-none w-full text-left animate-in fade-in duration-300">
      {/* Configuration Header Card */}
      <div className="p-4 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white">
              AI Diagnostic Pipeline Summary
            </span>
            <span className="text-[10px] font-mono text-muted-dark/85">
              Provider: {providerName} | Ingested Datasets: {filesCount} | Modules Active: {selectedModules.length}
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/analysis/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-hairline-dark hover:border-brand-green/30 hover:bg-surface-dark/40 text-white hover:text-brand-green rounded-lg text-xs font-semibold font-sans transition-all duration-150 cursor-pointer self-start sm:self-auto focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Run New Analysis
        </Link>
      </div>

      {/* Grid of Key Telemetry Indicators (Future Placeholders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          icon={ShieldAlert}
          title="Avg Damage Index"
          subtitle="Building polygon severity ratio"
          value="0.00%"
          statusText="STANDBY"
          statusType="neutral"
        />
        <InsightCard
          icon={HardHat}
          title="Occluded Road Segments"
          subtitle="Transportation blockage indexes"
          value="0 Nodes"
          statusText="STANDBY"
          statusType="neutral"
        />
        <InsightCard
          icon={Cpu}
          title="Assets Localized"
          subtitle="Evacuation camps &amp; vehicles"
          value="0 Units"
          statusText="STANDBY"
          statusType="neutral"
        />
        <InsightCard
          icon={AlertTriangle}
          title="Predictive Risk Level"
          subtitle="Secondary landslide/flood risk"
          value="0.0%"
          statusText="STANDBY"
          statusType="neutral"
        />
      </div>

      {/* Modular sections based on active configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left column (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Damage Assessment Section */}
          {selectedModules.includes('damage_assessment') ? (
            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5">
              <div className="flex items-center gap-2 border-b border-hairline-dark/20 pb-2">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-green" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Damage Assessment &amp; Spatial Classification
                </h3>
              </div>
              
              <AnalysisEmptyState
                icon={ShieldAlert}
                title="Damage Assessment Bounds Standby"
                description="Ingest disaster orthophotos or camera telemetry feeds. Neural networks will scan geometries and plot severity bounds."
                badgeText="Model: Segmenter-V3"
              />
            </div>
          ) : null}

          {/* Infrastructure Analysis Section */}
          {selectedModules.includes('infrastructure_analysis') ? (
            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5">
              <div className="flex items-center gap-2 border-b border-hairline-dark/20 pb-2">
                <HardHat className="w-4.5 h-4.5 text-brand-green" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Infrastructure &amp; Corridor Blockages
                </h3>
              </div>

              <AnalysisEmptyState
                icon={HardHat}
                title="Infrastructure Telemetry Standby"
                description="Staging area coordinates for arterial road corridors and electrical substation meshes will render here on image ingestion."
                badgeText="Model: RoadClassifier"
              />
            </div>
          ) : null}

          {/* Resource Detection Section */}
          {selectedModules.includes('resource_detection') ? (
            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5">
              <div className="flex items-center gap-2 border-b border-hairline-dark/20 pb-2">
                <Cpu className="w-4.5 h-4.5 text-brand-green" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Localized Staged Resources &amp; Assets
                </h3>
              </div>

              <AnalysisEmptyState
                icon={Cpu}
                title="Resource Mapping Standby"
                description="Visual asset classifiers will output evacuation markers, rescue water staging grids, and emergency supply coordinates."
                badgeText="Model: ObjectDetector-YOLO"
              />
            </div>
          ) : null}
        </div>

        {/* Right column (Summary/Insights column) */}
        <div className="flex flex-col gap-6">
          
          {/* Situational Intelligence Summary Section */}
          {selectedModules.includes('situational_intelligence') ? (
            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5 h-full">
              <div className="flex items-center gap-2 border-b border-hairline-dark/20 pb-2">
                <Compass className="w-4.5 h-4.5 text-brand-green" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  AI Situational Summary
                </h3>
              </div>
              
              <div className="flex-grow flex flex-col justify-center">
                <AnalysisEmptyState
                  icon={FileText}
                  title="Multimodal Synthesis Staged"
                  description="Executive briefings, operational damage distributions, and relief corridor priorities will compile here."
                  badgeText="LLM: Multimodal-Vision"
                />
              </div>
            </div>
          ) : null}

          {/* Risk Assessment Section */}
          {selectedModules.includes('risk_assessment') ? (
            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5 h-full">
              <div className="flex items-center gap-2 border-b border-hairline-dark/20 pb-2">
                <AlertTriangle className="w-4.5 h-4.5 text-brand-green" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Predictive Risk &amp; Evacuation Corridor Alerts
                </h3>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <AnalysisEmptyState
                  icon={AlertTriangle}
                  title="Predictive Risk Standby"
                  description="Evaluations of landscape precipitation grids, terrain elevations, and landslide corridors are on standby."
                  badgeText="Model: Hydrologist-Sim"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
