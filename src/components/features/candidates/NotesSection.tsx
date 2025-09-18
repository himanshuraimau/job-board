import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Note, Candidate } from '@/types'
import { MessageSquare, Send, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatDateSafe } from '@/lib/utils'

interface NotesSectionProps {
  candidate: Candidate
  onAddNote?: (candidateId: string, noteData: Omit<Note, 'id' | 'createdAt'>) => void
  className?: string
}

// Mock users for @mention functionality
const mockUsers = [
  { id: 'user-1', name: 'John Smith', email: 'john@company.com' },
  { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@company.com' },
  { id: 'user-3', name: 'Mike Davis', email: 'mike@company.com' },
  { id: 'user-4', name: 'Lisa Wilson', email: 'lisa@company.com' }
]

export function NotesSection({
  candidate,
  onAddNote,
  className = ''
}: NotesSectionProps) {
  const [newNote, setNewNote] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter users based on mention query
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart
    
    setNewNote(value)

    // Check for @ mentions
    const textBeforeCursor = value.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setShowMentions(true)
      setMentionQuery(mentionMatch[1])
      setMentionPosition(cursorPosition - mentionMatch[0].length)
      setSelectedMentionIndex(0)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredUsers[selectedMentionIndex])
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitNote()
    }
  }, [showMentions, filteredUsers, selectedMentionIndex])

  const insertMention = useCallback((user: typeof mockUsers[0]) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const beforeMention = newNote.substring(0, mentionPosition)
    const afterMention = newNote.substring(textarea.selectionStart)
    const mentionText = `@${user.name}`
    
    const newValue = beforeMention + mentionText + afterMention
    setNewNote(newValue)
    setShowMentions(false)
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPosition = mentionPosition + mentionText.length
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      textarea.focus()
    }, 0)
  }, [newNote, mentionPosition])

  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]
      const user = mockUsers.find(u => u.name.toLowerCase() === mentionedName.toLowerCase())
      if (user) {
        mentions.push(user.name)
      }
    }

    return mentions
  }, [])

  const handleSubmitNote = useCallback(() => {
    if (!newNote.trim()) return

    const mentions = extractMentions(newNote)
    const noteData: Omit<Note, 'id' | 'createdAt'> = {
      content: newNote.trim(),
      mentions,
      authorId: 'current-user' // TODO: Get from auth context
    }

    onAddNote?.(candidate.id, noteData)
    setNewNote('')
    setShowMentions(false)
  }, [newNote, candidate.id, onAddNote, extractMentions])

  const renderNoteContent = (content: string, mentions: string[]) => {
    if (mentions.length === 0) {
      return content
    }

    let renderedContent = content
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention}`, 'gi')
      renderedContent = renderedContent.replace(
        mentionRegex,
        `<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">@${mention}</span>`
      )
    })

    return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes ({candidate.notes.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Add a note... Use @name to mention team members"
              value={newNote}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] resize-none"
              rows={4}
            />
            
            {/* Mention Dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-64 bg-background border rounded-md shadow-lg mt-1">
                <div className="p-2 text-xs text-muted-foreground border-b">
                  Press Tab or Enter to select
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredUsers.map((user, index) => (
                    <button
                      key={user.id}
                      className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${
                        index === selectedMentionIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => insertMention(user)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Tip: Use Ctrl+Enter to submit quickly
            </div>
            <Button 
              onClick={handleSubmitNote}
              disabled={!newNote.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {candidate.notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Add the first note to start tracking interactions</p>
            </div>
          ) : (
            candidate.notes
              .sort((a, b) => {
                try {
                  const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
                  const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
                  return dateB.getTime() - dateA.getTime()
                } catch {
                  return 0
                }
              })
              .map(note => (
                <Card key={note.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Note Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Team Member</div>
                            <div className="text-xs text-muted-foreground">
                              {(() => {
                                try {
                                  const date = note.createdAt instanceof Date 
                                    ? note.createdAt 
                                    : new Date(note.createdAt)
                                  return isNaN(date.getTime()) 
                                    ? 'Unknown time'
                                    : formatDistanceToNow(date, { addSuffix: true })
                                } catch {
                                  return 'Unknown time'
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDateSafe(note.createdAt, 'MMM d, HH:mm')}
                        </div>
                      </div>

                      {/* Note Content */}
                      <div className="text-sm whitespace-pre-wrap">
                        {renderNoteContent(note.content, note.mentions)}
                      </div>

                      {/* Mentions */}
                      {note.mentions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.mentions.map(mention => (
                            <Badge key={mention} variant="outline" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}