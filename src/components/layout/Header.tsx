
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const location = useLocation()
  
  const navigationItems = [
    { label: 'Jobs', href: '/jobs', matchPaths: ['/jobs'] },
    { label: 'Candidates', href: '/candidates', matchPaths: ['/candidates'] },
    { label: 'Assessments', href: '/assessments', matchPaths: ['/assessments'] },
  ]

  const isActiveRoute = (item: typeof navigationItems[0]) => {
    return item.matchPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    )
  }

  return (
    <header className={cn(
      'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container flex h-16 items-center justify-center">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">TalentFlow</h1>
          </div>
          
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={isActiveRoute(item) ? 'default' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
                asChild
              >
                <Link to={item.href}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        
        </div>
      </div>
    </header>
  )
}