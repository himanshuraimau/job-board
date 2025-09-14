import React from 'react'
import { Card, CardContent, CardHeader } from './card'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  count?: number
}

// Job Card Skeleton
export const JobCardSkeleton = React.memo<{ className?: string }>(({ className }) => (
  <Card className={cn("animate-pulse", className)}>
    <CardHeader className="pb-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
))

JobCardSkeleton.displayName = 'JobCardSkeleton'

// Job List Skeleton
export const JobListSkeleton = React.memo<SkeletonProps>(({ count = 6, className }) => (
  <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
    {Array.from({ length: count }, (_, i) => (
      <JobCardSkeleton key={`job-skeleton-${i}`} />
    ))}
  </div>
))

JobListSkeleton.displayName = 'JobListSkeleton'

// Job Detail Skeleton
export const JobDetailSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-24" />
      <div className="flex-1" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    
    {/* Main Card */}
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-3/6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Metadata Card */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Candidate Card Skeleton
export const CandidateCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("animate-pulse", className)}>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Candidate List Skeleton  
export const CandidateListSkeleton: React.FC<SkeletonProps> = ({ count = 8, className }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <CandidateCardSkeleton key={i} />
    ))}
  </div>
)

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center justify-between", className)}>
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="flex gap-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
)

// Filter Sidebar Skeleton
export const FilterSidebarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("animate-pulse", className)}>
    <CardHeader>
      <Skeleton className="h-6 w-16" />
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="pt-2">
        <Skeleton className="h-9 w-full" />
      </div>
    </CardContent>
  </Card>
)

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 4, 
  className 
}) => (
  <tr className={cn("animate-pulse", className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

// Form Field Skeleton
export const FormFieldSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-2", className)}>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
  </div>
)

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-primary", sizeClasses[size], className)} />
  )
}

// Full Page Loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground">{message}</p>
  </div>
)
