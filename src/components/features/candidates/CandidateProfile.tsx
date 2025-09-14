import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CandidateTimeline } from './CandidateTimeline'
import { NotesSection } from './NotesSection'
import type { Candidate } from '@/types'
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  User, 
  MessageSquare,
  FileText,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { formatDateSafe } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface CandidateProfileProps {
  candidate: Candidate
  onMoveStage?: (candidateId: string, newStage: Candidate['stage']) => void
  onAddNote?: (candidateId: string, noteData: any) => void
  className?: string
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

export function CandidateProfile({
  candidate,
  onMoveStage,
  onAddNote,
  className = ''
}: CandidateProfileProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleBack = () => {
    navigate('/candidates')
  }

  const handleMoveStage = (newStage: Candidate['stage']) => {
    onMoveStage?.(candidate.id, newStage)
  }

  const handleAddNote = (candidateId: string, noteData: any) => {
    onAddNote?.(candidateId, noteData)
  }

  const handleEditCandidate = () => {
    // TODO: Open edit candidate modal
    console.log('Edit candidate:', candidate.id)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>

      {/* Candidate Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{candidate.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{candidate.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge 
                    variant="outline" 
                    className={`${stageColors[candidate.stage]} font-medium`}
                  >
                    {stageLabels[candidate.stage]}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {(() => {
                      try {
                        const date = candidate.createdAt instanceof Date 
                          ? candidate.createdAt 
                          : new Date(candidate.createdAt)
                        return isNaN(date.getTime()) 
                          ? 'Unknown time'
                          : formatDistanceToNow(date, { addSuffix: true })
                      } catch {
                        return 'Unknown time'
                      }
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => setActiveTab('notes')} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditCandidate}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Candidate
                  </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({candidate.notes.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{candidate.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{candidate.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Stage</label>
                  <Badge 
                    variant="outline" 
                    className={`${stageColors[candidate.stage]} mt-1`}
                  >
                    {stageLabels[candidate.stage]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                  <p className="font-medium">{formatDateSafe(candidate.createdAt, 'PPP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateSafe(candidate.updatedAt, 'PPP')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Notes</span>
                  <Badge variant="secondary">{candidate.notes.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timeline Events</span>
                  <Badge variant="secondary">{candidate.timeline.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days in Process</span>
                  <Badge variant="secondary">
                    {(() => {
                      try {
                        const createdDate = candidate.createdAt instanceof Date 
                          ? candidate.createdAt 
                          : new Date(candidate.createdAt)
                        if (isNaN(createdDate.getTime())) {
                          return 'N/A'
                        }
                        return Math.ceil((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                      } catch {
                        return 'N/A'
                      }
                    })()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <NotesSection
            candidate={candidate}
            onAddNote={handleAddNote}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <CandidateTimeline timeline={candidate.timeline} />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assessments</h3>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Send Assessment
            </Button>
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No assessments yet</p>
              <p className="text-sm text-muted-foreground">Send assessments to evaluate this candidate</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}