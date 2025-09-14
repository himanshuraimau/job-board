import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Candidate } from '@/types'
import { MoreHorizontal, Mail, Calendar, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CandidateCardProps {
  candidate: Candidate
  onSelect?: (candidate: Candidate) => void
  onMoveStage?: (candidateId: string, newStage: Candidate['stage']) => void
  onAddNote?: (candidateId: string) => void
  compact?: boolean
}

const stageColors: Record<Candidate['stage'], string> = {
  applied: 'bg-blue-100 text-blue-800 border-blue-200',
  screen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  tech: 'bg-purple-100 text-purple-800 border-purple-200',
  offer: 'bg-orange-100 text-orange-800 border-orange-200',
  hired: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
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

export function CandidateCard({ 
  candidate, 
  onSelect, 
  onMoveStage, 
  onAddNote, 
  compact = false 
}: CandidateCardProps) {
  const handleCardClick = () => {
    onSelect?.(candidate)
  }

  const handleMoveStage = (newStage: Candidate['stage']) => {
    onMoveStage?.(candidate.id, newStage)
  }

  const handleAddNote = () => {
    onAddNote?.(candidate.id)
  }

  const lastActivity = candidate.timeline[candidate.timeline.length - 1]
  const noteCount = candidate.notes.length

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{candidate.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge 
                variant="outline" 
                className={`text-xs ${stageColors[candidate.stage]}`}
              >
                {stageLabels[candidate.stage]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {stages
                    .filter(stage => stage !== candidate.stage)
                    .map(stage => (
                      <DropdownMenuItem 
                        key={stage}
                        onClick={() => handleMoveStage(stage)}
                      >
                        Move to {stageLabels[stage]}
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuItem onClick={handleAddNote}>
                    Add Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{candidate.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {stages
                .filter(stage => stage !== candidate.stage)
                .map(stage => (
                  <DropdownMenuItem 
                    key={stage}
                    onClick={() => handleMoveStage(stage)}
                  >
                    Move to {stageLabels[stage]}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem onClick={handleAddNote}>
                Add Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="outline" 
            className={stageColors[candidate.stage]}
          >
            {stageLabels[candidate.stage]}
          </Badge>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {noteCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{noteCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(candidate.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        {lastActivity && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Last activity:</span> {lastActivity.description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}