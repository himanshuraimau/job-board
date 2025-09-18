import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Trash2, Plus, X, Settings, Zap } from 'lucide-react'
import { useAssessmentHelpers } from '@/stores/assessments'
import { ConditionalLogic } from './ConditionalLogic'
import type { Question, ValidationRule } from '@/types'

interface QuestionEditorProps {
  jobId: string
  sectionId: string
  question: Question
  onChange?: () => void
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'longtext', label: 'Long Text' },
  { value: 'single', label: 'Single Choice' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'numeric', label: 'Number' },
  { value: 'file', label: 'File Upload' }
] as const

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  jobId,
  sectionId,
  question,
  onChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description || '')
  const [required, setRequired] = useState(question.required)
  const [options, setOptions] = useState(question.options || [])
  const [validation, setValidation] = useState<ValidationRule>(question.validation || {})
  const [showValidation, setShowValidation] = useState(false)
  const [showConditional, setShowConditional] = useState(false)

  const { updateQuestion, deleteQuestion } = useAssessmentHelpers()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    updateQuestion(jobId, sectionId, question.id, { title: newTitle })
    onChange?.()
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription)
    updateQuestion(jobId, sectionId, question.id, { description: newDescription })
    onChange?.()
  }

  const handleTypeChange = (newType: Question['type']) => {
    const updates: Partial<Question> = { type: newType }
    
    // Clear options if switching away from choice types
    if (newType !== 'single' && newType !== 'multiple') {
      updates.options = undefined
      setOptions([])
    }
    
    // Clear validation if switching to file type
    if (newType === 'file') {
      updates.validation = undefined
      setValidation({})
    }

    updateQuestion(jobId, sectionId, question.id, updates)
    onChange?.()
  }

  const handleRequiredChange = (newRequired: boolean) => {
    setRequired(newRequired)
    updateQuestion(jobId, sectionId, question.id, { required: newRequired })
    onChange?.()
  }

  const handleDeleteQuestion = () => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(jobId, sectionId, question.id)
      onChange?.()
    }
  }

  const handleAddOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`]
    setOptions(newOptions)
    updateQuestion(jobId, sectionId, question.id, { options: newOptions })
    onChange?.()
  }

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    updateQuestion(jobId, sectionId, question.id, { options: newOptions })
    onChange?.()
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    updateQuestion(jobId, sectionId, question.id, { options: newOptions })
    onChange?.()
  }

    const handleValidationChange = (field: keyof ValidationRule, value: string | number) => {
    const newValidation = { ...validation, [field]: value }
    // Clean up undefined/empty values
    Object.keys(newValidation).forEach(key => {
      if (newValidation[key as keyof ValidationRule] === undefined || newValidation[key as keyof ValidationRule] === '') {
        delete newValidation[key as keyof ValidationRule]
      }
    })
    setValidation(newValidation)
    updateQuestion(jobId, sectionId, question.id, { 
      validation: Object.keys(newValidation).length > 0 ? newValidation : undefined 
    })
    onChange?.()
  }

  const handleQuestionChange = () => {
    onChange?.()
  }

  const needsOptions = question.type === 'single' || question.type === 'multiple'
  const canHaveValidation = question.type !== 'file'

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-2 border-l-gray-300">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                </Badge>
                {required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {question.conditional && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Conditional
                  </Badge>
                )}
              </div>
              
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-medium border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Question title"
              />
              
              <Textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Question description (optional)"
                className="text-sm border-none p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDeleteQuestion}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* Question Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={question.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id={`required-${question.id}`}
                  checked={required}
                  onCheckedChange={handleRequiredChange}
                />
                <Label htmlFor={`required-${question.id}`}>Required</Label>
              </div>
            </div>

            {/* Options for choice questions */}
            {needsOptions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options</Label>
                  <Button
                    onClick={handleAddOption}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        onClick={() => handleRemoveOption(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {options.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No options added yet. Click "Add Option" to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Validation Rules */}
            {canHaveValidation && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Validation Rules</Label>
                  <Button
                    onClick={() => setShowValidation(!showValidation)}
                    variant="outline"
                    size="sm"
                  >
                    {showValidation ? 'Hide' : 'Show'} Validation
                  </Button>
                </div>

                {showValidation && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                    {(question.type === 'text' || question.type === 'longtext') && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Min Length</Label>
                            <Input
                              type="number"
                              value={validation.minLength || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                handleValidationChange('minLength', isNaN(value) ? 0 : value)
                              }}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Max Length</Label>
                            <Input
                              type="number"
                              value={validation.maxLength || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                handleValidationChange('maxLength', isNaN(value) ? 0 : value)
                              }}
                              placeholder="No limit"
                              min="1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Pattern (Regex)</Label>
                          <Input
                            value={validation.pattern || ''}
                            onChange={(e) => handleValidationChange('pattern', e.target.value)}
                            placeholder="e.g., ^[A-Za-z]+$"
                          />
                        </div>
                      </>
                    )}

                    {question.type === 'numeric' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Min Value</Label>
                          <Input
                            type="number"
                            value={validation.minValue || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value)
                              handleValidationChange('minValue', isNaN(value) ? 0 : value)
                            }}
                            placeholder="No minimum"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max Value</Label>
                          <Input
                            type="number"
                            value={validation.maxValue || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value)
                              handleValidationChange('maxValue', isNaN(value) ? 0 : value)
                            }}
                            placeholder="No maximum"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Conditional Logic */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditional Logic</Label>
                <Button
                  onClick={() => setShowConditional(!showConditional)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-3 w-3" />
                  {showConditional ? 'Hide' : 'Show'} Logic
                </Button>
              </div>

              {showConditional && (
                <ConditionalLogic
                  jobId={jobId}
                  sectionId={sectionId}
                  question={question}
                  onChange={handleQuestionChange}
                />
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}