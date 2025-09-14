import type { Job, Candidate, Assessment, Note, AssessmentResponse, PaginatedResponse, JobFilters, CandidateFilters } from '@/types'

const API_BASE_URL = '/api'

// Generic API client
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Jobs API
  async getJobs(filters?: JobFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
    if (filters?.sort) params.append('sort', filters.sort)
    if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection)
    
    const query = params.toString()
    return this.request<PaginatedResponse<Job>>(`/jobs${query ? `?${query}` : ''}`)
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`)
  }

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    })
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteJob(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
    })
  }

  async reorderJobs(fromIndex: number, toIndex: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/jobs/reorder', {
      method: 'POST',
      body: JSON.stringify({ fromIndex, toIndex }),
    })
  }

  // Candidates API
  async getCandidates(filters?: CandidateFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Candidate>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.stage) params.append('stage', filters.stage)
    if (filters?.jobId) params.append('jobId', filters.jobId)
    
    const query = params.toString()
    return this.request<PaginatedResponse<Candidate>>(`/candidates${query ? `?${query}` : ''}`)
  }

  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>(`/candidates/${id}`)
  }

  async createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'timeline'>): Promise<Candidate> {
    return this.request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate),
    })
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async addCandidateNote(candidateId: string, note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    return this.request<Note>(`/candidates/${candidateId}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    })
  }

  // Assessments API
  async getAssessment(jobId: string): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${jobId}`)
  }

  async updateAssessment(jobId: string, assessment: Assessment): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    })
  }

  async submitAssessmentResponse(assessmentId: string, response: Omit<AssessmentResponse, 'id' | 'submittedAt'>): Promise<AssessmentResponse> {
    return this.request<AssessmentResponse>(`/assessments/${assessmentId}/responses`, {
      method: 'POST',
      body: JSON.stringify(response),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual API functions for convenience
export const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  reorderJobs,
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  addCandidateNote,
  getAssessment,
  updateAssessment,
  submitAssessmentResponse,
} = apiClient