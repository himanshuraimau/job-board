import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { JobList, JobFilters, JobForm } from '@/components/features/jobs'
import { 
  JobListSkeleton, 
  PageHeaderSkeleton, 
  FilterSidebarSkeleton,
  FullPageLoading 
} from '@/components/ui/skeletons'
import { 
  useJobsQuery, 
  useCreateJobMutation, 
  useUpdateJobMutation, 
  useReorderJobsMutation 
} from '@/hooks/useJobsQuery'
import type { Job, JobFilters as JobFiltersType } from '@/types'

export function JobsPageWithQuery() {
  const navigate = useNavigate()
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [filters, setFilters] = useState<JobFiltersType>({
    search: '',
    status: undefined,
    tags: [],
    sort: 'order',
    sortDirection: 'asc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // React Query hooks
  const { 
    data: jobsResponse, 
    isLoading, 
    error 
  } = useJobsQuery(filters, currentPage, pageSize)
  
  const createJobMutation = useCreateJobMutation()
  const updateJobMutation = useUpdateJobMutation()
  const reorderJobsMutation = useReorderJobsMutation()

  // Extract data from response
  const jobs = jobsResponse?.data || []
  const pagination = jobsResponse?.pagination || {
    page: currentPage,
    pageSize,
    total: 0
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setShowJobForm(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleArchiveJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    const newStatus = job.status === 'active' ? 'archived' : 'active'
    try {
      await updateJobMutation.mutateAsync({ 
        id: jobId, 
        updates: { status: newStatus } 
      })
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const handleViewJob = (job: Job) => {
    navigate(`/jobs/${job.id}`)
  }

  const handleFiltersChange = (newFilters: Partial<JobFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      tags: [],
      sort: 'order',
      sortDirection: 'asc'
    })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingJob) {
        await updateJobMutation.mutateAsync({ 
          id: editingJob.id, 
          updates: data 
        })
      } else {
        await createJobMutation.mutateAsync(data)
      }
      setShowJobForm(false)
      setEditingJob(null)
    } catch (error) {
      // Error is already handled by the mutation and will show in the form
      throw error
    }
  }

  const handleFormClose = () => {
    setShowJobForm(false)
    setEditingJob(null)
  }

  const handleReorderJobs = async (fromIndex: number, toIndex: number) => {
    try {
      await reorderJobsMutation.mutateAsync({ fromIndex, toIndex })
    } catch (error) {
      console.error('Failed to reorder jobs:', error)
    }
  }

  // Only enable reordering when sorting by order
  const enableReordering = filters.sort === 'order' && filters.sortDirection === 'asc'

  // Combine loading states
  const mutationLoading = createJobMutation.isPending || 
    updateJobMutation.isPending || 
    reorderJobsMutation.isPending

  // Show initial loading state
  if (isLoading && !jobs.length) {
    return (
      <AppLayout>
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <FilterSidebarSkeleton className="sticky top-6" />
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <PageHeaderSkeleton />
                <JobListSkeleton count={6} />
              </div>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    )
  }

  // Show error state
  if (error && !jobs.length) {
    return (
      <AppLayout>
        <PageContainer>
          <FullPageLoading message="Failed to load jobs. Please try again." />
        </PageContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            {isLoading ? (
              <FilterSidebarSkeleton className="sticky top-6" />
            ) : (
              <JobFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                className="sticky top-6"
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <JobList
              jobs={jobs}
              loading={mutationLoading}
              error={error instanceof Error ? error.message : null}
              pagination={pagination}
              onCreateJob={handleCreateJob}
              onEditJob={handleEditJob}
              onArchiveJob={handleArchiveJob}
              onViewJob={handleViewJob}
              onPageChange={handlePageChange}
              onReorderJobs={handleReorderJobs}
              enableReordering={enableReordering}
            />
          </div>
        </div>

        {/* Job Form Modal */}
        <JobForm
          open={showJobForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          job={editingJob || undefined}
          loading={mutationLoading}
        />
      </PageContainer>
    </AppLayout>
  )
}
