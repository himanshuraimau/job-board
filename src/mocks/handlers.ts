import { http, HttpResponse, delay } from 'msw'
import type { Job, Candidate, Assessment, Note, AssessmentResponse, PaginatedResponse, JobFilters, CandidateFilters } from '@/types'
import { generateSeedData } from './generators'

// Generate seed data
const seedData = generateSeedData()
let { jobs, candidates, assessments } = seedData

// Simulate realistic latency (200-1200ms)
const simulateLatency = () => delay(200 + Math.random() * 1000)

// Simulate 5-10% failure rate
const simulateFailure = () => Math.random() < 0.075 // 7.5% failure rate

// Helper function to paginate data
function paginate<T>(data: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)
  
  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize)
    }
  }
}

// Helper function to filter jobs
function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  let filtered = [...jobs]
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.status) {
    filtered = filtered.filter(job => job.status === filters.status)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(job => 
      filters.tags!.some(tag => job.tags.includes(tag))
    )
  }
  
  // Sort
  if (filters.sort) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sort) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'order':
          aValue = a.order
          bValue = b.order
          break
        default:
          return 0
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return filters.sortDirection === 'desc' ? -result : result
    })
  }
  
  return filtered
}

// Helper function to filter candidates
function filterCandidates(candidates: Candidate[], filters: CandidateFilters): Candidate[] {
  let filtered = [...candidates]
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(candidate => 
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.stage) {
    filtered = filtered.filter(candidate => candidate.stage === filters.stage)
  }
  
  if (filters.jobId) {
    filtered = filtered.filter(candidate => candidate.jobId === filters.jobId)
  }
  
  return filtered
}

