import { useState, useEffect,useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  value?: string
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  disabled?: boolean
}

export function SearchInput({
  value = '',
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  disabled = false
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const onSearchRef = useRef(onSearch)

  // Update ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  // Effect to handle debounced search - stable reference
  useEffect(() => {
    setIsDebouncing(true)
    const timeoutId = setTimeout(() => {
      onSearchRef.current(inputValue)
      setIsDebouncing(false)
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)
      setIsDebouncing(false)
    }
  }, [inputValue, debounceMs]) // Removed onSearch from dependencies

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue])

  const handleClear = () => {
    setInputValue('')
    onSearch('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
      
      {isDebouncing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  )
}