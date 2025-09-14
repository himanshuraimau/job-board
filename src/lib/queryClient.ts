import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: (failureCount, error) => {
        // Don't retry for 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Query keys factory
export const queryKeys = {
  all: ['app'] as const,
  
  // Jobs
  jobs: () => [...queryKeys.all, 'jobs'] as const,
  jobsList: (filters?: any) => [...queryKeys.jobs(), 'list', filters] as const,
  job: (id: string) => [...queryKeys.jobs(), 'detail', id] as const,
  
  // Candidates
  candidates: () => [...queryKeys.all, 'candidates'] as const,
  candidatesList: (filters?: any) => [...queryKeys.candidates(), 'list', filters] as const,
  candidate: (id: string) => [...queryKeys.candidates(), 'detail', id] as const,
  candidateTimeline: (id: string) => [...queryKeys.candidates(), 'timeline', id] as const,
  
  // Assessments
  assessments: () => [...queryKeys.all, 'assessments'] as const,
  assessment: (jobId: string) => [...queryKeys.assessments(), 'detail', jobId] as const,
  assessmentResponses: (assessmentId: string) => [...queryKeys.assessments(), 'responses', assessmentId] as const,
} as const
