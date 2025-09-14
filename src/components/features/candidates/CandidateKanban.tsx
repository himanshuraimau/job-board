import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners
} from '@dnd-kit/core'
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent
} from '@dnd-kit/core'
import { CandidateCard } from './CandidateCard'
import { KanbanColumn } from './KanbanColumn'
import type { Candidate } from '@/types'
import { Loader2 } from 'lucide-react'

interface CandidateKanbanProps {
    candidates: Candidate[]
    loading?: boolean
    onMoveStage?: (candidateId: string, newStage: Candidate['stage']) => void
    onSelectCandidate?: (candidate: Candidate) => void
    onAddNote?: (candidateId: string) => void
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

const stageColors: Record<Candidate['stage'], string> = {
    applied: 'bg-blue-50 border-blue-200',
    screen: 'bg-yellow-50 border-yellow-200',
    tech: 'bg-purple-50 border-purple-200',
    offer: 'bg-orange-50 border-orange-200',
    hired: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200'
}

const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']

export function CandidateKanban({
    candidates,
    loading = false,
    onMoveStage,
    onSelectCandidate,
    onAddNote,
    className = ''
}: CandidateKanbanProps) {
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required to start drag
            },
        })
    )

    // Group candidates by stage
    const candidatesByStage = stages.reduce((acc, stage) => {
        acc[stage] = candidates.filter(candidate => candidate.stage === stage)
        return acc
    }, {} as Record<Candidate['stage'], Candidate[]>)

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const candidate = candidates.find(c => c.id === active.id)
        setActiveCandidate(candidate || null)
    }

    const handleDragOver = (_event: DragOverEvent) => {
        // This is where we could add visual feedback for valid drop zones
        // For now, we'll keep it simple
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveCandidate(null)

        if (!over) return

        const candidateId = active.id as string
        const newStage = over.id as Candidate['stage']

        // Find the candidate being moved
        const candidate = candidates.find(c => c.id === candidateId)
        if (!candidate) return

        // Only move if the stage is different
        if (candidate.stage !== newStage) {
            onMoveStage?.(candidateId, newStage)
        }
    }

    if (loading && candidates.length === 0) {
        return (
            <div className={`flex items-center justify-center h-96 ${className}`}>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading candidates...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={className}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {stages.map(stage => {
                        const stageCandidates = candidatesByStage[stage] || []

                        return (
                            <KanbanColumn
                                key={stage}
                                stage={stage}
                                title={stageLabels[stage]}
                                candidates={stageCandidates}
                                className={stageColors[stage]}
                                onSelectCandidate={onSelectCandidate}
                                onAddNote={onAddNote}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeCandidate ? (
                        <div className="rotate-3 opacity-90">
                            <CandidateCard
                                candidate={activeCandidate}
                                compact={true}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {loading && candidates.length > 0 && (
                <div className="flex items-center justify-center py-4 mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Updating candidates...</span>
                    </div>
                </div>
            )}
        </div>
    )
}