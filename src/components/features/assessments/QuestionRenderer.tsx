import React from 'react'
import {
  TextQuestion,
  LongTextQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  NumericQuestion,
  FileUploadQuestion
} from './question-types'
import type { Question } from '@/types'

interface QuestionRendererProps {
  question: Question
  value?: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false
}) => {
  switch (question.type) {
    case 'text':
      return (
        <TextQuestion
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'longtext':
      return (
        <LongTextQuestion
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'single':
      return (
        <SingleChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'multiple':
      return (
        <MultipleChoiceQuestion
          question={question}
          value={value || []}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'numeric':
      return (
        <NumericQuestion
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'file':
      return (
        <FileUploadQuestion
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Unsupported question type: {question.type}
          </p>
        </div>
      )
  }
}