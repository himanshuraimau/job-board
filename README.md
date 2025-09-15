# TalentFlow - Mini Hiring Platform

A modern, React-based hiring platform that enables HR teams to manage jobs, candidates, and assessments efficiently. This is a fully-featured front-end application with simulated backend functionality.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Features

### ✅ Jobs Management
- **Job Board**: Paginated job listings with advanced filtering
  - Filter by: title, status, tags
  - Sort functionality with multiple options
  - Real-time search capabilities
- **CRUD Operations**: 
  - Create/Edit jobs with modal interface
  - Advanced validation: required title, unique slug
  - Archive/Unarchive functionality
  - Drag-and-drop reordering with optimistic updates
  - Automatic rollback on failure
- **Deep Linking**: Direct access via `/jobs/:jobId`

### ✅ Candidate Management
- **Virtualized List**: Efficiently handles 1000+ candidates
  - Client-side search: name, email
  - Server-like filtering by current stage
  - Optimized rendering for large datasets
- **Candidate Profiles**: Individual candidate pages with status timeline
- **Kanban Board**: Drag-and-drop stage management
  - Stages: Applied → Screen → Tech → Offer → Hired/Rejected
  - Visual progress tracking
- **Notes System**: Collaborative note-taking with @mention functionality
  - Real-time mention suggestions
  - Team member tagging

### ✅ Assessment System
- **Assessment Builder**: Per-job assessment creation
  - 6 Question types: single-choice, multi-choice, text (short/long), numeric, file upload
  - Live preview pane with real-time updates
  - Advanced conditional logic support
- **Form Runtime**: 
  - Comprehensive validation rules (required, range, length)
  - Dynamic conditional questions
  - Local persistence with auto-save
  - Progress tracking

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS + Radix UI
- **State Management**: Zustand with optimistic updates
- **Data Layer**: IndexedDB (Dexie.js) + MSW for API simulation
- **Performance**: React Virtual for list virtualization, @dnd-kit for drag-and-drop

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components  
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
│       ├── jobs/        # Job management
│       ├── candidates/  # Candidate management
│       └── assessments/ # Assessment system
├── pages/               # Page components
├── stores/              # Zustand stores with optimistic updates
├── services/            # Database services (IndexedDB)
├── mocks/              # MSW handlers and data generators
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

## 🎯 Performance Features

### Optimistic Updates
All operations use optimistic updates with automatic rollback:
1. **Immediate UI Update**: Changes apply instantly to local state
2. **Background Sync**: API call processes in the background  
3. **Success**: Local state updates with server response
4. **Failure**: Automatic rollback to previous state

### Virtualization
- **Large Dataset Handling**: Efficiently renders 1000+ candidates
- **Memory Optimization**: Only renders visible items
- **Smooth Scrolling**: Optimized scroll performance

### Data Persistence
- **IndexedDB Storage**: Persistent local storage using Dexie
- **Auto-Save**: Automatic draft saving for assessments
- **State Restoration**: App restores from local storage on refresh

## 🔄 API Simulation

### Mock Service Worker (MSW)
Simulates realistic backend behavior:
- **Latency**: 200-1200ms random delay
- **Error Rate**: 7.5% failure rate on write operations
- **Data Consistency**: Maintains data relationships

### Available Endpoints
- **Jobs**: `GET /api/jobs`, `POST /api/jobs`, `PATCH /api/jobs/:id`, `PATCH /api/jobs/:id/reorder`
- **Candidates**: `GET /api/candidates`, `POST /api/candidates`, `PATCH /api/candidates/:id`, `GET /api/candidates/:id/timeline`
- **Assessments**: `GET /api/assessments/:jobId`, `PUT /api/assessments/:jobId`, `POST /api/assessments/:jobId/submit`

## 📊 Data Requirements

### Seed Data
- **25 Jobs**: Mix of active/archived status with realistic data
- **1000+ Candidates**: Randomly distributed across jobs and stages
- **3+ Assessments**: Each with 10+ questions of various types

### Data Validation
- **Job Validation**: Required fields, unique slugs, proper formatting
- **Assessment Validation**: Question dependencies, conditional logic validation
- **Form Validation**: Comprehensive client-side validation with real-time feedback

## 🧪 Testing & Quality

### Code Quality
- **TypeScript**: Strict mode with comprehensive type definitions
- **ESLint**: Configured with React and TypeScript rules
- **Performance**: Optimized rendering with React.memo and useMemo

### Error Handling
- **Graceful Degradation**: Comprehensive error boundaries
- **User Feedback**: Clear error messages and retry mechanisms
- **Rollback Logic**: Automatic state recovery on failures

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The `dist` folder contains the production build
```

### Environment Requirements
- **Node.js**: 18+ recommended
- **Modern Browser**: Support for ES2020+
- **Local Storage**: IndexedDB support required

### Production Considerations
- **Static Hosting**: Can be deployed to Vercel, Netlify, or any static host
- **Build Size**: Optimized bundle with code splitting
- **Browser Support**: Modern browsers with ES2020+ support

## 📝 Development Guide

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5173`

### Key Development Patterns
- **Optimistic Updates**: All mutations use optimistic updates
- **Error Boundaries**: Comprehensive error handling
- **Performance**: Memoization and virtualization for large datasets
- **Type Safety**: Full TypeScript coverage

### Store Architecture
```typescript
// Example store usage
const { jobs, loading, error } = useJobsData()
const { createJob, updateJob, reorderJobs } = useJobsActions()

// Optimistic update with rollback
try {
  await createJob(jobData)
  // UI updates immediately
} catch (error) {
  // Automatic rollback to previous state
}
```

## 🎨 UI/UX Features

### Design System
- **Consistent**: shadcn/ui component library
- **Responsive**: Mobile-first design approach
- **Accessible**: ARIA compliance and keyboard navigation
- **Modern**: Clean, professional interface

### User Experience
- **Real-time Updates**: Instant feedback on all actions
- **Loading States**: Comprehensive loading indicators
- **Error Recovery**: Clear error messages with retry options
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

## 📋 Requirements Coverage

✅ **Jobs Management**: Complete with validation, reordering, deep linking  
✅ **Candidate Management**: Virtualized lists, kanban, profiles, timeline, notes  
✅ **Assessment System**: Builder, all question types, conditional logic, runtime  
✅ **API Simulation**: MSW with proper latency and error rates  
✅ **Data Persistence**: IndexedDB with state restoration  
✅ **Performance**: Optimistic updates, virtualization, efficient state management  
✅ **UI/UX**: Responsive design, loading states, error handling  

## 🏆 Key Achievements

- **Scalable Architecture**: Handles 1000+ candidates efficiently
- **Robust Error Handling**: Comprehensive error boundaries and recovery
- **Advanced Features**: Conditional logic, drag-and-drop, @mentions
- **Production Ready**: Optimized builds, comprehensive validation
- **Type Safety**: Full TypeScript coverage with strict mode

---

Built with ❤️ using React, TypeScript, and modern web technologies.