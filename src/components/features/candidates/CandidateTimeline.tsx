import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TimelineEvent } from '@/types'
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface CandidateTimelineProps {
  timeline: TimelineEvent[]
  className?: string
}

const eventIcons: Record<TimelineEvent['type'], React.ComponentType<{ className?: string }>> = {
  stage_change: ArrowRight,
  note_added: MessageSquare,
  assessment_completed: CheckCircle
}

const eventColors: Record<TimelineEvent['type'], string> = {
  stage_change: 'text-blue-600 bg-blue-100',
  note_added: 'text-green-600 bg-green-100',
  assessment_completed: 'text-purple-600 bg-purple-100'
}

export function CandidateTimeline({ timeline, className = '' }: CandidateTimelineProps) {
  // Sort timeline by date (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (timeline.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Activity will appear here as the candidate progresses</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
          <Badge variant="secondary" className="ml-auto">
            {timeline.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedTimeline.map((event, index) => {
            const Icon = eventIcons[event.type]
            const isLast = index === sortedTimeline.length - 1
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${eventColors[event.type]}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {event.description}
                        </p>
                        
                        {/* Additional data based on event type */}
                        {event.type === 'stage_change' && event.data && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {event.data.previousStage as string}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {event.data.newStage as string}
                            </Badge>
                          </div>
                        )}
                        
                        {event.type === 'note_added' && event.data && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Note ID: {event.data.noteId as string}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <div title={format(event.createdAt, 'PPpp')}>
                          {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                        </div>
                        <div className="mt-1">
                          {format(event.createdAt, 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}