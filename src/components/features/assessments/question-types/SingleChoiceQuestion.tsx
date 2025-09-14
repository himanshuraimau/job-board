import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Question } from '@/types'

interface SingleChoiceQuestionProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Badge variant="outline" className="text-xs">
            Single Choice
          </Badge>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            No options configured for this question.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          Single Choice
        </Badge>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={error ? 'border border-red-500 rounded-md p-2' : ''}
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option} 
              id={`${question.id}-${index}`}
              disabled={disabled}
            />
            <Label 
              htmlFor={`${question.id}-${index}`}
              className={`cursor-pointer ${disabled ? 'opacity-50' : ''}`}
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        Select one option
      </div>
    </div>
  )
}