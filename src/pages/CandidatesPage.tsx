import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import { CandidateList, CandidateFilters, CandidateKanban } from '@/components/features/candidates'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useCandidatesData, 
  useCandidatesLoading, 
  useCandidatesError,
  useCandidatesFilters,
  useFetchCandidates,
  useMoveStage,
  useSetFilters,
  useFilteredCandidates,
  useCandidateStore
} from '@/stores/candidates'
import type { CandidateFilters as CandidateFiltersType } from '@/types'
import { Plus, List, Kanban } from 'lucide-react'

export function CandidatesPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const allCandidates = useCandidatesData()
  const filteredCandidates = useFilteredCandidates()
  const loading = useCandidatesLoading()
  const error = useCandidatesError()
  const filters = useCandidatesFilters()
  const fetchCandidates = useFetchCandidates()
  const moveStage = useMoveStage()
  const setFilters = useSetFilters()

  // Initial fetch on mount only
  useEffect(() => {
    // Only fetch if we don't have candidates yet and not already loading
    if (allCandidates.length === 0 && !loading) {
      fetchCandidates()
    }
  }, []) // Empty dependency array - only run on mount

  const handleSelectCandidate = useCallback((candidate: any) => {
    navigate(`/candidates/${candidate.id}`)
  }, [navigate])

  const handleMoveStage = useCallback((candidateId: string, newStage: any) => {
    moveStage(candidateId, newStage)
  }, [moveStage])

  const handleAddNote = useCallback((candidateId: string) => {
    navigate(`/candidates/${candidateId}?tab=notes`)
  }, [navigate])

  const handleCreateCandidate = useCallback(() => {
    // TODO: Open create candidate modal
    console.log('Create candidate')
  }, [])

  const handleFiltersChange = useCallback((newFilters: Partial<CandidateFiltersType>) => {
    setFilters(newFilters)
    // Simple timeout to allow state to update, then fetch
    setTimeout(() => {
      const currentStore = useCandidateStore.getState()
      if (!currentStore.loading) {
        currentStore.fetchCandidates()
      }
    }, 100)
  }, []) // Empty deps - using store getState instead

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: undefined,
      stage: undefined,
      jobId: undefined
    })
    // Simple timeout to allow state to update, then fetch
    setTimeout(() => {
      const currentStore = useCandidateStore.getState()
      if (!currentStore.loading) {
        currentStore.fetchCandidates()
      }
    }, 100)
  }, []) // Empty deps - using store getState instead

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Error loading candidates</p>
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

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Candidates</h1>
            <p className="text-muted-foreground">
              Manage and track candidates through the hiring process
            </p>
          </div>
          <Button onClick={handleCreateCandidate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'kanban')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {allCandidates.length} candidates
            </div>
          </div>

          <TabsContent value="list">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <CandidateFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  candidateCount={filteredCandidates.length}
                  className="sticky top-6"
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <CandidateList
                  candidates={filteredCandidates}
                  loading={loading}
                  onSelectCandidate={handleSelectCandidate}
                  onMoveStage={handleMoveStage}
                  onAddNote={handleAddNote}
                  height={700}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <div className="space-y-4">
              {/* Filters for Kanban */}
              <div className="max-w-md">
                <CandidateFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  candidateCount={filteredCandidates.length}
                />
              </div>

              {/* Kanban Board */}
              <CandidateKanban
                candidates={filteredCandidates}
                loading={loading}
                onMoveStage={handleMoveStage}
                onSelectCandidate={handleSelectCandidate}
                onAddNote={handleAddNote}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}