import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KanbanCandidateCard } from './KanbanCandidateCard'
import type { Candidate } from '@/types'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  stage: Candidate['stage']
  title: string
  candidates: Candidate[]
  className?: string
  onSelectCandidate?: (candidate: Candidate) => void
  onAddNote?: (candidateId: string) => void
}

export function KanbanColumn({
  stage,
  title,
  candidates,
  className = '',
  onSelectCandidate,
  onAddNote
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        'h-fit min-h-[400px] transition-colors',
        className,
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {candidates.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <SortableContext 
          items={candidates.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No candidates</div>
                <div className="text-xs">Drag candidates here</div>
              </div>
            ) : (
              candidates.map(candidate => (
                <KanbanCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSelect={onSelectCandidate}
                  onAddNote={onAddNote}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}