import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Assessment, AssessmentStore, AssessmentResponse, Question, Section } from '@/types'
import { apiClient } from '@/lib/api'

interface AssessmentStoreState extends AssessmentStore {
  // Internal state for optimistic updates
  _previousAssessments?: Record<string, Assessment>
  _previousResponses?: Record<string, AssessmentResponse>
  _operationInProgress?: string
}

export const useAssessmentStore = create<AssessmentStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    assessments: {},
    responses: {},
    loading: false,
    error: null,

    // Actions
    fetchAssessment: async (jobId) => {
      set({ loading: true, error: null })
      
      try {
        const assessment = await apiClient.getAssessment(jobId)
        
        set(state => ({
          assessments: {
            ...state.assessments,
            [jobId]: assessment
          },
          loading: false
        }))
      } catch (error) {
        // If assessment doesn't exist (404), create a new empty one
        if (error instanceof Error && error.message.includes('not found')) {
          const newAssessment: Assessment = {
            id: crypto.randomUUID(),
            jobId: jobId,
            title: '',
            description: '',
            sections: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          set(state => ({
            assessments: {
              ...state.assessments,
              [jobId]: newAssessment
            },
            loading: false
          }))
        } else {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch assessment',
            loading: false
          })
        }
      }
    },

    updateAssessment: async (jobId, assessment) => {
      // Store previous state for rollback
      const currentAssessments = get().assessments
      
      // Optimistic update
      const optimisticAssessments = {
        ...currentAssessments,
        [jobId]: {
          ...assessment,
          updatedAt: new Date()
        }
      }
      
      set({
        assessments: optimisticAssessments,
        _previousAssessments: currentAssessments,
        _operationInProgress: 'update'
      })

      try {
        const updatedAssessment = await apiClient.updateAssessment(jobId, assessment)
        
        // Update with server response
        set(state => ({
          assessments: {
            ...state.assessments,
            [jobId]: updatedAssessment
          },
          _previousAssessments: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousAssessments } = get()
        set({
          assessments: _previousAssessments || {},
          error: error instanceof Error ? error.message : 'Failed to update assessment',
          _previousAssessments: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    submitResponse: async (responseData) => {
      const tempId = `temp-response-${Date.now()}`
      const optimisticResponse: AssessmentResponse = {
        ...responseData,
        id: tempId,
        submittedAt: new Date()
      }

      // Store previous state for rollback
      const currentResponses = get().responses
      
      // Optimistic update
      set({
        responses: {
          ...currentResponses,
          [tempId]: optimisticResponse
        },
        _previousResponses: currentResponses,
        _operationInProgress: 'submitResponse'
      })

      try {
        const createdResponse = await apiClient.submitAssessmentResponse(
          responseData.assessmentId, 
          responseData
        )
        
        // Replace optimistic response with real response
        const { [tempId]: removed, ...otherResponses } = get().responses
        set({
          responses: {
            ...otherResponses,
            [createdResponse.id]: createdResponse
          },
          _previousResponses: undefined,
          _operationInProgress: undefined
        })
      } catch (error) {
        // Rollback optimistic update
        const { _previousResponses } = get()
        set({
          responses: _previousResponses || {},
          error: error instanceof Error ? error.message : 'Failed to submit response',
          _previousResponses: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    }
  }))
)

// Helper functions for assessment building
export const useAssessmentHelpers = () => {
  const { assessments, updateAssessment } = useAssessmentStore()

  return {
    // Section management
    addSection: (jobId: string, section: Omit<Section, 'id'>) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const newSection: Section = {
        ...section,
        id: `section-${Date.now()}`,
        order: assessment.sections.length
      }

      const updatedAssessment = {
        ...assessment,
        sections: [...assessment.sections, newSection]
      }

      updateAssessment(jobId, updatedAssessment)
    },

    updateSection: (jobId: string, sectionId: string, updates: Partial<Section>) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }

      updateAssessment(jobId, updatedAssessment)
    },

    deleteSection: (jobId: string, sectionId: string) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.filter(section => section.id !== sectionId)
      }

      updateAssessment(jobId, updatedAssessment)
    },

    reorderSections: (jobId: string, fromIndex: number, toIndex: number) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const sections = [...assessment.sections]
      const [movedSection] = sections.splice(fromIndex, 1)
      sections.splice(toIndex, 0, movedSection)

      // Update order property
      const reorderedSections = sections.map((section, index) => ({
        ...section,
        order: index
      }))

      const updatedAssessment = {
        ...assessment,
        sections: reorderedSections
      }

      updateAssessment(jobId, updatedAssessment)
    },

    // Question management
    addQuestion: (jobId: string, sectionId: string, question: Omit<Question, 'id'>) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const newQuestion: Question = {
        ...question,
        id: `question-${Date.now()}`,
        order: assessment.sections.find(s => s.id === sectionId)?.questions.length || 0
      }

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.map(section =>
          section.id === sectionId
            ? { ...section, questions: [...section.questions, newQuestion] }
            : section
        )
      }

      updateAssessment(jobId, updatedAssessment)
    },

    updateQuestion: (jobId: string, sectionId: string, questionId: string, updates: Partial<Question>) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                questions: section.questions.map(question =>
                  question.id === questionId ? { ...question, ...updates } : question
                )
              }
            : section
        )
      }

      updateAssessment(jobId, updatedAssessment)
    },

    deleteQuestion: (jobId: string, sectionId: string, questionId: string) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                questions: section.questions.filter(question => question.id !== questionId)
              }
            : section
        )
      }

      updateAssessment(jobId, updatedAssessment)
    },

    reorderQuestions: (jobId: string, sectionId: string, fromIndex: number, toIndex: number) => {
      const assessment = assessments[jobId]
      if (!assessment) return

      const updatedAssessment = {
        ...assessment,
        sections: assessment.sections.map(section => {
          if (section.id !== sectionId) return section

          const questions = [...section.questions]
          const [movedQuestion] = questions.splice(fromIndex, 1)
          questions.splice(toIndex, 0, movedQuestion)

          // Update order property
          const reorderedQuestions = questions.map((question, index) => ({
            ...question,
            order: index
          }))

          return { ...section, questions: reorderedQuestions }
        })
      }

      updateAssessment(jobId, updatedAssessment)
    },

    // Conditional logic helpers
    getAvailableQuestions: (jobId: string, currentQuestionId: string): Question[] => {
      const assessment = assessments[jobId]
      if (!assessment) return []

      const allQuestions: Question[] = []
      let foundCurrent = false

      // Only return questions that appear before the current question
      for (const section of assessment.sections) {
        for (const question of section.questions) {
          if (question.id === currentQuestionId) {
            foundCurrent = true
            break
          }
          allQuestions.push(question)
        }
        if (foundCurrent) break
      }

      return allQuestions
    },

    validateConditionalLogic: (jobId: string): { isValid: boolean; errors: string[] } => {
      const assessment = assessments[jobId]
      if (!assessment) return { isValid: true, errors: [] }

      const errors: string[] = []
      const questionIds = new Set<string>()
      const questionMap = new Map<string, Question>()

      // Collect all question IDs and create a map
      assessment.sections.forEach(section => {
        section.questions.forEach(question => {
          questionIds.add(question.id)
          questionMap.set(question.id, question)
        })
      })

      // Validate conditional rules
      assessment.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.conditional) {
            const { dependsOn, value } = question.conditional
            
            // Check if dependency exists
            if (!questionIds.has(dependsOn)) {
              errors.push(`Question "${question.title}" depends on non-existent question`)
              return
            }

            // Check for circular dependencies - simplified check for now
            // TODO: Implement full circular dependency detection
            if (dependsOn === question.id) {
              errors.push(`Question "${question.title}" cannot depend on itself`)
            }

            // Validate condition values against dependency question type
            const dependencyQuestion = questionMap.get(dependsOn)
            if (dependencyQuestion && Array.isArray(value)) {
              if (dependencyQuestion.type === 'single' || dependencyQuestion.type === 'multiple') {
                const invalidValues = value.filter(v => 
                  !dependencyQuestion.options?.includes(v as string)
                )
                if (invalidValues.length > 0) {
                  errors.push(`Question "${question.title}" has invalid condition values: ${invalidValues.join(', ')}`)
                }
              }
            }
          }
        })
      })

      return { isValid: errors.length === 0, errors }
    }
  }
}

