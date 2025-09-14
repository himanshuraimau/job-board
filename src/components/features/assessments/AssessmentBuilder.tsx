import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Save, Eye } from 'lucide-react'
import { useAssessmentStore, useAssessmentHelpers } from '@/stores/assessments'
import { SectionEditor } from './SectionEditor'
import { QuestionPreview } from './QuestionPreview'
import type { Assessment, Section } from '@/types'

interface AssessmentBuilderProps {
  jobId: string
  onPreview?: (assessment: Assessment) => void
  onSave?: (assessment: Assessment) => void
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  jobId,
  onPreview,
  onSave
}) => {
  const assessment = useAssessmentStore(state => state.assessments[jobId])
  const loading = useAssessmentStore(state => state.loading)
  const error = useAssessmentStore(state => state.error)
  const { fetchAssessment, updateAssessment } = useAssessmentStore()
  const { addSection, reorderSections } = useAssessmentHelpers()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load assessment on mount
  useEffect(() => {
    fetchAssessment(jobId)
  }, [jobId, fetchAssessment])

  // Update local state when assessment loads
  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title)
      setDescription(assessment.description || '')
    }
  }, [assessment])

  // Create initial assessment if none exists
  const createInitialAssessment = async () => {
    const newAssessment: Assessment = {
      id: `assessment-${jobId}`,
      jobId,
      title: title || 'New Assessment',
      description: description || '',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await updateAssessment(jobId, newAssessment)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setHasUnsavedChanges(true)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!assessment) {
      await createInitialAssessment()
    } else {
      const updatedAssessment = {
        ...assessment,
        title,
        description,
        updatedAt: new Date()
      }
      await updateAssessment(jobId, updatedAssessment)
      onSave?.(updatedAssessment)
    }
    setHasUnsavedChanges(false)
  }

  const handleAddSection = () => {
    if (!assessment) {
      createInitialAssessment().then(() => {
        addSection(jobId, {
          title: 'New Section',
          description: '',
          questions: [],
          order: 0
        })
      })
    } else {
      addSection(jobId, {
        title: 'New Section',
        description: '',
        questions: [],
        order: assessment.sections.length
      })
    }
    setHasUnsavedChanges(true)
  }

  const handlePreview = () => {
    if (assessment) {
      onPreview?.(assessment)
    }
    setShowPreview(!showPreview)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id && assessment) {
      const oldIndex = assessment.sections.findIndex(section => section.id === active.id)
      const newIndex = assessment.sections.findIndex(section => section.id === over.id)

      reorderSections(jobId, oldIndex, newIndex)
      setHasUnsavedChanges(true)
    }
  }

  const handleSectionChange = () => {
    setHasUnsavedChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading assessment: {error}</p>
        <Button 
          onClick={() => fetchAssessment(jobId)} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
          <p className="text-gray-600">Create and manage assessment questions for this job</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Panel */}
        <div className="space-y-6">
          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter assessment title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Enter assessment description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <Button
                onClick={handleAddSection}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </CardHeader>
            <CardContent>
              {!assessment || assessment.sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No sections yet. Add your first section to get started.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={assessment.sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {assessment.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <SectionEditor
                            key={section.id}
                            jobId={jobId}
                            section={section}
                            onChange={handleSectionChange}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && assessment && (
          <div className="lg:sticky lg:top-6">
            <QuestionPreview assessment={assessment} />
          </div>
        )}
      </div>
    </div>
  )
}