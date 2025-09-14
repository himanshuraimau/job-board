import { faker } from '@faker-js/faker'
import type { Job, Candidate, Assessment, Section, Question, TimelineEvent, Note } from '@/types'

// Job Statuses
const JOB_STATUSES: Array<'active' | 'archived'> = ['active', 'archived']

// Candidate Stages
const CANDIDATE_STAGES: Array<'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'> = [
  'applied', 'screen', 'tech', 'offer', 'hired', 'rejected'
]

// Common job tags
const JOB_TAGS = [
  'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'DevOps', 'UI/UX', 'Data Science',
  'Machine Learning', 'Product Management', 'Marketing', 'Sales', 'Remote', 'On-site',
  'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'Senior', 'Mid-level', 'Junior'
]

// Question types
const QUESTION_TYPES: Array<'single' | 'multiple' | 'text' | 'longtext' | 'numeric' | 'file'> = [
  'single', 'multiple', 'text', 'longtext', 'numeric', 'file'
]

export function generateJob(order?: number): Job {
  const title = faker.person.jobTitle()
  return {
    id: faker.string.uuid(),
    title,
    slug: faker.helpers.slugify(title).toLowerCase(),
    description: faker.lorem.paragraphs(2, '\n\n'),
    status: faker.helpers.arrayElement(JOB_STATUSES),
    tags: faker.helpers.arrayElements(JOB_TAGS, { min: 1, max: 5 }),
    order: order ?? faker.number.int({ min: 1, max: 1000 }),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 })
  }
}

export function generateJobs(count: number): Job[] {
  return Array.from({ length: count }, (_, index) => generateJob(index + 1))
}

export function generateTimelineEvent(): TimelineEvent {
  const types: TimelineEvent['type'][] = ['stage_change', 'note_added', 'assessment_completed']
  const type = faker.helpers.arrayElement(types)
  
  let description = ''
  switch (type) {
    case 'stage_change':
      const fromStage = faker.helpers.arrayElement(CANDIDATE_STAGES)
      const toStage = faker.helpers.arrayElement(CANDIDATE_STAGES.filter(s => s !== fromStage))
      description = `Moved from ${fromStage} to ${toStage}`
      break
    case 'note_added':
      description = 'Added a note'
      break
    case 'assessment_completed':
      description = 'Completed assessment'
      break
  }

  return {
    id: faker.string.uuid(),
    type,
    description,
    data: {},
    createdAt: faker.date.recent({ days: 30 })
  }
}

export function generateNote(): Note {
  return {
    id: faker.string.uuid(),
    content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
    mentions: faker.helpers.maybe(() => 
      faker.helpers.arrayElements(['hr@company.com', 'manager@company.com'], { min: 0, max: 2 })
    ) ?? [],
    createdAt: faker.date.recent({ days: 10 }),
    authorId: faker.string.uuid()
  }
}

export function generateCandidate(jobIds: string[]): Candidate {
  const timeline = Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) }, 
    generateTimelineEvent
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  const notes = Array.from(
    { length: faker.number.int({ min: 0, max: 3 }) },
    generateNote
  )

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    jobId: faker.helpers.arrayElement(jobIds),
    stage: faker.helpers.arrayElement(CANDIDATE_STAGES),
    notes,
    timeline,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 7 })
  }
}

export function generateCandidates(count: number, jobIds: string[]): Candidate[] {
  return Array.from({ length: count }, () => generateCandidate(jobIds))
}

export function generateQuestion(order: number): Question {
  const type = faker.helpers.arrayElement(QUESTION_TYPES)
  let options: string[] | undefined
  
  if (type === 'single' || type === 'multiple') {
    options = Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () =>
      faker.lorem.words(faker.number.int({ min: 1, max: 4 }))
    )
  }

  const question: Question = {
    id: faker.string.uuid(),
    type,
    title: faker.lorem.sentence().replace('.', '?'),
    description: faker.helpers.maybe(() => faker.lorem.sentence()) ?? undefined,
    options,
    required: faker.datatype.boolean(),
    order,
    validation: undefined,
    conditional: undefined
  }

  // Add validation based on type
  if (type === 'text') {
    question.validation = {
      minLength: faker.number.int({ min: 1, max: 5 }),
      maxLength: faker.number.int({ min: 50, max: 200 })
    }
  } else if (type === 'longtext') {
    question.validation = {
      minLength: faker.number.int({ min: 10, max: 50 }),
      maxLength: faker.number.int({ min: 200, max: 1000 })
    }
  } else if (type === 'numeric') {
    question.validation = {
      minValue: 0,
      maxValue: faker.number.int({ min: 10, max: 100 })
    }
  }

  return question
}

export function generateSection(order: number): Section {
  const questionCount = faker.number.int({ min: 2, max: 8 })
  
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(faker.number.int({ min: 2, max: 4 })),
    description: faker.helpers.maybe(() => faker.lorem.sentence()) ?? undefined,
    questions: Array.from({ length: questionCount }, (_, index) => 
      generateQuestion(index + 1)
    ),
    order
  }
}

export function generateAssessment(jobId: string): Assessment {
  const sectionCount = faker.number.int({ min: 2, max: 5 })
  
  return {
    id: faker.string.uuid(),
    jobId,
    title: `Assessment for ${faker.person.jobTitle()}`,
    description: faker.lorem.paragraph(),
    sections: Array.from({ length: sectionCount }, (_, index) => 
      generateSection(index + 1)
    ),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 })
  }
}

export function generateAssessments(jobIds: string[]): Assessment[] {
  // Generate assessments for random subset of jobs
  const jobsWithAssessments = faker.helpers.arrayElements(
    jobIds, 
    { min: Math.min(3, jobIds.length), max: jobIds.length }
  )
  
  return jobsWithAssessments.map(generateAssessment)
}

// Generate seed data
export function generateSeedData() {
  const jobs = generateJobs(25)
  const candidates = generateCandidates(1000, jobs.map(j => j.id))
  const assessments = generateAssessments(jobs.map(j => j.id))
  
  return {
    jobs,
    candidates,
    assessments
  }
}
