import { useState } from 'react'
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { KolabHeader } from '@/components/KolabHeader'
import { SmartSearchBox } from '@/components/SmartSearchBox'
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters'
import { SearchResultsDisplay } from '@/components/SearchResultsDisplay'
import { SavedSearches } from '@/components/SavedSearches'
import { SaveSearchDialog } from '@/components/SaveSearchDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { DateRange } from 'react-day-picker'

const initialFilters = {
  query: '',
  dateRange: undefined as DateRange | undefined,
  location: '',
  categories: [],
  priceRange: [0, 500] as [number, number],
  capacity: undefined,
  timeOfDay: [],
  eventType: [],
  sortBy: 'date',
  distance: 50
}

export default function Search() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [userRSVPs, setUserRSVPs] = useState<Record<string, string>>({})

  const {
    filters,
    setFilters,
    searchResults,
    getSearchSuggestions,
    performSmartSearch,
    clearFilters,
    updateFilter
  } = useAdvancedSearch(initialFilters)

  // Generate categories from search results
  const categories = [
    { id: 'networking', name: 'Networking', count: 12 },
    { id: 'tech', name: 'Technology', count: 8 },
    { id: 'startup', name: 'Startup', count: 15 },
    { id: 'design', name: 'Design', count: 6 },
    { id: 'business', name: 'Business', count: 10 },
    { id: 'creative', name: 'Creative', count: 9 },
    { id: 'education', name: 'Education', count: 7 },
    { id: 'health', name: 'Health & Wellness', count: 4 },
    { id: 'finance', name: 'Finance', count: 5 },
    { id: 'marketing', name: 'Marketing', count: 8 }
  ]

  const handleShare = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`)
    toast({
      title: "Event link copied!",
      description: "Share this link to invite others to the event.",
    })
  }

  const handleClearFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'query':
        updateFilter('query', '')
        break
      case 'location':
        updateFilter('location', '')
        break
      case 'dateRange':
        updateFilter('dateRange', undefined)
        break
      case 'categories':
        if (value) {
          updateFilter('categories', filters.categories.filter(c => c !== value))
        }
        break
      case 'eventType':
        if (value) {
          updateFilter('eventType', filters.eventType.filter(t => t !== value))
        }
        break
      case 'timeOfDay':
        if (value) {
          updateFilter('timeOfDay', filters.timeOfDay.filter(t => t !== value))
        }
        break
    }
  }

  const activeFiltersForDisplay = {
    categories: filters.categories,
    eventType: filters.eventType,
    timeOfDay: filters.timeOfDay,
    location: filters.location,
    dateRange: filters.dateRange
  }

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader 
        onCreateEvent={() => {}}
        onOpenMessages={() => {}}
        onOpenNotifications={() => {}}
      />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          {/* Search Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Discover Events
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find events that match your interests, schedule, and location preferences
            </p>
          </div>

          {/* Smart Search Box */}
          <div className="max-w-2xl mx-auto">
            <SmartSearchBox
              value={filters.query}
              onChange={(value) => updateFilter('query', value)}
              onSearch={performSmartSearch}
              suggestions={getSearchSuggestions(filters.query)}
              popularSearches={searchResults.popularSearches}
              onShowAdvancedFilters={() => setShowAdvancedFilters(true)}
              placeholder="Search events, organizers, venues, or topics..."
            />
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4">
            {/* Mobile Advanced Filters */}
            <Sheet open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AdvancedSearchFilters
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      setFilters(newFilters)
                      setShowAdvancedFilters(false)
                    }}
                    categories={categories}
                    onClose={() => setShowAdvancedFilters(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Advanced Filters */}
            <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <DialogTrigger asChild className="hidden md:inline-flex">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Advanced Search Filters</DialogTitle>
                </DialogHeader>
                <AdvancedSearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  onClose={() => setShowAdvancedFilters(false)}
                />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            {user && filters.query && (
              <SaveSearchDialog
                query={filters.query}
                filters={filters}
              />
            )}
          </div>

          {/* Search Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <SearchResultsDisplay
                events={searchResults.events}
                totalCount={searchResults.totalCount}
                loading={searchResults.loading}
                query={filters.query}
                activeFilters={activeFiltersForDisplay}
                onClearFilter={handleClearFilter}
                onClearAllFilters={clearFilters}
                onShare={handleShare}
                userRSVPs={userRSVPs}
              />
            </div>
            
            <div className="lg:col-span-1">
              <SavedSearches />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}