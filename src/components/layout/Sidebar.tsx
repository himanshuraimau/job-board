
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Briefcase, 
  Users, 
  FileText, 
  BarChart3,
  Settings
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  // Navigation items with icons
  const navigationItems = [
    { 
      label: 'Jobs', 
      href: '/jobs', 
      icon: Briefcase,
      active: true 
    },
    { 
      label: 'Candidates', 
      href: '/candidates', 
      icon: Users,
      active: false 
    },
    { 
      label: 'Assessments', 
      href: '/assessments', 
      icon: FileText,
      active: false 
    },
    { 
      label: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      active: false 
    },
  ]

  return (
    <aside className={cn(
      'w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto py-6">
          <nav className="space-y-2 px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.label}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </aside>
  )
}