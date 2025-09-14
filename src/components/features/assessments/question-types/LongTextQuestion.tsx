import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Question } from '@/types'

interface LongTextQuestionProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export const LongTextQuestion: React.FC<LongTextQuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  const { validation } = question
  const currentLength = value.length

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={question.id} className="font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          Long Text
        </Badge>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      
      <div className="space-y-1">
        <Textarea
          id={question.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your detailed answer"
          className={error ? 'border-red-500' : ''}
          rows={4}
          minLength={validation?.minLength}
          maxLength={validation?.maxLength}
        />
        
        {validation?.maxLength && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {currentLength} / {validation.maxLength} characters
            </span>
            {currentLength > validation.maxLength && (
              <span className="text-red-500">
                Exceeds maximum length
              </span>
            )}
          </div>
        )}
      </div>
      
      {validation && (
        <div className="text-xs text-gray-500 space-y-1">
          {validation.minLength && (
            <p>Minimum length: {validation.minLength} characters</p>
          )}
          {validation.pattern && (
            <p>Must match pattern: {validation.pattern}</p>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}