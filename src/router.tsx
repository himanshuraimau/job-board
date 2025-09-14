import { createBrowserRouter, Navigate } from 'react-router-dom'
import { JobsPageWithQuery, JobDetailPage, CandidatesPage, CandidateProfilePage } from './pages'
import { ErrorBoundaryPage } from './components/layout/ErrorBoundaryPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/jobs" replace />,
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '/jobs',
    element: <JobsPageWithQuery />,
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '/jobs/:jobId',
    element: <JobDetailPage />,
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '/candidates',
    element: <CandidatesPage />,
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '/candidates/:id',
    element: <CandidateProfilePage />,
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '/assessments/:jobId',
    element: (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Assessment Builder</h1>
        <p className="text-muted-foreground">Assessment builder page will be implemented in a future update.</p>
      </div>
    ),
    errorElement: <ErrorBoundaryPage />
  },
  {
    path: '*',
    element: (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/jobs" className="text-primary hover:underline mt-4 inline-block">
          Go back to Jobs
        </a>
      </div>
    ),
    errorElement: <ErrorBoundaryPage />
  }
])
