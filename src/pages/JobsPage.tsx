import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { JobList, JobFilters, JobForm } from '@/components/features/jobs'
import { useJobsActions, useJobsData, useJobsLoading, useJobsError, useJobsFilters, useJobsPagination } from '@/stores/jobs'
import type { Job, JobFilters as JobFiltersType } from '@/types'

export function JobsPage() {
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // Store selectors
  const jobs = useJobsData()
  const loading = useJobsLoading()
  const error = useJobsError()
  const filters = useJobsFilters()
  const pagination = useJobsPagination()
  const { fetchJobs, createJob, updateJob, reorderJobs, setFilters, setPage } = useJobsActions()

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

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
      await updateJob(jobId, { status: newStatus })
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const handleViewJob = (job: Job) => {
    // TODO: Navigate to job detail page when routing is implemented
    console.log('View job:', job)
  }

  const handleFiltersChange = (newFilters: Partial<JobFiltersType>) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      search: undefined,
      status: undefined,
      tags: undefined,
      sort: 'order',
      sortDirection: 'asc'
    })
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, data)
      } else {
        await createJob(data)
      }
      setShowJobForm(false)
      setEditingJob(null)
    } catch (error) {
      // Error is already handled by the store and will show in the form
      throw error
    }
  }

  const handleFormClose = () => {
    setShowJobForm(false)
    setEditingJob(null)
  }

  const handleReorderJobs = async (fromIndex: number, toIndex: number) => {
    try {
      await reorderJobs(fromIndex, toIndex)
    } catch (error) {
      console.error('Failed to reorder jobs:', error)
      // Error is already handled by the store
    }
  }

  // Only enable reordering when sorting by order
  const enableReordering = filters.sort === 'order' && filters.sortDirection === 'asc'

  return (
    <AppLayout>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              className="sticky top-6"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <JobList
              jobs={jobs}
              loading={loading}
              error={error}
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
          loading={loading}
        />
      </PageContainer>
    </AppLayout>
  )
}