export const handlers = [
  // Jobs API
  http.get('/api/jobs', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search') || undefined
    const status = url.searchParams.get('status') as 'active' | 'archived' | undefined
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const sort = url.searchParams.get('sort') as 'title' | 'createdAt' | 'order' | undefined
    const sortDirection = url.searchParams.get('sortDirection') as 'asc' | 'desc' | undefined
    
    const filters: JobFilters = { search, status, tags, sort, sortDirection }
    const filteredJobs = filterJobs(jobs, filters)
    const paginatedResponse = paginate(filteredJobs, page, pageSize)
    
    return HttpResponse.json(paginatedResponse)
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const job = jobs.find(j => j.id === params.id)
    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(job)
  }),

  http.post('/api/jobs', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }
    
    const jobData = await request.json() as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
    const newJob: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    jobs.push(newJob)
    return HttpResponse.json(newJob, { status: 201 })
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      )
    }
    
    const jobIndex = jobs.findIndex(j => j.id === params.id)
    if (jobIndex === -1) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    const updates = await request.json() as Partial<Job>
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    return HttpResponse.json(jobs[jobIndex])
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      )
    }
    
    const jobIndex = jobs.findIndex(j => j.id === params.id)
    if (jobIndex === -1) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    jobs.splice(jobIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/jobs/reorder', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to reorder jobs' },
        { status: 500 }
      )
    }
    
    const { fromIndex, toIndex } = await request.json() as { fromIndex: number; toIndex: number }
    
    // Reorder jobs array
    const [movedJob] = jobs.splice(fromIndex, 1)
    jobs.splice(toIndex, 0, movedJob)
    
    // Update order values
    jobs.forEach((job, index) => {
      job.order = index + 1
      job.updatedAt = new Date()
    })
    
    return HttpResponse.json({ success: true })
  }),

  // Alternative PATCH endpoint for job reordering
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to reorder job' },
        { status: 500 }
      )
    }
    
    const { newOrder } = await request.json() as { newOrder: number }
    const jobIndex = jobs.findIndex(j => j.id === params.id)
    
    if (jobIndex === -1) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    // Update the specific job's order
    jobs[jobIndex].order = newOrder
    jobs[jobIndex].updatedAt = new Date()
    
    return HttpResponse.json(jobs[jobIndex])
  }),

  // Candidates API
  http.get('/api/candidates', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search') || undefined
    const stage = url.searchParams.get('stage') as Candidate['stage'] | undefined
    const jobId = url.searchParams.get('jobId') || undefined
    
    const filters: CandidateFilters = { search, stage, jobId }
    const filteredCandidates = filterCandidates(candidates, filters)
    const paginatedResponse = paginate(filteredCandidates, page, pageSize)
    
    return HttpResponse.json(paginatedResponse)
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const candidate = candidates.find(c => c.id === params.id)
    if (!candidate) {
      return HttpResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(candidate)
  }),

  http.post('/api/candidates', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to create candidate' },
        { status: 500 }
      )
    }
    
    const candidateData = await request.json() as Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'timeline'>
    const newCandidate: Candidate = {
      ...candidateData,
      id: crypto.randomUUID(),
      notes: [],
      timeline: [{
        id: crypto.randomUUID(),
        type: 'stage_change',
        description: 'Application submitted',
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    candidates.push(newCandidate)
    return HttpResponse.json(newCandidate, { status: 201 })
  }),

  http.put('/api/candidates/:id', async ({ params, request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to update candidate' },
        { status: 500 }
      )
    }
    
    const candidateIndex = candidates.findIndex(c => c.id === params.id)
    if (candidateIndex === -1) {
      return HttpResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    const updates = await request.json() as Partial<Candidate>
    const oldCandidate = candidates[candidateIndex]
    
    candidates[candidateIndex] = {
      ...oldCandidate,
      ...updates,
      updatedAt: new Date()
    }
    
    // Add timeline event for stage changes
    if (updates.stage && updates.stage !== oldCandidate.stage) {
      candidates[candidateIndex].timeline.push({
        id: crypto.randomUUID(),
        type: 'stage_change',
        description: `Moved from ${oldCandidate.stage} to ${updates.stage}`,
        createdAt: new Date()
      })
    }
    
    return HttpResponse.json(candidates[candidateIndex])
  }),

  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to add note' },
        { status: 500 }
      )
    }
    
    const candidateIndex = candidates.findIndex(c => c.id === params.id)
    if (candidateIndex === -1) {
      return HttpResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    const noteData = await request.json() as Omit<Note, 'id' | 'createdAt'>
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    
    candidates[candidateIndex].notes.push(newNote)
    candidates[candidateIndex].timeline.push({
      id: crypto.randomUUID(),
      type: 'note_added',
      description: 'Added a note',
      createdAt: new Date()
    })
    candidates[candidateIndex].updatedAt = new Date()
    
    return HttpResponse.json(newNote, { status: 201 })
  }),

  // Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const candidate = candidates.find(c => c.id === params.id)
    if (!candidate) {
      return HttpResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    // Return sorted timeline (newest first)
    const sortedTimeline = [...candidate.timeline].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
    
    return HttpResponse.json(sortedTimeline)
  }),

  // Assessments API
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    const assessment = assessments.find(a => a.jobId === params.jobId)
    if (!assessment) {
      return HttpResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(assessment)
  }),

  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to update assessment' },
        { status: 500 }
      )
    }
    
    const assessmentData = await request.json() as Assessment
    const assessmentIndex = assessments.findIndex(a => a.jobId === params.jobId)
    
    if (assessmentIndex === -1) {
      // Create new assessment
      const newAssessment: Assessment = {
        ...assessmentData,
        id: crypto.randomUUID(),
        jobId: params.jobId as string,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      assessments.push(newAssessment)
      return HttpResponse.json(newAssessment, { status: 201 })
    } else {
      // Update existing assessment
      assessments[assessmentIndex] = {
        ...assessmentData,
        updatedAt: new Date()
      }
      return HttpResponse.json(assessments[assessmentIndex])
    }
  }),

  http.post('/api/assessments/:assessmentId/responses', async ({ request }) => {
    await simulateLatency()
    
    if (simulateFailure()) {
      return HttpResponse.json(
        { error: 'Failed to submit assessment response' },
        { status: 500 }
      )
    }
    
    const responseData = await request.json() as Omit<AssessmentResponse, 'id' | 'submittedAt'>
    const newResponse: AssessmentResponse = {
      ...responseData,
      id: crypto.randomUUID(),
      submittedAt: new Date()
    }
    
    // Add timeline event to candidate
    const candidateIndex = candidates.findIndex(c => c.id === responseData.candidateId)
    if (candidateIndex !== -1) {
      candidates[candidateIndex].timeline.push({
        id: crypto.randomUUID(),
        type: 'assessment_completed',
        description: 'Completed assessment',
        createdAt: new Date()
      })
      candidates[candidateIndex].updatedAt = new Date()
    }
    
    return HttpResponse.json(newResponse, { status: 201 })
  })
]