import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'

import PageHeader from '../../components/dashboard/PageHeader'
import DashboardCard from '../../components/dashboard/DashboardCard'
import ActionButton from '../../components/dashboard/ActionButton'
import SEO from '../../components/SEO'

// Sub-components
import Stepper from '../../components/dashboard/incidents/Stepper'
import FormField from '../../components/dashboard/incidents/FormField'
import UploadZone from '../../components/dashboard/incidents/UploadZone'
import ReviewPanel from '../../components/dashboard/incidents/ReviewPanel'
import FormActions from '../../components/dashboard/incidents/FormActions'

const stepTransition: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function NewIncidentPage() {
  const steps = ['Incident Info', 'Location Details', 'Evidence Upload', 'Review & Submit']
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  // Form Fields State
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('Medium')
  const [description, setDescription] = useState('')

  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [coordinates, setCoordinates] = useState('')

  const [files, setFiles] = useState<File[]>([])
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Incident types for Step 1
  const incidentTypes = [
    'Flood / Tsunami',
    'Earthquake / Seismic',
    'Wildfire / Forest Fire',
    'Hurricane / Typhoon',
    'Industrial Accident',
    'Search & Rescue Operations',
  ]

  // Severity Levels
  const severityLevels = ['Low', 'Medium', 'High', 'Critical']

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Incident title is required.'
    if (!type) newErrors.type = 'Please select an incident type.'
    if (!severity) newErrors.severity = 'Please select severity level.'
    if (!description.trim()) newErrors.description = 'Please describe the incident situation.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!country.trim()) newErrors.country = 'Country designation is required.'
    if (!region.trim()) newErrors.region = 'Region or state boundary details are required.'
    if (!coordinates.trim()) {
      newErrors.coordinates = 'Coordinates are required. Enter latitude/longitude coordinates.'
    } else if (!/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(coordinates.trim())) {
      newErrors.coordinates = 'Invalid format. Use decimal Lat, Long (e.g. 37.7749, -122.4194).'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (currentStep === 1) {
      if (!validateStep1()) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!validateStep2()) return
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      // Final Submit
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setSubmitted(true)
      }, 1500)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({})
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <>
      <SEO 
        title="Report Incident | RescueLens AI Console" 
        description="Submit natural disaster details and operational evidence to response platforms." 
      />

      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-6 text-left">
        <PageHeader 
          title="Intake New Incident Report" 
          description="Feed disaster data, geospatial marks, and evidence records directly to active telemetry pipelines."
        />

        {submitted ? (
          <div className="w-full py-12 flex items-center justify-center">
            <DashboardCard className="max-w-md w-full text-center p-8 flex flex-col items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/5">
                <CheckCircle className="w-6 h-6 text-brand-green" aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-2 select-none">
                <h2 className="text-xl font-bold text-white m-0">Incident Submitted</h2>
                <p className="text-xs text-muted-dark leading-relaxed max-w-xs m-0">
                  disaster telemetry report successfully queued. Imagery telemetry will process in future automated AI layers.
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <ActionButton onClick={() => navigate('/dashboard/incidents')}>
                  Return to Portal
                </ActionButton>
                
                <button
                  onClick={() => {
                    setTitle('')
                    setType('')
                    setSeverity('Medium')
                    setDescription('')
                    setCountry('')
                    setRegion('')
                    setCoordinates('')
                    setFiles([])
                    setSubmitted(false)
                    setCurrentStep(1)
                  }}
                  className="text-xs text-brand-green hover:underline focus:outline-none"
                >
                  File another report
                </button>
              </div>
            </DashboardCard>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {/* Visual step indicator */}
            <Stepper currentStep={currentStep} steps={steps} />

            <form onSubmit={handleNext} noValidate>
              <DashboardCard className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepTransition}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col gap-6 min-h-[300px]"
                  >
                    
                    {/* STEP 1: INCIDENT INFORMATION */}
                    {currentStep === 1 ? (
                      <div className="flex flex-col gap-5">
                        <FormField label="Incident Title" id="title" error={errors.title} required>
                          <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Flood assessment - North Sector"
                            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                              errors.title
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                            }`}
                          />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField label="Incident Type" id="type" error={errors.type} required>
                            <select
                              id="type"
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                                errors.type
                                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                  : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                              }`}
                            >
                              <option value="">-- Choose Incident Category --</option>
                              {incidentTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </FormField>

                          <FormField label="Severity level" id="severity" error={errors.severity} required>
                            <select
                              id="severity"
                              value={severity}
                              onChange={(e) => setSeverity(e.target.value)}
                              className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                                errors.severity
                                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                  : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                              }`}
                            >
                              {severityLevels.map((lvl) => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                              ))}
                            </select>
                          </FormField>
                        </div>

                        <FormField label="Situation Description" id="description" error={errors.description} required>
                          <textarea
                            id="description"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide descriptive details regarding environmental damage, active threats, and critical blockages..."
                            className={`w-full px-4 py-3 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                              errors.description
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                            }`}
                          />
                        </FormField>
                      </div>
                    ) : null}

                    {/* STEP 2: LOCATION DETAILS */}
                    {currentStep === 2 ? (
                      <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField label="Country" id="country" error={errors.country} required>
                            <input
                              id="country"
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="e.g. Bangladesh"
                              className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                                errors.country
                                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                  : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                              }`}
                            />
                          </FormField>

                          <FormField label="Region / Province / State" id="region" error={errors.region} required>
                            <input
                              id="region"
                              type="text"
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              placeholder="e.g. Sylhet Division"
                              className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                                errors.region
                                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                  : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                              }`}
                            />
                          </FormField>
                        </div>

                        <FormField label="GPS Coordinates" id="coordinates" error={errors.coordinates} required>
                          <input
                            id="coordinates"
                            type="text"
                            value={coordinates}
                            onChange={(e) => setCoordinates(e.target.value)}
                            placeholder="e.g. 24.8949, 91.8687"
                            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                              errors.coordinates
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
                            }`}
                          />
                          <p className="text-[10px] text-muted-dark/70 font-mono mt-1.5 leading-normal">
                            Format: Latitude, Longitude (decimal degrees). Maps integration will support click-to-pin selection in an upcoming phase.
                          </p>
                        </FormField>

                        {/* Future Map Selection Placeholder */}
                        <div className="rounded-lg border border-dashed border-hairline-dark/60 bg-surface-dark/5 p-5 text-center flex flex-col items-center gap-2 mt-4 select-none">
                          <AlertTriangle className="w-5 h-5 text-brand-green/50 animate-pulse" />
                          <span className="text-xs font-semibold text-white">Geospatial Target Pickers Pending</span>
                          <span className="text-[10px] text-muted-dark leading-relaxed max-w-xs">
                            The GPS selection map overlay is planned for Phase 5. Enter values manually to test current data bindings.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* STEP 3: EVIDENCE UPLOAD */}
                    {currentStep === 3 ? (
                      <UploadZone files={files} onFilesChange={setFiles} />
                    ) : null}

                    {/* STEP 4: REVIEW & SUBMIT */}
                    {currentStep === 4 ? (
                      <ReviewPanel 
                        data={{ title, type, severity, description, country, region, coordinates }} 
                        files={files} 
                      />
                    ) : null}

                  </motion.div>
                </AnimatePresence>

                {/* Form Nav Buttons */}
                <FormActions 
                  currentStep={currentStep} 
                  totalSteps={steps.length} 
                  onBack={handleBack} 
                  isSubmitting={loading} 
                />
              </DashboardCard>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
