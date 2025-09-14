import React from 'react'
import { JobCard } from './JobCard'
import { JobReorder } from './JobReorder'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Plus, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Job } from '@/types'

interface JobListProps {
  jobs: Job[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  onCreateJob: () => void
  onEditJob: (job: Job) => void
  onArchiveJob: (jobId: string) => void
  onViewJob?: (job: Job) => void
  onAssessmentJob?: (job: Job) => void
  onPageChange: (page: number) => void
  onReorderJobs?: (fromIndex: number, toIndex: number) => Promise<void>
  enableReordering?: boolean
  className?: string
}

export const JobList = React.memo<JobListProps>(({
  jobs,
  loading,
  error,
  pagination,
  onCreateJob,
  onEditJob,
  onArchiveJob,
  onViewJob,
  onAssessmentJob,
  onPageChange,
  onReorderJobs,
  enableReordering = false,
  className
}: JobListProps) => {
  const [reorderMode, setReorderMode] = React.useState(false)

  // Only allow reorder mode if reordering is enabled and we have the handler
  const canReorder = enableReordering && onReorderJobs && jobs.length > 1
  
  // Reset reorder mode if conditions are no longer met
  React.useEffect(() => {
    if (reorderMode && !canReorder) {
      setReorderMode(false)
    }
  }, [reorderMode, canReorder])
  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  const startItem = (pagination.page - 1) * pagination.pageSize + 1
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total)

  const renderPaginationButton = (page: number, label?: string) => (
    <Button
      key={page}
      variant={page === pagination.page ? 'default' : 'outline'}
      size="sm"
      onClick={() => onPageChange(page)}
      disabled={loading}
      className="min-w-[2.5rem]"
    >
      {label || page}
    </Button>
  )

  const renderPaginationButtons = () => {
    const buttons = []
    const currentPage = pagination.page
    
    // Always show first page
    if (currentPage > 3) {
      buttons.push(renderPaginationButton(1))
      if (currentPage > 4) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
        )
      }
    }
    
    // Show pages around current page
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    
    for (let i = start; i <= end; i++) {
      buttons.push(renderPaginationButton(i))
    }
    
    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
        )
      }
      buttons.push(renderPaginationButton(totalPages))
    }
    
    return buttons
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <p className="font-medium">Error loading jobs</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Jobs</h2>
          {pagination.total > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {pagination.total} jobs
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Reorder Mode Toggle */}
          {canReorder && (
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reorder-mode" className="text-sm font-medium">
                Reorder Mode
              </Label>
              <Switch
                id="reorder-mode"
                checked={reorderMode}
                onCheckedChange={setReorderMode}
                disabled={loading}
              />
            </div>
          )}
          
          <Button onClick={onCreateJob} disabled={loading || reorderMode}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && jobs.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-12"></div>
                    <div className="h-5 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">No jobs found</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first job posting.
                </p>
              </div>
              <Button onClick={onCreateJob}>
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      {jobs.length > 0 && (
        <>
          {reorderMode && onReorderJobs ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-dashed">
                <ArrowUpDown className="h-4 w-4 inline mr-2" />
                Drag and drop jobs to reorder them. Changes are saved automatically.
              </div>
              <JobReorder
                jobs={jobs}
                onReorder={onReorderJobs}
                onEditJob={onEditJob}
                onArchiveJob={onArchiveJob}
                onViewJob={onViewJob}
                disabled={loading}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={onEditJob}
                  onArchive={onArchiveJob}
                  onView={onViewJob}
                  onAssessment={onAssessmentJob}
                  className={loading ? 'opacity-50 pointer-events-none' : ''}
                />
              ))}
            </div>
          )}

          {/* Pagination - Hidden in reorder mode */}
          {totalPages > 1 && !reorderMode && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {renderPaginationButtons()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
})

JobList.displayName = 'JobList'