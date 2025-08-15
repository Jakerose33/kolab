import { useState, useRef, useEffect } from 'react'
import { Search, Clock, TrendingUp, X, Filter } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'

interface SmartSearchBoxProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  suggestions: string[]
  popularSearches: string[]
  onShowAdvancedFilters?: () => void
  placeholder?: string
  className?: string
}

export function SmartSearchBox({
  value,
  onChange,
  onSearch,
  suggestions,
  popularSearches,
  onShowAdvancedFilters,
  placeholder = "Search events, organizers, topics...",
  className
}: SmartSearchBoxProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  const allSuggestions = value.trim() ? suggestions : popularSearches
  const hasAnySuggestions = allSuggestions.length > 0

  useEffect(() => {
    if (focusedIndex >= 0 && suggestionRefs.current[focusedIndex]) {
      suggestionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest'
      })
    }
  }, [focusedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !hasAnySuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0) {
          const selectedSuggestion = allSuggestions[focusedIndex]
          handleSuggestionSelect(selectedSuggestion)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    setFocusedIndex(-1)
  }

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim())
      setShowSuggestions(false)
      setFocusedIndex(-1)
    }
  }

  const handleFocus = () => {
    setShowSuggestions(true)
    setFocusedIndex(-1)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false)
      setFocusedIndex(-1)
    }, 200)
  }

  const clearSearch = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {onShowAdvancedFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowAdvancedFilters}
              className="h-8 px-2"
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && hasAnySuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {/* Header */}
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {value.trim() ? (
                    <>
                      <Search className="h-4 w-4" />
                      Search suggestions
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Popular searches
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Suggestions List */}
              <div className="py-2">
                {allSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    ref={(el) => suggestionRefs.current[index] = el}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors",
                      focusedIndex === index && "bg-muted"
                    )}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {value.trim() ? (
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{suggestion}</span>
                  </div>
                ))}
              </div>

              {/* Footer with action buttons */}
              {value.trim() && (
                <>
                  <Separator />
                  <div className="p-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSearch}
                      className="w-full text-sm"
                    >
                      <Search className="h-3 w-3 mr-2" />
                      Search for "{value.trim()}"
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}