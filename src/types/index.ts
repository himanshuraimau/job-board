export interface Job {
  id: string
  title: string
  slug: string
  description: string
  status: 'active' | 'archived'
  tags: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  id: string
  name: string
  email: string
  jobId: string
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'
  notes: Note[]
  timeline: TimelineEvent[]
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  content: string
  mentions: string[]
  createdAt: Date
  authorId: string
}

export interface TimelineEvent {
  id: string
  type: 'stage_change' | 'note_added' | 'assessment_completed'
  description: string
  data?: Record<string, unknown>
  createdAt: Date
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  description?: string
  sections: Section[]
  createdAt: Date
  updatedAt: Date
}

export interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
  order: number
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'text' | 'longtext' | 'numeric' | 'file'
  title: string
  description?: string
  options?: string[]
  required: boolean
  validation?: ValidationRule
  conditional?: ConditionalRule
  order: number
}

export interface ValidationRule {
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: string
}

export interface ConditionalRule {
  dependsOn: string // question id
  showWhen: 'equals' | 'not_equals' | 'contains'
  value: string | string[]
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  candidateId: string
  responses: QuestionResponse[]
  submittedAt: Date
  score?: number
}

export interface QuestionResponse {
  questionId: string
  value: string | string[] | number | File
}

// API Types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface JobFilters {
  search?: string
  status?: 'active' | 'archived'
  tags?: string[]
  sort?: 'title' | 'createdAt' | 'order'
  sortDirection?: 'asc' | 'desc'
}

export interface CandidateFilters {
  search?: string
  stage?: Candidate['stage']
  jobId?: string
}

// Store Types
export interface JobStore {
  jobs: Job[]
  loading: boolean
  error: string | null
  filters: JobFilters
  pagination: { page: number; pageSize: number; total: number }
  
  // Actions
  fetchJobs: () => Promise<void>
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  reorderJobs: (fromIndex: number, toIndex: number) => Promise<void>
  setFilters: (filters: Partial<JobFilters>) => void
  setPage: (page: number) => void
}

export interface CandidateStore {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  filters: CandidateFilters
  pagination: { page: number; pageSize: number; total: number }
  
  // Actions
  fetchCandidates: () => Promise<void>
  createCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'timeline'>) => Promise<void>
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>
  addNote: (candidateId: string, note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>
  moveStage: (candidateId: string, newStage: Candidate['stage']) => Promise<void>
  setFilters: (filters: Partial<CandidateFilters>) => void
  setPage: (page: number) => void
}

export interface AssessmentStore {
  assessments: Record<string, Assessment> // keyed by jobId
  responses: Record<string, AssessmentResponse> // keyed by responseId
  loading: boolean
  error: string | null
  
  // Actions
  fetchAssessment: (jobId: string) => Promise<void>
  updateAssessment: (jobId: string, assessment: Assessment) => Promise<void>
  submitResponse: (response: Omit<AssessmentResponse, 'id' | 'submittedAt'>) => Promise<void>
}
