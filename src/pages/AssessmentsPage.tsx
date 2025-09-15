import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/forms/SearchInput'
import { useJobsData, useJobsLoading, useJobStore } from '@/stores/jobs'
import { FileText, Plus, Eye, Edit } from 'lucide-react'
import type { Job } from '@/types'

export function AssessmentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Store selectors  
  const jobs = useJobsData()
  const loading = useJobsLoading()
  const fetchJobs = useJobStore(state => state.fetchJobs)

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateAssessment = (jobId: string) => {
    navigate(`/assessments/${jobId}`)
  }

  const handleViewAssessment = (jobId: string) => {
    navigate(`/assessments/${jobId}`)
  }

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`)
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Center</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage assessments for your job positions
            </p>
          </div>
          <Button onClick={() => navigate('/jobs')} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            View All Jobs
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <SearchInput
            placeholder="Search jobs for assessments..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>

        {/* Assessment Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No jobs found' : 'No jobs available'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create some jobs first to start building assessments'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/jobs')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Go to Jobs
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <AssessmentCard
                  key={job.id}
                  job={job}
                  onCreateAssessment={() => handleCreateAssessment(job.id)}
                  onViewAssessment={() => handleViewAssessment(job.id)}
                  onViewJob={() => handleViewJob(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

interface AssessmentCardProps {
  job: Job
  onCreateAssessment: () => void
  onViewAssessment: () => void
  onViewJob: () => void
}

function AssessmentCard({ job, onCreateAssessment, onViewAssessment, onViewJob }: AssessmentCardProps) {
  // Mock assessment status - in real app this would come from assessment store
  const hasAssessment = Math.random() > 0.4 // Simulate some jobs having assessments
  const questionCount = hasAssessment ? Math.floor(Math.random() * 15) + 5 : 0

  return (
    <Card className="transition-all hover:shadow-lg border-border hover:border-primary/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg leading-6">{job.title}</CardTitle>
            <CardDescription className="text-sm">
              {job.description}
            </CardDescription>
          </div>
          <Badge 
            variant={job.status === 'active' ? 'default' : 'secondary'}
            className="ml-2 shrink-0"
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Assessment Status */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {hasAssessment 
                ? `${questionCount} questions configured`
                : 'No assessment created'
              }
            </span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {hasAssessment ? (
              <>
                <Button
                  size="sm"
                  onClick={onViewAssessment}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewJob}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={onCreateAssessment}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Create Assessment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewJob}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
