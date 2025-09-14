import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useResponseHelpers } from '@/stores/assessments'
import { QuestionRenderer } from './QuestionRenderer'
import type { Assessment, Question } from '@/types'

interface QuestionPreviewProps {
  assessment: Assessment
  showFullPreview?: boolean
  onToggleFullPreview?: () => void
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  assessment,
  showFullPreview = false,
  onToggleFullPreview
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const { shouldShowQuestion, validateResponse } = useResponseHelpers()

  // Reset responses when assessment changes
  useEffect(() => {
    setResponses({})
    setValidationErrors({})
  }, [assessment.id])

  const handleResponseChange = (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      const newErrors = { ...validationErrors }
      delete newErrors[questionId]
      setValidationErrors(newErrors)
    }
  }

  const validateAllResponses = () => {
    const errors: Record<string, string> = {}
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (shouldShowQuestion(assessment.id, question, responses)) {
          const validation = validateResponse(question, responses[question.id])
          if (!validation.isValid && validation.error) {
            errors[question.id] = validation.error
          }
        }
      })
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetPreview = () => {
    setResponses({})
    setValidationErrors({})
  }

  const visibleQuestions = assessment.sections.flatMap(section =>
    section.questions.filter(question => 
      shouldShowQuestion(assessment.id, question, responses)
    )
  )

  const totalQuestions = assessment.sections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.keys(responses).filter(key => {
    const value = responses[key]
    return value !== undefined && value !== '' && value !== null
  }).length

  if (showFullPreview) {
    return (
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Assessment Preview</CardTitle>
            <p className="text-sm text-gray-600">
              {answeredQuestions} of {visibleQuestions.length} questions answered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={resetPreview}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            {onToggleFullPreview && (
              <Button
                onClick={onToggleFullPreview}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Hide Preview
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 max-h-96 overflow-y-auto">
          {assessment.description && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{assessment.description}</p>
            </div>
          )}

          {assessment.sections.map(section => {
            const sectionQuestions = section.questions.filter(question =>
              shouldShowQuestion(assessment.id, question, responses)
            )

            if (sectionQuestions.length === 0) return null

            return (
              <div key={section.id} className="space-y-4">
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>

                <div className="space-y-4 ml-4">
                  {sectionQuestions.map(question => (
                    <div key={question.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start gap-2 mb-2">
                        {question.conditional && (
                          <Badge variant="outline" className="text-xs">
                            Conditional
                          </Badge>
                        )}
                      </div>
                      
                      <QuestionRenderer
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                        error={validationErrors[question.id]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {visibleQuestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No questions to display. Add some questions to see the preview.</p>
            </div>
          )}

          {visibleQuestions.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                onClick={validateAllResponses}
                className="w-full"
                disabled={answeredQuestions === 0}
              >
                Validate Responses
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Compact preview mode
  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <p className="text-sm text-gray-600">
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} • {assessment.sections.length} section{assessment.sections.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onToggleFullPreview && (
          <Button
            onClick={onToggleFullPreview}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Full Preview
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{assessment.title}</h3>
            {assessment.description && (
              <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
            )}
          </div>

          {assessment.sections.map(section => (
            <div key={section.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{section.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              {section.description && (
                <p className="text-xs text-gray-600 mt-1">{section.description}</p>
              )}
              
              <div className="mt-2 space-y-1">
                {section.questions.slice(0, 3).map(question => (
                  <div key={question.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="truncate">{question.title}</span>
                    {question.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
                {section.questions.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{section.questions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>
          ))}

          {assessment.sections.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No sections added yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}