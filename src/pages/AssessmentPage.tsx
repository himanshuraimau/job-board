import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { AssessmentBuilder } from '@/components/features/assessments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react'
import { useAssessmentStore } from '@/stores/assessments'
import { useJobQuery } from '@/hooks/useJobsQuery'
import type { Assessment, Section, Question } from '@/types'

export function AssessmentPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Get job data for context
  const { data: job, isLoading: jobLoading, error: jobError } = useJobQuery(jobId || '')
  
  // Assessment store
  const {
    assessments,
    loading: assessmentLoading,
    error: assessmentError,
    fetchAssessment,
    updateAssessment
  } = useAssessmentStore()

  const currentAssessment = jobId ? assessments[jobId] : null

  useEffect(() => {
    if (jobId) {
      fetchAssessment(jobId)
    }
  }, [jobId, fetchAssessment])

  const handleBack = () => {
    navigate('/jobs')
  }

  const handleSaveAssessment = async (assessment: Assessment) => {
    if (!jobId) return
    
    try {
      await updateAssessment(jobId, assessment)
      // You could show a success message here
    } catch (error) {
      console.error('Failed to save assessment:', error)
      // You could show an error message here
    }
  }

  const handleAddSection = () => {
    if (!currentAssessment || !jobId) return

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      questions: [],
      order: currentAssessment.sections.length + 1
    }

    const updatedAssessment: Assessment = {
      ...currentAssessment,
      sections: [...currentAssessment.sections, newSection],
      updatedAt: new Date()
    }

    handleSaveAssessment(updatedAssessment)
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

  if (jobError || assessmentError) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-destructive">Error Loading Assessment</h1>
          <p className="text-muted-foreground mt-2">
            {jobError || assessmentError}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => fetchAssessment(jobId)} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (jobLoading || assessmentLoading) {
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
          
          <div className="flex items-center gap-2">
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            
            {!isPreviewMode && (
              <Button onClick={handleAddSection}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            )}
          </div>
        </div>

        {/* Assessment Content */}
        {currentAssessment ? (
          <AssessmentBuilder
            assessment={currentAssessment}
            onSave={handleSaveAssessment}
            isPreviewMode={isPreviewMode}
            job={job}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Assessment Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                There is no assessment created for this job yet. Create one to get started.
              </p>
              <Button onClick={handleAddSection}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
