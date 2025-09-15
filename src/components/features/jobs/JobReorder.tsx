import React from 'react'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
 type  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { JobCard } from './JobCard'
import { SortableJobCard } from './SortableJobCard'
import { AlertTriangle } from 'lucide-react'
import type { Job } from '@/types'

interface JobReorderProps {
  jobs: Job[]
  onReorder: (fromIndex: number, toIndex: number) => Promise<void>
  onEditJob: (job: Job) => void
  onArchiveJob: (jobId: string) => void
  onViewJob?: (job: Job) => void
  disabled?: boolean
  className?: string
}

export const JobReorder: React.FC<JobReorderProps> = ({
  jobs,
  onReorder,
  onEditJob,
  onArchiveJob,
  onViewJob,
  disabled = false,
  className
}) => {
  const [activeJob, setActiveJob] = React.useState<Job | null>(null)
  const [isReordering, setIsReordering] = React.useState(false)
  const [reorderError, setReorderError] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Delay for touch devices
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return
    
    const job = jobs.find(j => j.id === event.active.id)
    if (job) {
      setActiveJob(job)
      setIsReordering(true)
      setReorderError(null) // Clear any previous errors
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveJob(null)
    
    if (!over || active.id === over.id || disabled) {
      setIsReordering(false)
      return
    }

    const oldIndex = jobs.findIndex(job => job.id === active.id)
    const newIndex = jobs.findIndex(job => job.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      try {
        await onReorder(oldIndex, newIndex)
        setReorderError(null) // Clear error on success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reorder jobs'
        setReorderError(errorMessage)
        console.error('Failed to reorder jobs:', error)
        
        // Show error notification
        // Note: In a real app, you might want to use a toast notification here
        setTimeout(() => setReorderError(null), 5000) // Clear error after 5 seconds
      }
    }
    
    setIsReordering(false)
  }

  const handleDragCancel = () => {
    setActiveJob(null)
    setIsReordering(false)
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {reorderError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{reorderError}</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={jobs.map(job => job.id)} strategy={rectSortingStrategy}>
          <div className={className}>
            {jobs.map((job) => (
              <SortableJobCard
                key={job.id}
                job={job}
                onEdit={onEditJob}
                onArchive={onArchiveJob}
                onView={onViewJob}
                disabled={disabled || isReordering}
                isDragging={activeJob?.id === job.id}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeJob ? (
            <JobCard
              job={activeJob}
              onEdit={() => {}}
              onArchive={() => {}}
              className="opacity-95 shadow-xl rotate-3"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
