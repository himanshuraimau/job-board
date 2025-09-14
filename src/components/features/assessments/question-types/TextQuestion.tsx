import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Question } from '@/types'

interface TextQuestionProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  const { validation } = question

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={question.id} className="font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          Text
        </Badge>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      
      <Input
        id={question.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your answer"
        className={error ? 'border-red-500' : ''}
        minLength={validation?.minLength}
        maxLength={validation?.maxLength}
        pattern={validation?.pattern}
      />
      
      {validation && (
        <div className="text-xs text-gray-500 space-y-1">
          {validation.minLength && (
            <p>Minimum length: {validation.minLength} characters</p>
          )}
          {validation.maxLength && (
            <p>Maximum length: {validation.maxLength} characters</p>
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