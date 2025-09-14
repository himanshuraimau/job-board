import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { PageContainer } from './PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export function ErrorBoundaryPage() {
  const error = useRouteError()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/jobs'
  }

  let errorMessage = 'An unexpected error occurred'
  let errorDetails = 'Something went wrong while loading the page.'
  let statusCode: number | undefined

  if (isRouteErrorResponse(error)) {
    statusCode = error.status
    errorMessage = error.statusText || `Error ${error.status}`
    
    switch (error.status) {
      case 404:
        errorMessage = 'Page Not Found'
        errorDetails = 'The page you are looking for does not exist.'
        break
      case 403:
        errorMessage = 'Access Forbidden'
        errorDetails = 'You do not have permission to access this page.'
        break
      case 500:
        errorMessage = 'Internal Server Error'
        errorDetails = 'Something went wrong on our end. Please try again later.'
        break
      default:
        errorDetails = error.data?.message || errorDetails
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorDetails = error.stack || 'Check the console for more details.'
  }

  return (
    <AppLayout>
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                {statusCode && <span className="text-destructive mr-2">{statusCode}</span>}
                {errorMessage}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {errorDetails}
              </p>
              
              {process.env.NODE_ENV === 'development' && error instanceof Error && error.stack && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Show technical details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={handleRefresh} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleGoHome} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppLayout>
  )
}
