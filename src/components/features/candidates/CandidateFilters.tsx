import { useCallback } from 'react'
import { SearchInput } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { CandidateFilters as CandidateFiltersType, Candidate } from '@/types'
import { X, Filter } from 'lucide-react'

interface CandidateFiltersProps {
  filters: CandidateFiltersType
  onFiltersChange: (filters: Partial<CandidateFiltersType>) => void
  onClearFilters: () => void
  candidateCount?: number
  className?: string
}

const stageLabels: Record<Candidate['stage'], string> = {
  applied: 'Applied',
  screen: 'Screening',
  tech: 'Technical',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected'
}

const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']

export function CandidateFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  candidateCount = 0,
  className = ''
}: CandidateFiltersProps) {
  const handleSearchChange = useCallback((value: string) => {
    const trimmedValue = value.trim()
    onFiltersChange({ search: trimmedValue || undefined })
  }, [onFiltersChange])

  const handleStageChange = useCallback((stage: string) => {
    if (stage === 'all') {
      onFiltersChange({ stage: undefined })
    } else {
      onFiltersChange({ stage: stage as Candidate['stage'] })
    }
  }, [onFiltersChange])

  const handleJobChange = useCallback((jobId: string) => {
    if (jobId === 'all') {
      onFiltersChange({ jobId: undefined })
    } else {
      onFiltersChange({ jobId })
    }
  }, [onFiltersChange])

  const hasActiveFilters = !!(filters.search || filters.stage || filters.jobId)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
          {candidateCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {candidateCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <SearchInput
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onSearch={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Stage Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Hiring Stage</label>
          <Select
            value={filters.stage || 'all'}
            onValueChange={handleStageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage} value={stage}>
                  {stageLabels[stage]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Filter - TODO: This will be populated with actual jobs */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Position</label>
          <Select
            value={filters.jobId || 'all'}
            onValueChange={handleJobChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All positions</SelectItem>
              {/* TODO: Populate with actual jobs from store */}
              <SelectItem value="job-1">Frontend Developer</SelectItem>
              <SelectItem value="job-2">Backend Developer</SelectItem>
              <SelectItem value="job-3">Full Stack Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFiltersChange({ search: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.stage && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Stage: {stageLabels[filters.stage]}
                  <button
                    onClick={() => onFiltersChange({ stage: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.jobId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Job: {filters.jobId}
                  <button
                    onClick={() => onFiltersChange({ jobId: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}