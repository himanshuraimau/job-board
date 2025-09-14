import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function PageContainer({ 
  children, 
  className, 
  title, 
  description, 
  actions 
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {(title || description || actions) && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 container py-6">
        {children}
      </div>
    </div>
  )
}