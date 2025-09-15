import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TagInput } from '@/components/forms/TagInput'
import { FormField } from '@/components/forms/FormField'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { useJobsData } from '@/stores/jobs'
import type { Job } from '@/types'

// Validation schema
const jobFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .refine(val => val.trim().length > 0, 'Title cannot be just whitespace'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Slug cannot start or end with a hyphen')
    .refine(val => !val.includes('--'), 'Slug cannot contain consecutive hyphens'),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'archived']),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .refine(tags => tags.every(tag => tag.trim().length > 0), 'Tags cannot be empty')
})

type JobFormData = z.infer<typeof jobFormSchema>

interface JobFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: JobFormData) => Promise<void>
  job?: Job // For editing
  loading?: boolean
}

export const JobForm: React.FC<JobFormProps> = ({
  open,
  onClose,
  onSubmit,
  job,
  loading = false
}) => {
  const isEditing = Boolean(job)
  const existingJobs = useJobsData()
  const [slugError, setSlugError] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      description: job?.description || '',
      status: job?.status || 'active',
      tags: job?.tags || []
    }
  })

  const watchedTitle = watch('title')
  const watchedSlug = watch('slug')
  const watchedTags = watch('tags')

  // Auto-generate slug from title
  React.useEffect(() => {
    if (!isEditing && watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', slug)
    }
  }, [watchedTitle, isEditing, setValue])

  // Validate slug uniqueness
  useEffect(() => {
    if (watchedSlug && open) {
      const slugExists = existingJobs.some(existingJob => 
        existingJob.slug === watchedSlug && existingJob.id !== job?.id
      )
      
      if (slugExists) {
        setSlugError('This slug is already taken')
        setError('slug', { type: 'manual', message: 'This slug is already taken' })
      } else {
        setSlugError('')
        clearErrors('slug')
      }
    }
  }, [watchedSlug, existingJobs, job?.id, open, setError, clearErrors])

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        title: job?.title || '',
        slug: job?.slug || '',
        description: job?.description || '',
        status: job?.status || 'active',
        tags: job?.tags || []
      })
    }
  }, [open, job, reset])

  const handleFormSubmit = async (data: JobFormData) => {
    // Additional validation before submission
    if (slugError) {
      return // Don't submit if there's a slug error
    }

    // Check for required title
    if (!data.title.trim()) {
      setError('title', { type: 'manual', message: 'Title is required' })
      return
    }

    try {
      await onSubmit(data)
      onClose()
      setSlugError('') // Clear any errors on successful submission
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error)
    }
  }

  const handleTagsChange = (tags: string[]) => {
    setValue('tags', tags)
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove)
    setValue('tags', newTags)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the job information below.'
              : 'Fill in the details to create a new job posting.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Title Field */}
            <FormField 
              label="Job Title" 
              error={errors.title?.message}
              required
            >
              <Input
                {...register('title')}
                placeholder="e.g. Senior Frontend Developer"
                disabled={isSubmitting || loading}
              />
            </FormField>

            {/* Slug Field */}
            <FormField 
              label="Slug" 
              error={errors.slug?.message}
              helpText="Used in the URL. Only lowercase letters, numbers, and hyphens allowed."
              required
            >
              <Input
                {...register('slug')}
                placeholder="e.g. senior-frontend-developer"
                disabled={isSubmitting || loading}
              />
            </FormField>

            {/* Status Field */}
            <FormField 
              label="Status" 
              error={errors.status?.message}
            >
              <Select
                value={watch('status')}
                onValueChange={(value: 'active' | 'archived') => setValue('status', value)}
                disabled={isSubmitting || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Description Field */}
            <FormField 
              label="Description" 
              error={errors.description?.message}
              helpText="Optional job description (max 5000 characters)"
            >
              <Textarea
                {...register('description')}
                placeholder="Describe the role, requirements, and responsibilities..."
                rows={4}
                disabled={isSubmitting || loading}
              />
            </FormField>

            {/* Tags Field */}
            <FormField 
              label="Tags" 
              error={errors.tags?.message}
              helpText="Add relevant tags (max 10 tags)"
            >
              <div className="space-y-2">
                <TagInput
                  value={watchedTags}
                  onChange={handleTagsChange}
                  placeholder="Add a tag and press Enter"
                  disabled={isSubmitting || loading}
                  maxTags={10}
                />
                
                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={isSubmitting || loading}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
            >
              {(isSubmitting || loading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
