import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Archive, ArchiveRestore, Eye, FileText } from 'lucide-react'
import { cn, formatDateIntl } from '@/lib/utils'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onArchive: (jobId: string) => void
  onView?: (job: Job) => void
  onAssessment?: (job: Job) => void
  className?: string
}

export const JobCard = React.memo<JobCardProps>(({ job, onEdit, onArchive, onView, onAssessment, className }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = useCallback(() => {
    onEdit(job)
  }, [onEdit, job])

  const handleView = useCallback(() => {
    if (onView) {
      onView(job)
    }
  }, [onView, job])

  const handleAssessment = useCallback(() => {
    if (onAssessment) {
      onAssessment(job)
    }
  }, [onAssessment, job])

  const handleArchive = useCallback(async () => {
    setIsLoading(true)
    try {
      await onArchive(job.id)
    } finally {
      setIsLoading(false)
    }
  }, [onArchive, job.id])


  return (
    <Card className={cn(
      'group transition-all duration-200 hover:shadow-md',
      job.status === 'archived' && 'opacity-60',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant={job.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {job.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Created {formatDateIntl(job.createdAt)}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {onAssessment && (
              <DropdownMenuItem onClick={handleAssessment}>
                <FileText className="mr-2 h-4 w-4" />
                Assessment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleArchive} disabled={isLoading}>
              {job.status === 'active' ? (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              ) : (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore
                </>
              )}
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description || 'No description provided.'}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-1">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {job.tags.length === 0 && (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
})

JobCard.displayName = 'JobCard'