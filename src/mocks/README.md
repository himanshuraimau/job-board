# MSW (Mock Service Worker) Setup

This directory contains the MSW configuration for the TalentFlow application, providing realistic API mocking with latency simulation and error handling.

## Overview

MSW intercepts network requests at the service worker level, allowing us to:
- Simulate realistic API responses with proper data structures
- Add artificial latency (200-1200ms) to mimic real network conditions
- Simulate failure scenarios (5-10% failure rate) for error handling testing
- Maintain data persistence during development sessions
- Support both browser and Node.js environments

## Files Structure

```
src/mocks/
├── README.md           # This documentation
├── index.ts           # Main exports
├── handlers.ts        # MSW request handlers
├── browser.ts         # Browser-specific MSW setup
├── server.ts          # Node.js/testing MSW setup
└── generators.ts      # Mock data generators
```

## Features

### 🎯 Realistic API Simulation
- **Latency Simulation**: Random delays between 200-1200ms
- **Error Simulation**: 7.5% failure rate for testing error handling
- **Data Persistence**: Mock data persists during development session
- **Pagination Support**: Server-like pagination with proper metadata
- **Filtering & Search**: Full-featured filtering and search capabilities

### 📊 Generated Data
- **25 Jobs** with realistic titles, descriptions, and tags
- **1000+ Candidates** distributed across different hiring stages
- **3+ Assessments** with various question types and conditional logic
- **Timeline Events** for candidate activity tracking
- **Notes with @mentions** for collaboration features

### 🔧 API Endpoints

#### Jobs API
- `GET /api/jobs` - List jobs with pagination and filtering
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/reorder` - Reorder jobs

#### Candidates API
- `GET /api/candidates` - List candidates with pagination and filtering
- `GET /api/candidates/:id` - Get specific candidate
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `POST /api/candidates/:id/notes` - Add note to candidate

#### Assessments API
- `GET /api/assessments/:jobId` - Get assessment for job
- `PUT /api/assessments/:jobId` - Create/update assessment
- `POST /api/assessments/:assessmentId/responses` - Submit assessment response

## Usage

### Development Mode
MSW is automatically initialized in development mode via `src/main.tsx`:

```typescript
// MSW starts automatically in development
// Check browser console for "🔶 MSW: API mocking enabled"
```

### Testing Mode
For testing environments, use the server setup:

```typescript
import { startMockingServer, stopMockingServer } from '@/mocks/server'

beforeAll(() => startMockingServer())
afterAll(() => stopMockingServer())
```

### API Client Usage
Use the provided API client for consistent request handling:

```typescript
import { apiClient } from '@/lib/api'

// Fetch jobs with filtering
const response = await apiClient.getJobs({
  search: 'developer',
  status: 'active',
  page: 1,
  pageSize: 10
})

// Create new job
const newJob = await apiClient.createJob({
  title: 'Senior React Developer',
  slug: 'senior-react-developer',
  description: 'We are looking for...',
  status: 'active',
  tags: ['React', 'TypeScript', 'Senior'],
  order: 1
})
```

## Configuration

### Latency Simulation
Modify the latency range in `handlers.ts`:

```typescript
// Current: 200-1200ms
const simulateLatency = () => delay(200 + Math.random() * 1000)

// Custom range: 100-500ms
const simulateLatency = () => delay(100 + Math.random() * 400)
```

### Error Rate
Adjust the failure simulation rate:

```typescript
// Current: 7.5% failure rate
const simulateFailure = () => Math.random() < 0.075

// Custom: 10% failure rate
const simulateFailure = () => Math.random() < 0.1
```

### Seed Data
Modify the generated data in `generators.ts`:

```typescript
// Change the number of generated items
export function generateSeedData() {
  const jobs = generateJobs(50)        // Generate 50 jobs instead of 25
  const candidates = generateCandidates(2000, jobs.map(j => j.id)) // 2000 candidates
  const assessments = generateAssessments(jobs.map(j => j.id))
  
  return { jobs, candidates, assessments }
}
```

## Debugging

### Browser Console
MSW logs are visible in the browser console:
- `🔶 MSW: API mocking enabled` - MSW started successfully
- Request/response logs for debugging
- Error messages for failed requests

### Network Tab
MSW requests appear in the browser's Network tab with:
- Realistic response times
- Proper HTTP status codes
- JSON response bodies

### Troubleshooting

1. **MSW not starting**: Check that `public/mockServiceWorker.js` exists
2. **Requests not intercepted**: Verify the request URL matches handler patterns
3. **CORS issues**: MSW handles CORS automatically for intercepted requests
4. **Service worker conflicts**: Clear browser cache and restart dev server

## Requirements Satisfied

This MSW setup satisfies the following requirements:

- **4.2**: Simulates network latency between 200-1200ms ✅
- **4.3**: Simulates 5-10% failure rate for error handling testing ✅
- **Browser handlers**: Configured for development environment ✅
- **Server handlers**: Configured for testing environment ✅
- **Realistic data**: Generated seed data with proper relationships ✅
- **API coverage**: All required endpoints implemented ✅

## Next Steps

After MSW is configured, you can:
1. Implement Zustand stores that use the API client
2. Create React Query hooks for server state management
3. Build UI components that consume the mocked APIs
4. Test error handling and loading states
5. Develop optimistic updates with rollback functionality