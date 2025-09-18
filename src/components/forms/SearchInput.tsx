import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  value?: string
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  enableAutoSearch?: boolean
}

export function SearchInput({
  value = '',
  onSearch,
  placeholder = 'Search...',
  className,
  disabled = false,
  enableAutoSearch = false
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isSearching, setIsSearching] = useState(false)

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  const handleSearch = useCallback(() => {
    setIsSearching(true)
    onSearch(inputValue.trim())
    setTimeout(() => setIsSearching(false), 500)
  }, [inputValue, onSearch])

  const handleClear = useCallback(() => {
    setInputValue('')
    onSearch('')
  }, [onSearch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // If auto search is enabled and input is cleared, trigger search immediately
    if (enableAutoSearch && newValue === '') {
      onSearch('')
    }
  }, [enableAutoSearch, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  return (
    <div className={cn('relative flex gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10',
            inputValue && 'pr-10'
          )}
        />
        
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <Button
        onClick={handleSearch}
        disabled={disabled || isSearching}
        size="default"
        className="shrink-0"
      >
        {isSearching ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="sr-only">Search</span>
      </Button>
    </div>
  )
}