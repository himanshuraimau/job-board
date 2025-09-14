import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { AssessmentBuilder } from '@/components/features/assessments'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useJobQuery } from '@/hooks/useJobsQuery'
import type { Assessment } from '@/types'

export function AssessmentPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  
  // Get job data for context
  const { data: job, isLoading: jobLoading, error: jobError } = useJobQuery(jobId || '')

  const handleBack = () => {
    navigate('/jobs')
  }

  const handlePreview = (assessment: Assessment) => {
    // Could open preview modal or navigate to preview page
    console.log('Preview assessment:', assessment)
  }

  const handleSave = (assessment: Assessment) => {
    // The AssessmentBuilder handles saving internally
    console.log('Assessment saved:', assessment)
  }

  if (!jobId) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-destructive">Invalid Job ID</h1>
          <p className="text-muted-foreground mt-2">The job ID provided is not valid.</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </PageContainer>
    )
  }

  if (jobError) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-destructive">Error Loading Job</h1>
          <p className="text-muted-foreground mt-2">
            {jobError instanceof Error ? jobError.message : 'Failed to load job details'}
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </PageContainer>
    )
  }

  if (jobLoading) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3 mx-auto" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Assessment Builder</h1>
              <p className="text-muted-foreground">
                {job?.title ? `Assessment for ${job.title}` : 'Build and preview assessments'}
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Content - Using existing AssessmentBuilder component */}
        <AssessmentBuilder
          jobId={jobId}
          onPreview={handlePreview}
          onSave={handleSave}
        />
      </div>
    </PageContainer>
  )
}