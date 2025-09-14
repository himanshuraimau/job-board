import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Archive, ArchiveRestore, Calendar, Tag } from 'lucide-react'
import { useJobQuery, useUpdateJobMutation } from '@/hooks/useJobsQuery'
import { JobDetailSkeleton } from '@/components/ui/skeletons'
import { JobForm } from '@/components/features/jobs'
import { formatDateSafe } from '@/lib/utils'

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)
  
  const { 
    data: job, 
    isLoading, 
    error,
    refetch 
  } = useJobQuery(jobId || '', !!jobId)
  
  const updateJobMutation = useUpdateJobMutation()

  const handleEdit = () => {
    setShowEditForm(true)
  }

  const handleFormSubmit = async (data: any) => {
    if (!job) return
    
    try {
      await updateJobMutation.mutateAsync({ 
        id: job.id, 
        updates: data 
      })
      setShowEditForm(false)
    } catch (error) {
      // Error is already handled by the mutation and will show in toast
      throw error
    }
  }

  const handleFormClose = () => {
    setShowEditForm(false)
  }

  const handleArchive = async () => {
    if (!job) return

    const newStatus = job.status === 'active' ? 'archived' : 'active'
    try {
      await updateJobMutation.mutateAsync({ 
        id: job.id, 
        updates: { status: newStatus } 
      })
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const handleBack = () => {
    navigate('/jobs')
  }

  if (!jobId) {
    return (
      <AppLayout>
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
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <PageContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-destructive">Error Loading Job</h1>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Failed to load job details'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    )
  }

  if (isLoading || !job) {
    return (
      <AppLayout>
        <PageContainer>
          <JobDetailSkeleton />
        </PageContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </Button>
              
              <Button 
                variant={job.status === 'active' ? 'outline' : 'default'}
                size="sm" 
                onClick={handleArchive}
              >
                {job.status === 'active' ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{job.title}</CardTitle>
                    <p className="text-muted-foreground">/{job.slug}</p>
                  </div>
                  
                  <Badge 
                    variant={job.status === 'active' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {job.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>

            {job.description && (
              <>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      {job.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateSafe(job.createdAt, 'PPP')}
                      </p>
                    </div>
                  </div>

                  {job.updatedAt && (() => {
                    try {
                      const updated = new Date(job.updatedAt)
                      const created = new Date(job.createdAt)
                      return !isNaN(updated.getTime()) && !isNaN(created.getTime()) && updated.getTime() !== created.getTime()
                    } catch {
                      return false
                    }
                  })() && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateSafe(job.updatedAt, 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Job ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{job.id}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">URL Slug</p>
                    <p className="text-sm text-muted-foreground font-mono">/{job.slug}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Display Order</p>
                    <p className="text-sm text-muted-foreground">{job.order}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TODO: Add sections for candidates and assessments once those features are integrated with routing */}
        </div>

        {/* Edit Job Form Modal */}
        <JobForm
          open={showEditForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          job={job}
          loading={updateJobMutation.isPending}
        />
      </PageContainer>
    </AppLayout>
  )
}
