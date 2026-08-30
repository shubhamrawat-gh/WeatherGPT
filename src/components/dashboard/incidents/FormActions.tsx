import ActionButton from '../ActionButton'
import { ArrowLeft, Check } from 'lucide-react'

interface FormActionsProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  isSubmitting?: boolean
  nextDisabled?: boolean
}

export default function FormActions({
  currentStep,
  totalSteps,
  onBack,
  isSubmitting = false,
  nextDisabled = false,
}: FormActionsProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-hairline-dark/40 w-full select-none">
      {/* Back button */}
      {!isFirstStep ? (
        <ActionButton
          variant="secondary"
          onClick={onBack}
          icon={ArrowLeft}
          disabled={isSubmitting}
        >
          Back
        </ActionButton>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Next or Submit button */}
      {!isLastStep ? (
        <ActionButton
          type="submit"
          disabled={nextDisabled}
          className="ml-auto"
        >
          Next Step
        </ActionButton>
      ) : (
        <ActionButton
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="ml-auto bg-brand-green hover:bg-brand-green-dark"
          icon={Check}
        >
          Submit Report
        </ActionButton>
      )}
    </div>
  )
}
