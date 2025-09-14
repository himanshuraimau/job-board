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
      } catch (error) {
        console.error('Failed to reorder jobs:', error)
      }
    }
    
    setIsReordering(false)
  }

  const handleDragCancel = () => {
    setActiveJob(null)
    setIsReordering(false)
  }

  return (
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
  )
}
