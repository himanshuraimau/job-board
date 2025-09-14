import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Candidate } from '@/types'
import { Mail, MessageSquare, MoreHorizontal, GripVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface KanbanCandidateCardProps {
  candidate: Candidate
  onSelect?: (candidate: Candidate) => void
  onAddNote?: (candidateId: string) => void
}

export function KanbanCandidateCard({
  candidate,
  onSelect,
  onAddNote
}: KanbanCandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: candidate.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on dropdown or drag handle
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]') || 
        (e.target as HTMLElement).closest('[data-drag-handle]')) {
      return
    }
    onSelect?.(candidate)
  }

  const handleAddNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddNote?.(candidate.id)
  }

  const noteCount = candidate.notes.length
  const lastActivity = candidate.timeline[candidate.timeline.length - 1]

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200',
        isDragging && 'opacity-50 rotate-3 shadow-lg'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header with drag handle */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
              <div className="flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    data-dropdown-trigger
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAddNote}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                data-drag-handle
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {noteCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{noteCount}</span>
              </div>
            )}
            
            <div className="ml-auto">
              {formatDistanceToNow(candidate.createdAt, { addSuffix: true })}
            </div>
          </div>

          {/* Last activity */}
          {lastActivity && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Last:</span> {lastActivity.description.substring(0, 40)}
              {lastActivity.description.length > 40 && '...'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}