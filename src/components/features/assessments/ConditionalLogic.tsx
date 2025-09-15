
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { X, Plus, AlertTriangle } from 'lucide-react'
import { useAssessmentHelpers } from '@/stores/assessments'
import type { Question, ConditionalRule } from '@/types'

interface ConditionalLogicProps {
  jobId: string
  sectionId: string
  question: Question
  onChange?: () => void
}

const CONDITION_TYPES = [
  { value: 'equals', label: 'Equals', description: 'Show when the answer equals specific value(s)' },
  { value: 'not_equals', label: 'Not Equals', description: 'Show when the answer does not equal specific value(s)' },
  { value: 'contains', label: 'Contains', description: 'Show when the answer contains specific value(s) (for multiple choice)' }
] as const

export const ConditionalLogic: React.FC<ConditionalLogicProps> = ({
  jobId,
  sectionId,
  question,
  onChange
}) => {
  const [hasConditional, setHasConditional] = useState(!!question.conditional)
  const [selectedDependency, setSelectedDependency] = useState(question.conditional?.dependsOn || '')
  const [conditionType, setConditionType] = useState<ConditionalRule['showWhen']>(
    question.conditional?.showWhen || 'equals'
  )
  const [conditionValues, setConditionValues] = useState<string[]>(
    Array.isArray(question.conditional?.value) 
      ? question.conditional.value 
      : question.conditional?.value 
        ? [String(question.conditional.value)]
        : ['']
  )

  const { updateQuestion, getAvailableQuestions, validateConditionalLogic } = useAssessmentHelpers()

  // Get questions that can be dependencies (appear before this question)
  const availableQuestions = getAvailableQuestions(jobId, question.id)
  const selectedQuestion = availableQuestions.find(q => q.id === selectedDependency)

  // Validate current conditional logic
  const validation = validateConditionalLogic(jobId)

  useEffect(() => {
    if (hasConditional && selectedDependency && conditionType && conditionValues.some(v => v.trim())) {
      const rule: ConditionalRule = {
        dependsOn: selectedDependency,
        showWhen: conditionType,
        value: conditionValues.length === 1 ? conditionValues[0] : conditionValues.filter(v => v.trim())
      }

      updateQuestion(jobId, sectionId, question.id, { conditional: rule })
      onChange?.()
    } else if (!hasConditional) {
      updateQuestion(jobId, sectionId, question.id, { conditional: undefined })
      onChange?.()
    }
  }, [hasConditional, selectedDependency, conditionType, conditionValues, jobId, sectionId, question.id, updateQuestion, onChange])

  const handleToggleConditional = (enabled: boolean) => {
    setHasConditional(enabled)
    if (!enabled) {
      setSelectedDependency('')
      setConditionType('equals')
      setConditionValues([''])
    }
  }

  const handleDependencyChange = (questionId: string) => {
    setSelectedDependency(questionId)
    // Reset condition values when dependency changes
    setConditionValues([''])
  }

  const handleConditionTypeChange = (type: ConditionalRule['showWhen']) => {
    setConditionType(type)
    // Reset values when condition type changes
    setConditionValues([''])
  }

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...conditionValues]
    newValues[index] = value
    setConditionValues(newValues)
  }

  const handleAddValue = () => {
    setConditionValues([...conditionValues, ''])
  }

  const handleRemoveValue = (index: number) => {
    if (conditionValues.length > 1) {
      setConditionValues(conditionValues.filter((_, i) => i !== index))
    }
  }

  const getValueInputPlaceholder = () => {
    if (!selectedQuestion) return 'Enter value'
    
    switch (selectedQuestion.type) {
      case 'single':
      case 'multiple':
        return 'Select from options or enter custom value'
      case 'numeric':
        return 'Enter number'
      case 'text':
      case 'longtext':
        return 'Enter text value'
      default:
        return 'Enter value'
    }
  }

  const renderValueInput = (value: string, index: number) => {
    if (selectedQuestion?.type === 'single' || selectedQuestion?.type === 'multiple') {
      // For choice questions, provide dropdown with options
      return (
        <div className="flex gap-2">
          <Select value={value} onValueChange={(newValue) => handleValueChange(index, newValue)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {selectedQuestion.options?.map((option, optIndex) => (
                <SelectItem key={optIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {conditionValues.length > 1 && (
            <Button
              onClick={() => handleRemoveValue(index)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }

    // For other question types, use text input
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleValueChange(index, e.target.value)}
          placeholder={getValueInputPlaceholder()}
          type={selectedQuestion?.type === 'numeric' ? 'number' : 'text'}
          className="flex-1"
        />
        {conditionValues.length > 1 && (
          <Button
            onClick={() => handleRemoveValue(index)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Conditional Logic</CardTitle>
            <p className="text-sm text-gray-600">
              Control when this question is shown based on previous answers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="conditional-enabled"
              checked={hasConditional}
              onCheckedChange={handleToggleConditional}
            />
            <Label htmlFor="conditional-enabled">Enable</Label>
          </div>
        </div>
      </CardHeader>

      {hasConditional && (
        <CardContent className="space-y-4">
          {availableQuestions.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  No previous questions available. Add questions before this one to create dependencies.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Dependency Selection */}
              <div>
                <Label>Depends on Question</Label>
                <Select value={selectedDependency} onValueChange={handleDependencyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {q.type}
                          </Badge>
                          <span className="truncate">{q.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedQuestion && (
                  <p className="text-xs text-gray-500 mt-1">
                    Question type: {selectedQuestion.type}
                    {selectedQuestion.options && ` • ${selectedQuestion.options.length} options`}
                  </p>
                )}
              </div>

              {/* Condition Type */}
              {selectedDependency && (
                <div>
                  <Label>Condition</Label>
                  <Select value={conditionType} onValueChange={handleConditionTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Condition Values */}
              {selectedDependency && conditionType && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Values</Label>
                    {(conditionType === 'equals' || conditionType === 'not_equals') && (
                      <Button
                        onClick={handleAddValue}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Value
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {conditionValues.map((value, index) => (
                      <div key={index}>
                        {renderValueInput(value, index)}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    {conditionType === 'equals' && 'Question will show when the answer equals any of these values'}
                    {conditionType === 'not_equals' && 'Question will show when the answer does not equal any of these values'}
                    {conditionType === 'contains' && 'Question will show when the answer contains any of these values (for multiple choice questions)'}
                  </div>
                </div>
              )}

              {/* Preview */}
              {selectedDependency && conditionType && conditionValues.some(v => v.trim()) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> This question will be shown when "
                    {selectedQuestion?.title}" {conditionType.replace('_', ' ')} "
                    {conditionValues.filter(v => v.trim()).join('" or "')}".
                  </p>
                </div>
              )}

              {/* Validation Errors */}
              {!validation.isValid && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-800">Validation Errors</p>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}