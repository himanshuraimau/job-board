import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useJobStore } from '../jobs'
import { apiClient } from '@/lib/api'
import type { Job } from '@/types'

// Mock the API client
vi.mock('@/lib/api', () => ({
    apiClient: {
        getJobs: vi.fn(),
        createJob: vi.fn(),
        updateJob: vi.fn(),
        deleteJob: vi.fn(),
        reorderJobs: vi.fn()
    }
}))

const mockJob: Job = {
    id: '1',
    title: 'Software Engineer',
    slug: 'software-engineer',
    description: 'A great job opportunity',
    status: 'active',
    tags: ['javascript', 'react'],
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date()
}

describe('useJobStore', () => {
    beforeEach(() => {
        // Reset store state
        useJobStore.setState({
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
                pageSize: 10,
                total: 0
            }
        })

        // Clear all mocks
        vi.clearAllMocks()
    })

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useJobStore())

        expect(result.current.jobs).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it('should fetch jobs successfully', async () => {
        const mockResponse = {
            data: [mockJob],
            pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
        }

        vi.mocked(apiClient.getJobs).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useJobStore())

        await act(async () => {
            await result.current.fetchJobs()
        })

        expect(result.current.jobs).toEqual([mockJob])
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it('should handle fetch jobs error', async () => {
        const errorMessage = 'Failed to fetch jobs'
        vi.mocked(apiClient.getJobs).mockRejectedValue(new Error(errorMessage))

        const { result } = renderHook(() => useJobStore())

        await act(async () => {
            await result.current.fetchJobs()
        })

        expect(result.current.jobs).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(errorMessage)
    })

    it('should create job with optimistic updates', async () => {
        const newJobData = {
            title: 'New Job',
            slug: 'new-job',
            description: 'A new job',
            status: 'active' as const,
            tags: ['test'],
            order: 1
        }

        const createdJob = { ...newJobData, id: '2', createdAt: new Date(), updatedAt: new Date() }
        vi.mocked(apiClient.createJob).mockResolvedValue(createdJob)

        const { result } = renderHook(() => useJobStore())

        await act(async () => {
            await result.current.createJob(newJobData)
        })

        expect(result.current.jobs).toHaveLength(1)
        expect(result.current.jobs[0]).toEqual(createdJob)
    })

    it('should rollback optimistic update on create job error', async () => {
        const newJobData = {
            title: 'New Job',
            slug: 'new-job',
            description: 'A new job',
            status: 'active' as const,
            tags: ['test'],
            order: 1
        }

        vi.mocked(apiClient.createJob).mockRejectedValue(new Error('Create failed'))

        const { result } = renderHook(() => useJobStore())

        await act(async () => {
            try {
                await result.current.createJob(newJobData)
            } catch (error) {
                // Expected to throw
            }
        })

        expect(result.current.jobs).toEqual([])
        expect(result.current.error).toBe('Create failed')
    })

    it('should update filters and reset pagination', () => {
        const { result } = renderHook(() => useJobStore())

        // Mock fetchJobs to avoid actual API call
        const fetchJobsSpy = vi.spyOn(result.current, 'fetchJobs').mockImplementation(() => Promise.resolve())

        act(() => {
            result.current.setFilters({ search: 'test', status: 'active' })
        })

        expect(result.current.filters.search).toBe('test')
        expect(result.current.filters.status).toBe('active')
        expect(result.current.pagination.page).toBe(1) // Should reset to page 1
        expect(fetchJobsSpy).toHaveBeenCalled()
    })
})