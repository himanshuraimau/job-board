import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { JobsPageWithQuery, JobDetailPage, CandidatesPage, CandidateProfilePage, AssessmentPage } from './pages'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundaryPage } from './components/layout/ErrorBoundaryPage'

// Root layout component that wraps all routes
function RootLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/jobs" replace />
      },
      {
        path: 'jobs',
        element: <JobsPageWithQuery />
      },
      {
        path: 'jobs/:jobId',
        element: <JobDetailPage />
      },
      {
        path: 'candidates',
        element: <CandidatesPage />
      },
      {
        path: 'candidates/:id',
        element: <CandidateProfilePage />
      },
      {
        path: 'assessments/:jobId',
        element: <AssessmentPage />
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
        )
      }
    ]
  }
])
