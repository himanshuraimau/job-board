import Dexie, { type Table } from 'dexie'
import type { Job, Candidate, Assessment, AssessmentResponse, Note } from '../types'

export class TalentFlowDB extends Dexie {
    jobs!: Table<Job>
    candidates!: Table<Candidate>
    assessments!: Table<Assessment>
    assessmentResponses!: Table<AssessmentResponse>

    constructor() {
        super('TalentFlowDB')

        // Define schemas
        this.version(1).stores({
            jobs: '++id, title, status, order, createdAt, updatedAt',
            candidates: '++id, name, email, jobId, stage, createdAt, updatedAt',
            assessments: '++id, jobId, title, createdAt, updatedAt',
            assessmentResponses: '++id, assessmentId, candidateId, submittedAt'
        })

        // Add hooks for automatic timestamps
        this.jobs.hook('creating', (_primKey, obj, _trans) => {
            obj.createdAt = new Date()
            obj.updatedAt = new Date()
        })

        this.jobs.hook('updating', (modifications, _primKey, _obj, _trans) => {
            (modifications as any).updatedAt = new Date()
        })

        this.candidates.hook('creating', (_primKey, obj, _trans) => {
            obj.createdAt = new Date()
            obj.updatedAt = new Date()
            obj.notes = obj.notes || []
            obj.timeline = obj.timeline || []
        })

        this.candidates.hook('updating', (modifications, _primKey, _obj, _trans) => {
            (modifications as any).updatedAt = new Date()
        })

        this.assessments.hook('creating', (_primKey, obj, _trans) => {
            obj.createdAt = new Date()
            obj.updatedAt = new Date()
        })

        this.assessments.hook('updating', (modifications, _primKey, _obj, _trans) => {
            (modifications as any).updatedAt = new Date()
        })

        this.assessmentResponses.hook('creating', (_primKey, obj, _trans) => {
            obj.submittedAt = new Date()
        })
    }
}

// Create database instance
export const db = new TalentFlowDB()

// Database service methods
export class DatabaseService {
    // Jobs CRUD operations
    static async getAllJobs(): Promise<Job[]> {
        return await db.jobs.orderBy('order').toArray()
    }

    static async getJobById(id: string): Promise<Job | undefined> {
        return await db.jobs.get(id)
    }

