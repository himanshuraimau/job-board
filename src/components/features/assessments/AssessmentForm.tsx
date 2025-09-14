import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAssessmentStore, useResponseHelpers } from '@/stores/assessments'
import { QuestionRenderer } from './QuestionRenderer'
import type { Assessment, Question, QuestionResponse } from '@/types'

interface AssessmentFormProps {
  assessmentId: string
  candidateId: string
  onSubmit?: (responses: QuestionResponse[]) => void
  onSave?: (responses: QuestionResponse[]) => void
  readOnly?: boolean
  showProgress?: boolean
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessmentId,
  candidateId,
  onSubmit,
  onSave,
  readOnly = false,
  showProgress = true
}) => {
  const assessment = useAssessmentStore(state => 
    Object.values(state.assessments).find(a => a.id === assessmentId)
  )
  const loading = useAssessmentStore(state => state.loading)
  const error = useAssessmentStore(state => state.error)
  const { submitResponse } = useAssessmentStore()

  const [responses, setResponses] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentSectionIndex, setSectionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { shouldShowQuestion, validateResponse, getVisibleQuestions } = useResponseHelpers()

  // Load existing responses if any
  useEffect(() => {
    // In a real app, you'd load existing responses from the store
    // For now, we'll start with empty responses
  }, [assessmentId, candidateId])

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && onSave) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [responses, hasUnsavedChanges, onSave])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-red-800">
            {error || 'Assessment not found'}
          </p>
        </div>
      </div>
    )
  }

  const handleResponseChange = (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)
    setHasUnsavedChanges(true)

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      const newErrors = { ...validationErrors }
      delete newErrors[questionId]
      setValidationErrors(newErrors)
    }
  }

  const validateCurrentSection = (): boolean => {
    const currentSection = assessment.sections[currentSectionIndex]
    if (!currentSection) return true

    const errors: Record<string, string> = {}
    let hasErrors = false

    currentSection.questions.forEach(question => {
      if (shouldShowQuestion(assessmentId, question, responses)) {
        const validation = validateResponse(question, responses[question.id])
        if (!validation.isValid && validation.error) {
          errors[question.id] = validation.error
          hasErrors = true
        }
      }
    })

    setValidationErrors(prev => ({ ...prev, ...errors }))
    return !hasErrors
  }

  const validateAllResponses = (): boolean => {
    const errors: Record<string, string> = {}
    let hasErrors = false

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (shouldShowQuestion(assessmentId, question, responses)) {
          const validation = validateResponse(question, responses[question.id])
          if (!validation.isValid && validation.error) {
            errors[question.id] = validation.error
            hasErrors = true
          }
        }
      })
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSave = async () => {
    if (!onSave) return

    const questionResponses: QuestionResponse[] = Object.entries(responses)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      .map(([questionId, value]) => ({
        questionId,
        value
      }))

    await onSave(questionResponses)
    setHasUnsavedChanges(false)
  }

  const handleNextSection = () => {
    if (validateCurrentSection() && currentSectionIndex < assessment.sections.length - 1) {
      setSectionIndex(currentSectionIndex + 1)
    }
  }

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setSectionIndex(currentSectionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateAllResponses()) {
      // Scroll to first error or show error summary
      return
    }

    setIsSubmitting(true)

    try {
      const questionResponses: QuestionResponse[] = Object.entries(responses)
        .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
        .map(([questionId, value]) => ({
          questionId,
          value
        }))

      if (onSubmit) {
        await onSubmit(questionResponses)
      } else {
        // Default submission to store
        await submitResponse({
          assessmentId,
          candidateId,
          responses: questionResponses
        })
      }

      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate progress
  const allQuestions = assessment.sections.flatMap(section => section.questions)
  const visibleQuestions = getVisibleQuestions(assessmentId, responses)
  const answeredQuestions = visibleQuestions.filter(question => {
    const value = responses[question.id]
    return value !== undefined && value !== '' && value !== null
  })
  const progressPercentage = visibleQuestions.length > 0 
    ? Math.round((answeredQuestions.length / visibleQuestions.length) * 100)
    : 0

  const currentSection = assessment.sections[currentSectionIndex]
  const currentSectionQuestions = currentSection?.questions.filter(question =>
    shouldShowQuestion(assessmentId, question, responses)
  ) || []

  const isLastSection = currentSectionIndex === assessment.sections.length - 1
  const canProceed = currentSectionQuestions.every(question => {
    if (!question.required) return true
    const value = responses[question.id]
    return value !== undefined && value !== '' && value !== null
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-gray-600">{assessment.description}</p>
        )}
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{answeredQuestions.length} of {visibleQuestions.length} questions answered</span>
              <span>{progressPercentage}% complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}
      </div>

      {/* Section Navigation */}
      {assessment.sections.length > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {assessment.sections.map((section, index) => (
            <Button
              key={section.id}
              variant={index === currentSectionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setSectionIndex(index)}
              disabled={readOnly}
            >
              {index + 1}. {section.title}
            </Button>
          ))}
        </div>
      )}

      {/* Current Section */}
      {currentSection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentSection.title}
                  <Badge variant="secondary">
                    Section {currentSectionIndex + 1} of {assessment.sections.length}
                  </Badge>
                </CardTitle>
                {currentSection.description && (
                  <p className="text-sm text-gray-600 mt-1">{currentSection.description}</p>
                )}
              </div>
              
              {hasUnsavedChanges && !readOnly && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentSectionQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions to display in this section.</p>
              </div>
            ) : (
              currentSectionQuestions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <QuestionRenderer
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                        error={validationErrors[question.id]}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePreviousSection}
          variant="outline"
          disabled={currentSectionIndex === 0 || readOnly}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {onSave && !readOnly && (
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={!hasUnsavedChanges}
            >
              Save Progress
            </Button>
          )}

          {isLastSection ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting || readOnly}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextSection}
              disabled={!canProceed || readOnly}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="font-medium text-red-800">Please fix the following errors:</p>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(validationErrors).map(([questionId, error]) => {
                const question = allQuestions.find(q => q.id === questionId)
                return (
                  <li key={questionId}>
                    <strong>{question?.title}:</strong> {error}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}