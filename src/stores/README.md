# TalentFlow Stores

This directory contains Zustand stores for managing application state with optimistic updates and rollback functionality.

## Stores Overview

### Jobs Store (`jobs.ts`)
Manages job postings with full CRUD operations, filtering, pagination, and drag-and-drop reordering.

**Key Features:**
- Optimistic updates with automatic rollback on failure
- Real-time filtering and search
- Pagination support
- Drag-and-drop reordering with optimistic updates

**Usage Example:**
```typescript
import { useJobStore, useJobsActions, useActiveJobs } from '@/stores'

function JobsPage() {
  const jobs = useActiveJobs()
  const { fetchJobs, createJob, reorderJobs } = useJobsActions()
  
  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])
  
  // Create new job with optimistic update
  const handleCreateJob = async (jobData) => {
    try {
      await createJob(jobData)
      // UI updates immediately, rollback on failure
    } catch (error) {
      // Error handling - optimistic update already rolled back
    }
  }
}
```

### Candidates Store (`candidates.ts`)
Manages candidates with stage transitions, notes, timeline tracking, and virtualized list support.

**Key Features:**
- Stage management with automatic timeline updates
- Notes system with @mentions support
- Optimistic updates for all operations
- Client-side search and filtering
- Kanban board data structure

**Usage Example:**
```typescript
import { useCandidateStore, useKanbanData, useCandidatesActions } from '@/stores'

function CandidatesKanban() {
  const kanbanData = useKanbanData()
  const { moveStage, addNote } = useCandidatesActions()
  
  // Move candidate between stages
  const handleStageMove = async (candidateId, newStage) => {
    try {
      await moveStage(candidateId, newStage)
      // UI updates immediately with timeline event
    } catch (error) {
      // Rollback to previous state
    }
  }
}
```

### Assessments Store (`assessments.ts`)
Manages assessment creation, conditional logic, and response handling.

**Key Features:**
- Assessment builder with sections and questions
- Conditional logic for dynamic forms
- Response validation and submission
- Helper functions for assessment management

**Usage Example:**
```typescript
import { useAssessmentStore, useAssessmentHelpers } from '@/stores'

function AssessmentBuilder({ jobId }) {
  const assessment = useAssessmentByJobId(jobId)
  const { addQuestion, updateQuestion } = useAssessmentHelpers()
  
  // Add new question to assessment
  const handleAddQuestion = (sectionId, questionData) => {
    addQuestion(jobId, sectionId, questionData)
    // Optimistic update with server sync
  }
}
```

## Store Architecture

### Optimistic Updates
All stores implement optimistic updates with automatic rollback:

1. **Immediate UI Update**: Changes are applied to local state immediately
2. **Server Sync**: API call is made in the background
3. **Success**: Local state is updated with server response
4. **Failure**: Local state is rolled back to previous state

### Error Handling
- All operations include comprehensive error handling
- Failed operations automatically rollback optimistic updates
- Error messages are stored in store state for UI display

### Performance Optimizations
- Selective subscriptions using individual selectors
- Computed selectors for derived data
- Minimal re-renders through targeted state updates

## Best Practices

1. **Use Selective Subscriptions**: Import specific selectors instead of the entire store
   ```typescript
   // Good
   const jobs = useJobsData()
   const loading = useJobsLoading()
   
   // Avoid
   const { jobs, loading } = useJobStore()
   ```

2. **Handle Errors Gracefully**: Always wrap store actions in try-catch blocks
   ```typescript
   try {
     await createJob(jobData)
   } catch (error) {
     // Handle error - optimistic update already rolled back
     showErrorToast(error.message)
   }
   ```

3. **Use Computed Selectors**: Leverage built-in selectors for common operations
   ```typescript
   const activeJobs = useActiveJobs() // Pre-filtered
   const kanbanData = useKanbanData() // Pre-structured for kanban
   ```

4. **Batch Related Updates**: Use store actions that handle multiple related updates
   ```typescript
   // Good - single action handles stage change + timeline update
   await moveStage(candidateId, newStage)
   
   // Avoid - separate updates that could get out of sync
   await updateCandidate(candidateId, { stage: newStage })
   await addTimelineEvent(candidateId, event)
   ```