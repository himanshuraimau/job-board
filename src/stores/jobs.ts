import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Job, JobStore } from '@/types'
import { apiClient } from '@/lib/api'

interface JobStoreState extends JobStore {
  // Internal state for optimistic updates
  _previousJobs?: Job[]
  _operationInProgress?: string
}

export const useJobStore = create<JobStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    jobs: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      status: undefined,
      tags: [],
      sort: 'order',
      sortDirection: 'asc'
    },
    pagination: {
      page: 1,
      pageSize: 8,
      total: 0
    },

    // Actions
    fetchJobs: async () => {
      set({ loading: true, error: null })
      
      try {
        const { filters, pagination } = get()
        const response = await apiClient.getJobs({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
        
        set({
          jobs: response.data,
          pagination: response.pagination,
          loading: false
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch jobs',
          loading: false
        })
      }
    },

    createJob: async (jobData) => {
      const tempId = `temp-${Date.now()}`
      const optimisticJob: Job = {
        ...jobData,
        id: tempId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Optimistic update
      const currentJobs = get().jobs
      set({ 
        jobs: [...currentJobs, optimisticJob],
        _previousJobs: currentJobs,
        _operationInProgress: 'create'
      })

      try {
        const createdJob = await apiClient.createJob(jobData)
        
        // Replace optimistic job with real job
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === tempId ? createdJob : job
          ),
          _previousJobs: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousJobs } = get()
        set({
          jobs: _previousJobs || [],
          error: error instanceof Error ? error.message : 'Failed to create job',
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    updateJob: async (id, updates) => {
      // Store previous state for rollback
      const currentJobs = get().jobs
      const jobIndex = currentJobs.findIndex(job => job.id === id)
      
      if (jobIndex === -1) {
        throw new Error('Job not found')
      }

      const updatedJob = {
        ...currentJobs[jobIndex],
        ...updates,
        updatedAt: new Date()
      }

      // Optimistic update
      const optimisticJobs = [...currentJobs]
      optimisticJobs[jobIndex] = updatedJob
      
      set({
        jobs: optimisticJobs,
        _previousJobs: currentJobs,
        _operationInProgress: 'update'
      })

      try {
        const serverJob = await apiClient.updateJob(id, updates)
        
        // Update with server response
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === id ? serverJob : job
          ),
          _previousJobs: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousJobs } = get()
        set({
          jobs: _previousJobs || [],
          error: error instanceof Error ? error.message : 'Failed to update job',
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    deleteJob: async (id) => {
      // Store previous state for rollback
      const currentJobs = get().jobs
      const optimisticJobs = currentJobs.filter(job => job.id !== id)
      
      set({
        jobs: optimisticJobs,
        _previousJobs: currentJobs,
        _operationInProgress: 'delete'
      })

      try {
        await apiClient.deleteJob(id)
        
        set({
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
      } catch (error) {
        // Rollback optimistic update
        const { _previousJobs } = get()
        set({
          jobs: _previousJobs || [],
          error: error instanceof Error ? error.message : 'Failed to delete job',
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    reorderJobs: async (fromIndex, toIndex) => {
      const currentJobs = get().jobs
      
      // Create reordered array
      const reorderedJobs = [...currentJobs]
      const [movedJob] = reorderedJobs.splice(fromIndex, 1)
      reorderedJobs.splice(toIndex, 0, movedJob)
      
      // Update order property for affected jobs
      const updatedJobs = reorderedJobs.map((job, index) => ({
        ...job,
        order: index,
        updatedAt: new Date()
      }))

      // Optimistic update
      set({
        jobs: updatedJobs,
        _previousJobs: currentJobs,
        _operationInProgress: 'reorder'
      })

      try {
        await apiClient.reorderJobs(fromIndex, toIndex)
        
        set({
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
      } catch (error) {
        // Rollback optimistic update
        const { _previousJobs } = get()
        set({
          jobs: _previousJobs || [],
          error: error instanceof Error ? error.message : 'Failed to reorder jobs',
          _previousJobs: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    setFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 } // Reset to first page when filtering
      }))
      
      // Auto-fetch with new filters
      get().fetchJobs()
    },

    setPage: (page) => {
      set(state => ({
        pagination: { ...state.pagination, page }
      }))
      
      // Auto-fetch with new page
      get().fetchJobs()
    }
  }))
)

// Selectors for optimized subscriptions
export const useJobsData = () => useJobStore(state => state.jobs)
export const useJobsLoading = () => useJobStore(state => state.loading)
export const useJobsError = () => useJobStore(state => state.error)
export const useJobsFilters = () => useJobStore(state => state.filters)
export const useJobsPagination = () => useJobStore(state => state.pagination)

// Computed selectors
export const useActiveJobs = () => useJobStore(state => 
  state.jobs.filter(job => job.status === 'active')
)

export const useArchivedJobs = () => useJobStore(state => 
  state.jobs.filter(job => job.status === 'archived')
)

export const useJobById = (id: string) => useJobStore(state => 
  state.jobs.find(job => job.id === id)
)

export const useJobsActions = () => useJobStore(state => ({
  fetchJobs: state.fetchJobs,
  createJob: state.createJob,
  updateJob: state.updateJob,
  deleteJob: state.deleteJob,
  reorderJobs: state.reorderJobs,
  setFilters: state.setFilters,
  setPage: state.setPage
}))