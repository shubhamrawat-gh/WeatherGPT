import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { HeartPulse, LifeBuoy, Utensils, Droplet, Home, Truck, Radio, HelpCircle } from 'lucide-react'

// Reusable Sub-components
import Stepper from '../incidents/Stepper'
import FormField from '../incidents/FormField'
import FormActions from '../incidents/FormActions'
import PrioritySelector from './PrioritySelector'
import LocationSection from './LocationSection'
import ContactSection from './ContactSection'
import ReviewPanel from './ReviewPanel'
import SuccessState from './SuccessState'
import DashboardCard from '../DashboardCard'

interface HelpRequestFormProps {
  onReturn: () => void
  initialCategory?: string
}

const stepTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

export default function HelpRequestForm({ onReturn, initialCategory = '' }: HelpRequestFormProps) {
  const steps = ['Request Details', 'Location Details', 'Contact Details', 'Review & Submit']
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Step 1 Details
  const [category, setCategory] = useState(initialCategory)
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')

  // Step 2 Location
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [area, setArea] = useState('')
  const [coordinates, setCoordinates] = useState('')

  // Step 3 Contact
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Category choices
  const categoryChoices = [
    { name: 'Medical', label: 'Medical Assistance', icon: HeartPulse },
    { name: 'Rescue', label: 'Search & Rescue', icon: LifeBuoy },
    { name: 'Food', label: 'Food Supplies', icon: Utensils },
    { name: 'Water', label: 'Water Supplies', icon: Droplet },
    { name: 'Shelter', label: 'Shelter Support', icon: Home },
    { name: 'Evacuation', label: 'Evacuation Support', icon: Truck },
    { name: 'Communication', label: 'Emergency Comm', icon: Radio },
    { name: 'Other', label: 'Other Assistance', icon: HelpCircle },
  ]

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!category) newErrors.category = 'Please select a request category.'
    if (!priority) newErrors.priority = 'Please select a priority level.'
    if (!description.trim()) newErrors.description = 'Please describe the emergency assistance required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!country.trim()) newErrors.country = 'Country is required.'
    if (!region.trim()) newErrors.region = 'Region/State designation is required.'
    if (!area.trim()) newErrors.area = 'Area/Neighborhood details are required.'
    
    if (coordinates.trim() && !/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(coordinates.trim())) {
      newErrors.coordinates = 'Invalid coordinates. Use decimal format: e.g. 25.0783, 91.8152.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.'
    if (!phone.trim()) newErrors.phone = 'Contact phone number is required.'
    if (!email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
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
      if (!validateStep3()) return
      setCurrentStep(4)
    } else if (currentStep === 4) {
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

  const handleReset = () => {
    setCategory(initialCategory)
    setPriority('Medium')
    setDescription('')
    setCountry('')
    setRegion('')
    setArea('')
    setCoordinates('')
    setFullName('')
    setPhone('')
    setEmail('')
    setOrganization('')
    setSubmitted(false)
    setCurrentStep(1)
  }

  if (submitted) {
    return <SuccessState onReset={handleReset} onReturn={onReturn} />
  }

  return (
    <div className="flex flex-col gap-6 w-full select-none">
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
              className="flex flex-col gap-6 min-h-[320px]"
            >
              {/* STEP 1: REQUEST DETAILS */}
              {currentStep === 1 ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Request Category <span className="text-brand-green">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {categoryChoices.map((choice) => {
                        const Icon = choice.icon
                        const isSelected = category === choice.name
                        return (
                          <button
                            key={choice.name}
                            type="button"
                            onClick={() => setCategory(choice.name)}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center transition-all duration-200 focus:outline-none focus:ring-1 ${
                              isSelected
                                ? 'bg-brand-green/10 border-brand-teal-mid text-brand-green focus:ring-brand-green/25'
                                : 'bg-surface-dark/20 border-hairline-dark/70 text-muted-dark hover:border-hairline-dark hover:bg-surface-dark/30 focus:ring-brand-teal/25'
                            }`}
                          >
                            <Icon className="w-5 h-5 mb-2" aria-hidden="true" />
                            <span className="text-[11px] font-medium font-sans truncate w-full">
                              {choice.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {errors.category ? (
                      <span className="text-xs text-red-500 font-sans mt-1">
                        {errors.category}
                      </span>
                    ) : null}
                  </div>

                  <PrioritySelector 
                    value={priority} 
                    onChange={setPriority} 
                    error={errors.priority} 
                  />

                  <FormField label="Assistance Description" id="help-desc" error={errors.description} required>
                    <textarea
                      id="help-desc"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify details about supply requirements, medical status, or hazard parameters..."
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
                <LocationSection
                  country={country}
                  setCountry={setCountry}
                  region={region}
                  setRegion={setRegion}
                  area={area}
                  setArea={setArea}
                  coordinates={coordinates}
                  setCoordinates={setCoordinates}
                  errors={errors}
                />
              ) : null}

              {/* STEP 3: CONTACT INFORMATION */}
              {currentStep === 3 ? (
                <ContactSection
                  fullName={fullName}
                  setFullName={setFullName}
                  phone={phone}
                  setPhone={setPhone}
                  email={email}
                  setEmail={setEmail}
                  organization={organization}
                  setOrganization={setOrganization}
                  errors={errors}
                />
              ) : null}

              {/* STEP 4: REVIEW SCREEN */}
              {currentStep === 4 ? (
                <ReviewPanel 
                  data={{
                    category,
                    priority,
                    description,
                    country,
                    region,
                    area,
                    coordinates,
                    fullName,
                    phone,
                    email,
                    organization,
                  }} 
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <FormActions
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={handleBack}
            isSubmitting={loading}
          />
        </DashboardCard>
      </form>
    </div>
  )
}