// Response evaluation helpers - standalone functions to avoid circular dependency
export const shouldShowQuestion = (question: Question, currentResponses: Record<string, any>): boolean => {
  if (!question.conditional) return true

  const { dependsOn, showWhen, value } = question.conditional
  const dependentResponse = currentResponses[dependsOn]

  if (dependentResponse === undefined) return false

  switch (showWhen) {
    case 'equals':
      return Array.isArray(value) 
        ? value.includes(dependentResponse)
        : dependentResponse === value
    case 'not_equals':
      return Array.isArray(value)
        ? !value.includes(dependentResponse)
        : dependentResponse !== value
    case 'contains':
      return Array.isArray(dependentResponse)
        ? dependentResponse.some((resp: any) => 
            Array.isArray(value) ? value.includes(resp) : resp === value
          )
        : false
    default:
      return true
  }
}

export const getVisibleQuestions = (assessment: Assessment, currentResponses: Record<string, any>): Question[] => {
  const visibleQuestions: Question[] = []

  assessment.sections.forEach(section => {
    section.questions.forEach(question => {
      if (shouldShowQuestion(question, currentResponses)) {
        visibleQuestions.push(question)
      }
    })
  })

  return visibleQuestions
}

export const validateResponse = (question: Question, response: any): { isValid: boolean; error?: string } => {
  if (question.required && (response === undefined || response === '' || response === null)) {
    return { isValid: false, error: 'This field is required' }
  }

  if (!question.validation || response === undefined || response === '') {
    return { isValid: true }
  }

  const { validation } = question

  // Text validation
  if (question.type === 'text' || question.type === 'longtext') {
    const text = String(response)
    
    if (validation.minLength && text.length < validation.minLength) {
      return { isValid: false, error: `Minimum length is ${validation.minLength} characters` }
    }
    
    if (validation.maxLength && text.length > validation.maxLength) {
      return { isValid: false, error: `Maximum length is ${validation.maxLength} characters` }
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(text)) {
      return { isValid: false, error: 'Invalid format' }
    }
  }

  // Numeric validation
  if (question.type === 'numeric') {
    const num = Number(response)
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Must be a valid number' }
    }
    
    if (validation.minValue !== undefined && num < validation.minValue) {
      return { isValid: false, error: `Minimum value is ${validation.minValue}` }
    }
    
    if (validation.maxValue !== undefined && num > validation.maxValue) {
      return { isValid: false, error: `Maximum value is ${validation.maxValue}` }
    }
  }

  // File validation
  if (question.type === 'file') {
    if (!response || !response.name) {
      return { isValid: false, error: 'Please select a file' }
    }
    
    if (validation.allowedExtensions) {
      const fileExt = response.name.split('.').pop()?.toLowerCase()
      if (!validation.allowedExtensions.includes(fileExt || '')) {
        return { isValid: false, error: `Allowed file types: ${validation.allowedExtensions.join(', ')}` }
      }
    }
    
    if (validation.maxFileSize && response.size > validation.maxFileSize) {
      const maxSizeMB = Math.round(validation.maxFileSize / (1024 * 1024))
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }
  }

  // Multiple choice validation
  if (question.type === 'multiple') {
    if (Array.isArray(response)) {
      if (validation.minSelections && response.length < validation.minSelections) {
        return { isValid: false, error: `Please select at least ${validation.minSelections} options` }
      }
      
      if (validation.maxSelections && response.length > validation.maxSelections) {
        return { isValid: false, error: `Please select no more than ${validation.maxSelections} options` }
      }
    }
  }

  return { isValid: true }
}

