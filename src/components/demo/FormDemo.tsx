import { useState } from 'react'
import { FormField, SearchInput, TagInput } from '@/components/forms'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FormDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tags, setTags] = useState<string[]>(['React', 'TypeScript'])
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (value.length < 2) {
      setNameError('Name must be at least 2 characters')
    } else {
      setNameError('')
    }
  }

  const tagSuggestions = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 
    'Node.js', 'Python', 'Java', 'Go', 'Rust'
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Components Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            label="Full Name"
            description="Enter your full name"
            error={nameError}
            required
          >
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="John Doe"
            />
          </FormField>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search Jobs</label>
            <SearchInput
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholder="Search for jobs..."
              debounceMs={500}
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Searching for: "{searchQuery}"
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add skills..."
              suggestions={tagSuggestions}
              maxTags={5}
            />
          </div>

          <Button>Submit</Button>
        </CardContent>
      </Card>
    </div>
  )
}