    static async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
        const id = await db.jobs.add(job as Job)
        const createdJob = await db.jobs.get(id)
        if (!createdJob) throw new Error('Failed to create job')
        return createdJob
    }

    static async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
        await db.jobs.update(id, updates)
        const updatedJob = await db.jobs.get(id)
        if (!updatedJob) throw new Error('Job not found')
        return updatedJob
    }

    static async deleteJob(id: string): Promise<void> {
        await db.jobs.delete(id)
    }

    static async reorderJobs(jobs: Job[]): Promise<void> {
        await db.transaction('rw', db.jobs, async () => {
            for (const job of jobs) {
                await db.jobs.update(job.id, { order: job.order })
            }
        })
    }

    // Candidates CRUD operations
    static async getAllCandidates(): Promise<Candidate[]> {
        return await db.candidates.orderBy('createdAt').reverse().toArray()
    }

    static async getCandidateById(id: string): Promise<Candidate | undefined> {
        return await db.candidates.get(id)
    }

    static async getCandidatesByJobId(jobId: string): Promise<Candidate[]> {
        return await db.candidates.where('jobId').equals(jobId).toArray()
    }

    static async getCandidatesByStage(stage: Candidate['stage']): Promise<Candidate[]> {
        return await db.candidates.where('stage').equals(stage).toArray()
    }

    static async createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'timeline'>): Promise<Candidate> {
        const candidateWithDefaults = {
            ...candidate,
            notes: [],
            timeline: [{
                id: crypto.randomUUID(),
                type: 'stage_change' as const,
                description: `Candidate applied for position`,
                createdAt: new Date()
            }]
        }

        const id = await db.candidates.add(candidateWithDefaults as any)
        const createdCandidate = await db.candidates.get(id)
        if (!createdCandidate) throw new Error('Failed to create candidate')
        return createdCandidate
    }

    static async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
        await db.candidates.update(id, updates)
        const updatedCandidate = await db.candidates.get(id)
        if (!updatedCandidate) throw new Error('Candidate not found')
        return updatedCandidate
    }

    static async addCandidateNote(candidateId: string, note: Omit<Note, 'id' | 'createdAt'>): Promise<Candidate> {
        const candidate = await db.candidates.get(candidateId)
        if (!candidate) throw new Error('Candidate not found')

        const newNote = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: new Date()
        }

        const newTimelineEvent = {
            id: crypto.randomUUID(),
            type: 'note_added' as const,
            description: `Note added: ${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}`,
            createdAt: new Date()
        }

        const updatedCandidate = {
            ...candidate,
            notes: [...candidate.notes, newNote],
            timeline: [...candidate.timeline, newTimelineEvent]
        }

        await db.candidates.update(candidateId, {
            notes: updatedCandidate.notes,
            timeline: updatedCandidate.timeline
        })

        return updatedCandidate
    }

    static async moveCandidateStage(candidateId: string, newStage: Candidate['stage']): Promise<Candidate> {
        const candidate = await db.candidates.get(candidateId)
        if (!candidate) throw new Error('Candidate not found')

        const newTimelineEvent = {
            id: crypto.randomUUID(),
            type: 'stage_change' as const,
            description: `Stage changed from ${candidate.stage} to ${newStage}`,
            data: { previousStage: candidate.stage, newStage },
            createdAt: new Date()
        }

        const updatedCandidate = {
            ...candidate,
            stage: newStage,
            timeline: [...candidate.timeline, newTimelineEvent]
        }

        await db.candidates.update(candidateId, {
            stage: newStage,
            timeline: updatedCandidate.timeline
        })

        return updatedCandidate
    }

    static async deleteCandidate(id: string): Promise<void> {
        await db.candidates.delete(id)
    }

    // Assessments CRUD operations
    static async getAssessmentByJobId(jobId: string): Promise<Assessment | undefined> {
        return await db.assessments.where('jobId').equals(jobId).first()
    }

    static async createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assessment> {
        const id = await db.assessments.add(assessment as Assessment)
        const createdAssessment = await db.assessments.get(id)
        if (!createdAssessment) throw new Error('Failed to create assessment')
        return createdAssessment
    }

    static async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
        await db.assessments.update(id, updates)
        const updatedAssessment = await db.assessments.get(id)
        if (!updatedAssessment) throw new Error('Assessment not found')
        return updatedAssessment
    }

    static async deleteAssessment(id: string): Promise<void> {
        await db.assessments.delete(id)
    }

    // Assessment Responses CRUD operations
    static async getResponsesByAssessmentId(assessmentId: string): Promise<AssessmentResponse[]> {
        return await db.assessmentResponses.where('assessmentId').equals(assessmentId).toArray()
    }

    static async getResponsesByCandidateId(candidateId: string): Promise<AssessmentResponse[]> {
        return await db.assessmentResponses.where('candidateId').equals(candidateId).toArray()
    }

    static async createAssessmentResponse(response: Omit<AssessmentResponse, 'id' | 'submittedAt'>): Promise<AssessmentResponse> {
        const id = await db.assessmentResponses.add(response as AssessmentResponse)
        const createdResponse = await db.assessmentResponses.get(id)
        if (!createdResponse) throw new Error('Failed to create assessment response')

        // Add timeline event to candidate
        const candidate = await db.candidates.get(response.candidateId)
        if (candidate) {
            const newTimelineEvent = {
                id: crypto.randomUUID(),
                type: 'assessment_completed' as const,
                description: 'Assessment completed',
                data: { assessmentId: response.assessmentId },
                createdAt: new Date()
            }

            await db.candidates.update(response.candidateId, {
                timeline: [...candidate.timeline, newTimelineEvent]
            })
        }

        return createdResponse
    }

    // Database initialization and seeding
    static async initializeDatabase(): Promise<void> {
        try {
            await db.open()

            // Check if database is already seeded
            const jobCount = await db.jobs.count()
            if (jobCount === 0) {
                await this.seedDatabase()
            }
        } catch (error) {
            console.error('Failed to initialize database:', error)
            throw error
        }
    }

    static async seedDatabase(): Promise<void> {
        console.log('Seeding database with initial data...')

        // We'll implement the seeding logic in the next step
        // For now, just log that seeding would happen here
        console.log('Database seeding will be implemented with mock data generation')
    }

    // Utility methods
    static async clearAllData(): Promise<void> {
        await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses], async () => {
            await db.jobs.clear()
            await db.candidates.clear()
            await db.assessments.clear()
            await db.assessmentResponses.clear()
        })
    }

    static async exportData(): Promise<{
        jobs: Job[]
        candidates: Candidate[]
        assessments: Assessment[]
        assessmentResponses: AssessmentResponse[]
    }> {
        return {
            jobs: await db.jobs.toArray(),
            candidates: await db.candidates.toArray(),
            assessments: await db.assessments.toArray(),
            assessmentResponses: await db.assessmentResponses.toArray()
        }
    }
}