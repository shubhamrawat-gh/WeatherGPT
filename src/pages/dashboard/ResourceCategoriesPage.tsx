import PageHeader from '../../components/dashboard/PageHeader'
import ActionButton from '../../components/dashboard/ActionButton'
import ResourceCategoryCard from '../../components/dashboard/resources/ResourceCategoryCard'
import { RESOURCE_CATEGORIES } from '../../services/resource'
import { ArrowLeft } from 'lucide-react'

export default function ResourceCategoriesPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader
        title="Resource Directory Categories"
        description="Structured classification schemas mapping medical, lodging, food distribution, and tactical rescue coordinates."
        action={
          <ActionButton to="/dashboard/resources" variant="secondary" icon={ArrowLeft}>
            Back to Hub
          </ActionButton>
        }
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {RESOURCE_CATEGORIES.map(cat => (
          <ResourceCategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  )
}
