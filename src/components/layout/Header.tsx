
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const location = useLocation()
  
  const navigationItems = [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'Assessments', href: '/assessments/new' },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/jobs') {
      return location.pathname === '/jobs' || location.pathname.startsWith('/jobs/')
    }
    if (href === '/candidates') {
      return location.pathname === '/candidates' || location.pathname.startsWith('/candidates/')
    }
    if (href.startsWith('/assessments')) {
      return location.pathname.startsWith('/assessments')
    }
    return location.pathname === href
  }

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
                variant={isActiveRoute(item.href) ? 'default' : 'ghost'}
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

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </header>
  )
}