# TalentFlow - Mini Hiring Platform

## Project Overview

TalentFlow is a React-based hiring platform that enables HR teams to manage jobs, candidates, and assessments efficiently. This is a front-end only application with simulated backend functionality.

## Core Features

### 1. Jobs Management
- **Job Board**: List jobs with server-like pagination and filtering
  - Filter by: title, status, tags
  - Sort functionality
  - Search capabilities
- **Job Operations**:
  - Create/Edit jobs with modal interface
  - Validation: required title, unique slug
  - Archive/Unarchive functionality
  - Drag-and-drop reordering with optimistic updates
  - Rollback on failure handling
- **Deep Linking**: `/jobs/:jobId` for direct job access

### 2. Candidate Management
- **Candidate List**: Virtualized list supporting 1000+ candidates
  - Client-side search: name, email
  - Server-like filtering: current stage
- **Candidate Profile**: `/candidates/:id` route with status timeline
- **Kanban Board**: Drag-and-drop stage management
  - Stages: Applied → Screen → Tech → Offer → Hired/Rejected
- **Notes System**: Attach notes with @mention functionality

### 3. Assessment System
- **Assessment Builder**: Per-job assessment creation
  - Question types: single-choice, multi-choice, text (short/long), numeric, file upload
  - Live preview pane
  - Conditional logic support
- **Form Runtime**: 
  - Validation rules (required, range, length)
  - Conditional questions
  - Local persistence

## API Simulation

Using MSW/MirageJS to simulate REST endpoints:

### Jobs API
- `GET /jobs?search=&status=&page=&pageSize=&sort=`
- `POST /jobs` - Create job
- `PATCH /jobs/:id` - Update job
- `PATCH /jobs/:id/reorder` - Reorder jobs (with failure simulation)

### Candidates API
- `GET /candidates?search=&stage=&page=`
- `POST /candidates` - Create candidate
- `PATCH /candidates/:id` - Update candidate stage
- `GET /candidates/:id/timeline` - Get candidate history

### Assessments API
- `GET /assessments/:jobId` - Get job assessment
- `PUT /assessments/:jobId` - Update assessment
- `POST /assessments/:jobId/submit` - Submit response

## Data Requirements

### Seed Data
- **25 Jobs**: Mix of active/archived status
- **1000+ Candidates**: Randomly distributed across jobs and stages
- **3+ Assessments**: Each with 10+ questions

### Data Persistence
- **Local Storage**: IndexedDB via Dexie/localForage
- **Network Simulation**: MSW/Mirage with artificial latency (200-1200ms)
- **Error Simulation**: 5-10% failure rate on write operations
- **State Restoration**: App restores from local storage on refresh

## Technical Requirements

### Performance
- Virtualized lists for large datasets
- Optimistic updates with rollback
- Efficient state management

### User Experience
- Real-time updates
- Loading states
- Error handling
- Responsive design

## Deliverables

1. **Deployed Application**: Live demo link
2. **Source Code**: GitHub repository
3. **Documentation**: 
   - Setup instructions
   - Architecture overview
   - Technical decisions
   - Known issues

## Evaluation Criteria

- **Code Quality**: Clean, maintainable, well-structured code
- **App Structure**: Proper organization and architecture
- **Functionality**: Complete feature implementation
- **UI/UX**: Intuitive and responsive interface
- **State Management**: Efficient data flow
- **Deployment**: Successful deployment and accessibility
- **Documentation**: Clear and comprehensive docs
