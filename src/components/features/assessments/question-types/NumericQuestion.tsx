import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Question } from '@/types'

interface NumericQuestionProps {
  question: Question
  value?: number
  onChange: (value: number | undefined) => void
  error?: string
  disabled?: boolean
}

export const NumericQuestion: React.FC<NumericQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const { validation } = question

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(undefined)
    } else {
      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        onChange(numValue)
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={question.id} className="font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          Number
        </Badge>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      
      <Input
        id={question.id}
        type="number"
        value={value !== undefined ? value.toString() : ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Enter a number"
        className={error ? 'border-red-500' : ''}
        min={validation?.minValue}
        max={validation?.maxValue}
        step="any"
      />
      
      {validation && (
        <div className="text-xs text-gray-500 space-y-1">
          {validation.minValue !== undefined && (
            <p>Minimum value: {validation.minValue}</p>
          )}
          {validation.maxValue !== undefined && (
            <p>Maximum value: {validation.maxValue}</p>
          )}
          {validation.minValue !== undefined && validation.maxValue !== undefined && (
            <p>Range: {validation.minValue} - {validation.maxValue}</p>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {value !== undefined && validation && (
        <div className="text-xs">
          {validation.minValue !== undefined && value < validation.minValue && (
            <span className="text-red-500">Below minimum value</span>
          )}
          {validation.maxValue !== undefined && value > validation.maxValue && (
            <span className="text-red-500">Above maximum value</span>
          )}
          {validation.minValue !== undefined && validation.maxValue !== undefined && 
           value >= validation.minValue && value <= validation.maxValue && (
            <span className="text-green-600">Within valid range</span>
          )}
        </div>
      )}
    </div>
  )
}