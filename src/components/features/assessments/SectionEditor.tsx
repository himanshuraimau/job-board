import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useAssessmentHelpers } from '@/stores/assessments'
import { QuestionEditor } from './QuestionEditor'
import type { Section, Question } from '@/types'

interface SectionEditorProps {
  jobId: string
  section: Section
  onChange?: () => void
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  jobId,
  section,
  onChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [title, setTitle] = useState(section.title)
  const [description, setDescription] = useState(section.description || '')

  const {
    updateSection,
    deleteSection,
    addQuestion,
    reorderQuestions
  } = useAssessmentHelpers()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    updateSection(jobId, section.id, { title: newTitle })
    onChange?.()
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription)
    updateSection(jobId, section.id, { description: newDescription })
    onChange?.()
  }

  const handleDeleteSection = () => {
    if (confirm('Are you sure you want to delete this section? All questions in this section will be lost.')) {
      deleteSection(jobId, section.id)
      onChange?.()
    }
  }

  const handleAddQuestion = () => {
    addQuestion(jobId, section.id, {
      type: 'text',
      title: 'New Question',
      description: '',
      required: false,
      order: section.questions.length
    })
    onChange?.()
  }

  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = section.questions.findIndex(q => q.id === active.id)
      const newIndex = section.questions.findIndex(q => q.id === over.id)

      reorderQuestions(jobId, section.id, oldIndex, newIndex)
      onChange?.()
    }
  }

  const handleQuestionChange = () => {
    onChange?.()
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-auto"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 space-y-2">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-medium border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Section title"
              />
              {isExpanded && (
                <Textarea
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Section description (optional)"
                  className="text-sm border-none p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={2}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
              </span>
              <Button
                onClick={handleDeleteSection}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Questions */}
              {section.questions.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p>No questions in this section yet.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleQuestionDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={section.questions.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {section.questions
                        .sort((a, b) => a.order - b.order)
                        .map((question) => (
                          <QuestionEditor
                            key={question.id}
                            jobId={jobId}
                            sectionId={section.id}
                            question={question}
                            onChange={handleQuestionChange}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Add Question Button */}
              <Button
                onClick={handleAddQuestion}
                variant="outline"
                className="w-full flex items-center gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}