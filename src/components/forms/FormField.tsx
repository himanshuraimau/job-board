import { cloneElement, isValidElement } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  children: React.ReactNode
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  id?: string
}

export function FormField({
  children,
  label,
  description,
  error,
  required = false,
  className,
  id
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div className="relative">
        {isValidElement(children) && cloneElement(children, {
          id: fieldId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined,
          className: cn(
            (children.props as any)?.className,
            error && 'border-destructive focus-visible:ring-destructive'
          )
        } as any)}
      </div>
      
      {error && (
        <p 
          id={`${fieldId}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {description && error && (
        <p 
          id={`${fieldId}-description`}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
    </div>
  )
}