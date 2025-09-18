import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { JobCard } from './JobCard'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Job } from '@/types'

interface SortableJobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onArchive: (jobId: string) => void
  onView?: (job: Job) => void
  disabled?: boolean
  isDragging?: boolean
}

export const SortableJobCard = React.memo<SortableJobCardProps>(({
  job,
  onEdit,
  onArchive,
  onView,
  disabled = false,
  isDragging = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: job.id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        (isDragging || isSortableDragging) && 'z-50',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      {/* Drag Handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'cursor-grab active:cursor-grabbing',
            'p-1 rounded bg-background/80 backdrop-blur-sm border shadow-sm'
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Job Card */}
      <JobCard
        job={job}
        onEdit={onEdit}
        onArchive={onArchive}
        onView={onView}
        className={cn(
          'transition-all duration-200',
          !disabled && 'group-hover:pl-8', // Add left padding when hovering to make room for drag handle
          (isDragging || isSortableDragging) && 'opacity-50 shadow-lg'
        )}
      />
    </div>
  )
})

SortableJobCard.displayName = 'SortableJobCard'
