import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Candidate, CandidateStore, Note, TimelineEvent } from '@/types'
import { apiClient } from '@/lib/api'

interface CandidateStoreState extends CandidateStore {
  // Internal state for optimistic updates
  _previousCandidates?: Candidate[]
  _operationInProgress?: string
}

export const useCandidateStore = create<CandidateStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    candidates: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      stage: undefined,
      jobId: undefined
    },
    pagination: {
      page: 1,
      pageSize: 50, // Higher page size for virtualized lists
      total: 0
    },

    // Actions
    fetchCandidates: async () => {
      set({ loading: true, error: null })
      
      try {
        const { filters, pagination } = get()
        const response = await apiClient.getCandidates({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
        
        set({
          candidates: response.data,
          pagination: response.pagination,
          loading: false
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch candidates',
          loading: false
        })
      }
    },

    createCandidate: async (candidateData) => {
      const tempId = `temp-${Date.now()}`
      const optimisticCandidate: Candidate = {
        ...candidateData,
        id: tempId,
        notes: [],
        timeline: [{
          id: `timeline-${Date.now()}`,
          type: 'stage_change',
          description: `Candidate applied for position`,
          createdAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Optimistic update
      const currentCandidates = get().candidates
      set({ 
        candidates: [...currentCandidates, optimisticCandidate],
        _previousCandidates: currentCandidates,
        _operationInProgress: 'create'
      })

      try {
        const createdCandidate = await apiClient.createCandidate(candidateData)
        
        // Replace optimistic candidate with real candidate
        set(state => ({
          candidates: state.candidates.map(candidate => 
            candidate.id === tempId ? createdCandidate : candidate
          ),
          _previousCandidates: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousCandidates } = get()
        set({
          candidates: _previousCandidates || [],
          error: error instanceof Error ? error.message : 'Failed to create candidate',
          _previousCandidates: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    updateCandidate: async (id, updates) => {
      // Store previous state for rollback
      const currentCandidates = get().candidates
      const candidateIndex = currentCandidates.findIndex(candidate => candidate.id === id)
      
      if (candidateIndex === -1) {
        throw new Error('Candidate not found')
      }

      const updatedCandidate = {
        ...currentCandidates[candidateIndex],
        ...updates,
        updatedAt: new Date()
      }

      // Optimistic update
      const optimisticCandidates = [...currentCandidates]
      optimisticCandidates[candidateIndex] = updatedCandidate
      
      set({
        candidates: optimisticCandidates,
        _previousCandidates: currentCandidates,
        _operationInProgress: 'update'
      })

      try {
        const serverCandidate = await apiClient.updateCandidate(id, updates)
        
        // Update with server response
        set(state => ({
          candidates: state.candidates.map(candidate => 
            candidate.id === id ? serverCandidate : candidate
          ),
          _previousCandidates: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousCandidates } = get()
        set({
          candidates: _previousCandidates || [],
          error: error instanceof Error ? error.message : 'Failed to update candidate',
          _previousCandidates: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    addNote: async (candidateId, noteData) => {
      // Store previous state for rollback
      const currentCandidates = get().candidates
      const candidateIndex = currentCandidates.findIndex(candidate => candidate.id === candidateId)
      
      if (candidateIndex === -1) {
        throw new Error('Candidate not found')
      }

      const tempNoteId = `temp-note-${Date.now()}`
      const optimisticNote: Note = {
        ...noteData,
        id: tempNoteId,
        createdAt: new Date()
      }

      const timelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        type: 'note_added',
        description: `Note added: ${noteData.content.substring(0, 50)}${noteData.content.length > 50 ? '...' : ''}`,
        data: { noteId: tempNoteId },
        createdAt: new Date()
      }

      // Optimistic update
      const optimisticCandidates = [...currentCandidates]
      optimisticCandidates[candidateIndex] = {
        ...optimisticCandidates[candidateIndex],
        notes: [...optimisticCandidates[candidateIndex].notes, optimisticNote],
        timeline: [...optimisticCandidates[candidateIndex].timeline, timelineEvent],
        updatedAt: new Date()
      }
      
      set({
        candidates: optimisticCandidates,
        _previousCandidates: currentCandidates,
        _operationInProgress: 'addNote'
      })

      try {
        const createdNote = await apiClient.addCandidateNote(candidateId, noteData)
        
        // Update with server response
        set(state => ({
          candidates: state.candidates.map(candidate => {
            if (candidate.id === candidateId) {
              return {
                ...candidate,
                notes: candidate.notes.map(note => 
                  note.id === tempNoteId ? createdNote : note
                ),
                timeline: candidate.timeline.map(event => 
                  event.data?.noteId === tempNoteId 
                    ? { ...event, data: { ...event.data, noteId: createdNote.id } }
                    : event
                )
              }
            }
            return candidate
          }),
          _previousCandidates: undefined,
          _operationInProgress: undefined
        }))
      } catch (error) {
        // Rollback optimistic update
        const { _previousCandidates } = get()
        set({
          candidates: _previousCandidates || [],
          error: error instanceof Error ? error.message : 'Failed to add note',
          _previousCandidates: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    moveStage: async (candidateId, newStage) => {
      // Store previous state for rollback
      const currentCandidates = get().candidates
      const candidateIndex = currentCandidates.findIndex(candidate => candidate.id === candidateId)
      
      if (candidateIndex === -1) {
        throw new Error('Candidate not found')
      }

      const currentCandidate = currentCandidates[candidateIndex]
      const previousStage = currentCandidate.stage

      // Don't update if stage is the same
      if (previousStage === newStage) {
        return
      }

      const timelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        type: 'stage_change',
        description: `Stage changed from ${previousStage} to ${newStage}`,
        data: { previousStage, newStage },
        createdAt: new Date()
      }

      // Optimistic update
      const optimisticCandidates = [...currentCandidates]
      optimisticCandidates[candidateIndex] = {
        ...currentCandidate,
        stage: newStage,
        timeline: [...currentCandidate.timeline, timelineEvent],
        updatedAt: new Date()
      }
      
      set({
        candidates: optimisticCandidates,
        _previousCandidates: currentCandidates,
        _operationInProgress: 'moveStage'
      })

      try {
        await apiClient.updateCandidate(candidateId, { stage: newStage })
        
        set({
          _previousCandidates: undefined,
          _operationInProgress: undefined
        })
      } catch (error) {
        // Rollback optimistic update
        const { _previousCandidates } = get()
        set({
          candidates: _previousCandidates || [],
          error: error instanceof Error ? error.message : 'Failed to move candidate stage',
          _previousCandidates: undefined,
          _operationInProgress: undefined
        })
        throw error
      }
    },

    setFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 } // Reset to first page when filtering
      }))
      
      // Auto-fetch with new filters
      get().fetchCandidates()
    },

    setPage: (page) => {
      set(state => ({
        pagination: { ...state.pagination, page }
      }))
      
      // Auto-fetch with new page
      get().fetchCandidates()
    }
  }))
)

// Selectors for optimized subscriptions
export const useCandidatesData = () => useCandidateStore(state => state.candidates)
export const useCandidatesLoading = () => useCandidateStore(state => state.loading)
export const useCandidatesError = () => useCandidateStore(state => state.error)
export const useCandidatesFilters = () => useCandidateStore(state => state.filters)
export const useCandidatesPagination = () => useCandidateStore(state => state.pagination)

// Computed selectors
export const useCandidatesByStage = (stage: Candidate['stage']) => 
  useCandidateStore(state => 
    state.candidates.filter(candidate => candidate.stage === stage)
  )

export const useCandidatesByJob = (jobId: string) => 
  useCandidateStore(state => 
    state.candidates.filter(candidate => candidate.jobId === jobId)
  )

export const useCandidateById = (id: string) => 
  useCandidateStore(state => 
    state.candidates.find(candidate => candidate.id === id)
  )

// Search functionality
export const useFilteredCandidates = () => 
  useCandidateStore(state => {
    let filtered = state.candidates

    // Apply search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase()
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm)
      )
    }

    // Apply stage filter
    if (state.filters.stage) {
      filtered = filtered.filter(candidate => candidate.stage === state.filters.stage)
    }

    // Apply job filter
    if (state.filters.jobId) {
      filtered = filtered.filter(candidate => candidate.jobId === state.filters.jobId)
    }

    return filtered
  })

// Kanban board data
export const useKanbanData = () => 
  useCandidateStore(state => {
    const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']
    
    return stages.map(stage => ({
      stage,
      candidates: state.candidates.filter(candidate => candidate.stage === stage)
    }))
  })

export const useCandidatesActions = () => useCandidateStore(state => ({
  fetchCandidates: state.fetchCandidates,
  createCandidate: state.createCandidate,
  updateCandidate: state.updateCandidate,
  addNote: state.addNote,
  moveStage: state.moveStage,
  setFilters: state.setFilters,
  setPage: state.setPage
}))