// Response evaluation helpers
export const useResponseHelpers = () => {
  const { assessments } = useAssessmentStore()

  return {
    shouldShowQuestion,
    validateResponse,
    
    // Get visible questions for current responses
    getVisibleQuestions: (assessmentId: string, currentResponses: Record<string, any>): Question[] => {
      const assessment = Object.values(assessments).find(a => a.id === assessmentId)
      if (!assessment) return []
      return getVisibleQuestions(assessment, currentResponses)
    },

  }
}

// Selectors for optimized subscriptions
export const useAssessmentsData = () => useAssessmentStore(state => state.assessments)
export const useAssessmentResponsesData = () => useAssessmentStore(state => state.responses)
export const useAssessmentsLoading = () => useAssessmentStore(state => state.loading)
export const useAssessmentsError = () => useAssessmentStore(state => state.error)

export const useAssessmentByJobId = (jobId: string) => 
  useAssessmentStore(state => state.assessments[jobId])

export const useResponseById = (responseId: string) => 
  useAssessmentStore(state => state.responses[responseId])

export const useResponsesByCandidate = (candidateId: string) => 
  useAssessmentStore(state => 
    Object.values(state.responses).filter(response => response.candidateId === candidateId)
  )

export const useAssessmentsActions = () => useAssessmentStore(state => ({
  fetchAssessment: state.fetchAssessment,
  updateAssessment: state.updateAssessment,
  submitResponse: state.submitResponse
}))