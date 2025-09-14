import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, File, X, Check } from 'lucide-react'
import type { Question } from '@/types'

interface FileUploadQuestionProps {
  question: Question
  value?: File
  onChange: (value: File | undefined) => void
  error?: string
  disabled?: boolean
  acceptedTypes?: string[]
  maxSizeBytes?: number
}

export const FileUploadQuestion: React.FC<FileUploadQuestionProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false,
  acceptedTypes = ['*/*'],
  maxSizeBytes = 10 * 1024 * 1024 // 10MB default
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSizeBytes)})`
    }

    // Check file type if specific types are required
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const fileType = file.type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      const isTypeAllowed = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return type.toLowerCase() === fileExtension
        }
        return fileType.match(type.replace('*', '.*'))
      })

      if (!isTypeAllowed) {
        return `File type not allowed. Accepted types: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    setUploadError('')
    
    const validationError = validateFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    onChange(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    onChange(undefined)
    setUploadError('')
  }

  const displayError = error || uploadError

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          File Upload
        </Badge>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}

      {!value ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${displayError ? 'border-red-500 bg-red-50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Drop your file here, or click to browse
            </p>
            <Input
              type="file"
              onChange={handleFileChange}
              disabled={disabled}
              accept={acceptedTypes.join(',')}
              className="hidden"
              id={`file-${question.id}`}
            />
            <Label
              htmlFor={`file-${question.id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Choose File
            </Label>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <File className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">{value.name}</p>
                <p className="text-xs text-green-700">
                  {formatFileSize(value.size)} • {value.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Maximum file size: {formatFileSize(maxSizeBytes)}</p>
        {acceptedTypes.length > 0 && !acceptedTypes.includes('*/*') && (
          <p>Accepted file types: {acceptedTypes.join(', ')}</p>
        )}
      </div>
      
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
    </div>
  )
}