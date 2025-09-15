import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useMemo, useCallback, memo } from 'react'
import { CandidateCard } from './CandidateCard'
import type { Candidate } from '@/types'
import { Loader2 } from 'lucide-react'

interface CandidateListProps {
  candidates: Candidate[]
  loading?: boolean
  onSelectCandidate?: (candidate: Candidate) => void
  onMoveStage?: (candidateId: string, newStage: Candidate['stage']) => void
  onAddNote?: (candidateId: string) => void
  height?: number
  compact?: boolean
  className?: string
}

export function CandidateList({
  candidates,
  loading = false,
  onSelectCandidate,
  onMoveStage,
  onAddNote,
  height = 600,
  compact = false,
  className = ''
}: CandidateListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Estimate item size based on compact mode
  const estimateSize = useMemo(() => {
    return compact ? 80 : 160
  }, [compact])

  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 10, // Increased overscan for better performance with large datasets
    getItemKey: (index) => candidates[index]?.id || index,
    // Enable smooth scrolling for better UX
    scrollToFn: (offset, behavior = 'auto') => {
      parentRef.current?.scrollTo({
        top: offset,
        behavior
      })
    }
  })

  if (loading && candidates.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading candidates...</span>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No candidates found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={parentRef}
        className="overflow-auto border rounded-lg"
        style={{ height }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const candidate = candidates[virtualItem.index]
            
            if (!candidate) {
              return null
            }

            return (
              <VirtualizedCandidateItem
                key={virtualItem.key}
                virtualItem={virtualItem}
                candidate={candidate}
                onSelectCandidate={onSelectCandidate}
                onMoveStage={onMoveStage}
                onAddNote={onAddNote}
                compact={compact}
              />
            )
          })}
        </div>
      </div>
      
      {loading && candidates.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more candidates...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Optimized virtual item component with memoization
interface VirtualizedCandidateItemProps {
  virtualItem: any
  candidate: Candidate
  onSelectCandidate?: (candidate: Candidate) => void
  onMoveStage?: (candidateId: string, newStage: Candidate['stage']) => void
  onAddNote?: (candidateId: string) => void
  compact: boolean
}

const VirtualizedCandidateItem = memo<VirtualizedCandidateItemProps>(({
  virtualItem,
  candidate,
  onSelectCandidate,
  onMoveStage,
  onAddNote,
  compact
}) => {
  const handleSelect = useCallback(() => {
    onSelectCandidate?.(candidate)
  }, [onSelectCandidate, candidate])

  const handleMoveStage = useCallback((candidateId: string, newStage: Candidate['stage']) => {
    onMoveStage?.(candidateId, newStage)
  }, [onMoveStage])

  const handleAddNote = useCallback((candidateId: string) => {
    onAddNote?.(candidateId)
  }, [onAddNote])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: virtualItem.size,
        transform: `translateY(${virtualItem.start}px)`
      }}
    >
      <div className="p-2 h-full">
        <CandidateCard
          candidate={candidate}
          onSelect={handleSelect}
          onMoveStage={handleMoveStage}
          onAddNote={handleAddNote}
          compact={compact}
        />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.candidate.updatedAt === nextProps.candidate.updatedAt &&
    prevProps.compact === nextProps.compact &&
    prevProps.virtualItem.start === nextProps.virtualItem.start &&
    prevProps.virtualItem.size === nextProps.virtualItem.size
  )
})

VirtualizedCandidateItem.displayName = 'VirtualizedCandidateItem'

// Performance optimized version with React.memo
export const MemoizedCandidateList = memo(CandidateList)