import { useCallback } from 'react'
import { SearchInput } from '@/components/forms/SearchInput'
import { TagInput } from '@/components/forms/TagInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'
import type { JobFilters as JobFiltersType } from '@/types'

interface JobFiltersProps {
  filters: JobFiltersType
  onFiltersChange: (filters: Partial<JobFiltersType>) => void
  onClearFilters: () => void
  className?: string
}

// Common job tags for suggestions
const COMMON_TAGS = [
  'javascript',
  'typescript',
  'react',
  'node.js',
  'python',
  'java',
  'senior',
  'junior',
  'remote',
  'full-time',
  'part-time',
  'contract',
  'frontend',
  'backend',
  'fullstack',
  'devops',
  'design',
  'marketing',
  'sales'
]

export function JobFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  className 
}: JobFiltersProps) {
  const handleSearchChange = useCallback((search: string) => {
    onFiltersChange({ search: search || undefined })
  }, [onFiltersChange])

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.status || 
    (filters.tags && filters.tags.length > 0)
  )

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <SearchInput
              value={filters.search || ''}
              onSearch={handleSearchChange}
              placeholder="Search jobs by title..."
              enableAutoSearch={false}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ 
                  status: value === 'all' ? undefined : value as 'active' | 'archived' 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput
              value={filters.tags || []}
              onChange={(tags) => onFiltersChange({ tags: tags.length > 0 ? tags : undefined })}
              placeholder="Filter by tags..."
              suggestions={COMMON_TAGS}
              maxTags={5}
            />
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <div className="flex gap-2">
              <Select
                value={filters.sort || 'order'}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    sort: value as 'title' | 'createdAt' | 'order' 
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Custom Order</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.sortDirection || 'asc'}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    sortDirection: value as 'asc' | 'desc' 
                  })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}