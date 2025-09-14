
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  // For now, we'll use simple navigation without React Router
  // This will be updated when routing is implemented in task 8
  const navigationItems = [
    { label: 'Jobs', href: '/jobs', active: true },
    { label: 'Candidates', href: '/candidates', active: false },
    { label: 'Assessments', href: '/assessments', active: false },
  ]

  return (
    <header className={cn(
      'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">TalentFlow</h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'default' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </header>
  )
}