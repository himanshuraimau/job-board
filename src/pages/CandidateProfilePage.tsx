import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import { CandidateProfile } from '@/components/features/candidates'
import { Button } from '@/components/ui/button'
import { 
  useCandidateById,
  useCandidatesLoading,
  useCandidatesError,
  useCandidatesActions
} from '@/stores/candidates'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const candidate = useCandidateById(id || '')
  const loading = useCandidatesLoading()
  const error = useCandidatesError()
  const { fetchCandidates, moveStage, addNote } = useCandidatesActions()

  useEffect(() => {
    // Fetch candidates if we don't have the candidate data
    if (!candidate && !loading) {
      fetchCandidates()
    }
  }, [candidate, loading, fetchCandidates])

  const handleMoveStage = (candidateId: string, newStage: any) => {
    moveStage(candidateId, newStage)
  }

  const handleAddNote = (candidateId: string, noteData: any) => {
    addNote(candidateId, noteData)
  }



  if (loading && !candidate) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading candidate...</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Error loading candidate</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              onClick={() => fetchCandidates()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!candidate) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium">Candidate not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              The candidate you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => navigate('/candidates')} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <CandidateProfile
        candidate={candidate}
        onMoveStage={handleMoveStage}
        onAddNote={handleAddNote}
      />
    </PageContainer>
  )
}