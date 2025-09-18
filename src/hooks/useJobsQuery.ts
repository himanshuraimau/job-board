import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import type { Job, JobFilters, PaginatedResponse } from '@/types'

// Get jobs list with pagination and filters
export function useJobsQuery(filters?: JobFilters, page = 1, pageSize = 8) {
  return useQuery({
    queryKey: queryKeys.jobsList({ ...filters, page, pageSize }),
    queryFn: async (): Promise<PaginatedResponse<Job>> => {
      return apiClient.getJobs({
        ...filters,
        page,
        pageSize
      })
    },
    enabled: true,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

// Get single job by ID
export function useJobQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.job(jobId),
    queryFn: async (): Promise<Job> => {
      const response = await apiClient.getJob(jobId)
      return response
    },
    enabled: enabled && !!jobId,
  })
}

// Create job mutation
export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
      return apiClient.createJob(jobData)
    },
    onSuccess: (newJob) => {
      // Only update the current cache optimistically instead of invalidating all queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          
          // Add new job to the first page if we're on page 1
          // Otherwise, just increase the total count
          return {
            ...oldData,
            data: oldData.pagination.page === 1 ? [newJob, ...oldData.data] : oldData.data,
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1
            }
          }
        }
      )
      
      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.job(newJob.id), newJob)
      
      // Show success toast
      toast.success('Job created successfully', {
        description: `${newJob.title} has been created.`
      })
    },
    onError: (error) => {
      console.error('Failed to create job:', error)
      toast.error('Failed to create job', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  })
}

// Update job mutation
export function useUpdateJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }): Promise<Job> => {
      return apiClient.updateJob(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.job(id) })
      
      // Snapshot previous value
      const previousJob = queryClient.getQueryData<Job>(queryKeys.job(id))
      
      // Optimistically update
      if (previousJob) {
        const optimisticJob = { ...previousJob, ...updates, updatedAt: new Date() }
        queryClient.setQueryData(queryKeys.job(id), optimisticJob)
        
        // Update job in lists cache
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobsList() },
          (oldData: PaginatedResponse<Job> | undefined) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              data: oldData.data.map(job => 
                job.id === id ? optimisticJob : job
              )
            }
          }
        )
      }
      
      return { previousJob }
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousJob) {
        queryClient.setQueryData(queryKeys.job(id), context.previousJob)
      }
      console.error('Failed to update job:', error)
      toast.error('Failed to update job', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    },
    onSuccess: (updatedJob) => {
      // Update caches with server response
      queryClient.setQueryData(queryKeys.job(updatedJob.id), updatedJob)
      
      // Update job in all list caches without invalidating
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.map(job => 
              job.id === updatedJob.id ? updatedJob : job
            )
          }
        }
      )
      
      // Show success toast
      toast.success('Job updated successfully', {
        description: `${updatedJob.title} has been updated.`
      })
    }
  })
}

// Delete job mutation
export function useDeleteJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (jobId: string): Promise<{ success: boolean }> => {
      return apiClient.deleteJob(jobId)
    },
    onMutate: async (jobId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.job(jobId) })
      
      // Snapshot previous value
      const previousJob = queryClient.getQueryData<Job>(queryKeys.job(jobId))
      
      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.filter(job => job.id !== jobId),
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total - 1
            }
          }
        }
      )
      
      return { previousJob }
    },
    onError: (error, jobId, context) => {
      // Rollback optimistic update
      if (context?.previousJob) {
        queryClient.setQueryData(queryKeys.job(jobId), context.previousJob)
      }
      console.error('Failed to delete job:', error)
      toast.error('Failed to delete job', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    },
    onSuccess: (_, jobId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.job(jobId) })
      
      // Update all list caches without invalidating to preserve pagination
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.filter(job => job.id !== jobId),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1)
            }
          }
        }
      )
      
      // Show success toast
      toast.success('Job deleted successfully')
    }
  })
}

// Reorder jobs mutation
export function useReorderJobsMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }): Promise<{ success: boolean }> => {
      return apiClient.reorderJobs(fromIndex, toIndex)
    },
    onMutate: async ({ fromIndex, toIndex }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs() })
      
      // Get current data
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.jobsList() })
      
      // Optimistically update all job lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          
          const newJobs = [...oldData.data]
          const [movedJob] = newJobs.splice(fromIndex, 1)
          newJobs.splice(toIndex, 0, movedJob)
          
          // Update order property
          const updatedJobs = newJobs.map((job, index) => ({
            ...job,
            order: index,
            updatedAt: new Date()
          }))
          
          return {
            ...oldData,
            data: updatedJobs
          }
        }
      )
      
      return { previousData }
    },
    onError: (error, _, context) => {
      // Rollback optimistic updates
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to reorder jobs:', error)
      toast.error('Failed to reorder jobs', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    },
    onSuccess: () => {
      // Update all list caches without invalidating to preserve pagination  
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobsList() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          // For reorder, we need fresh data from server, so just mark as stale
          return oldData
        }
      )
      
      // Mark queries as stale so they refetch in background
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.jobsList(),
        exact: false,
        refetchType: 'none' // Don't trigger immediate refetch
      })
      
      // Show success toast
      toast.success('Jobs reordered successfully')
    }
  })
}
