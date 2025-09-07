import { Calendar, MapPin, Users, Clock, Filter, SortAsc } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Separator } from './ui/separator'
import EventCard from './events/EventCard'
import { getEventLink, normalizeEvent } from '@/lib/links'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { cn } from '@/lib/utils'


interface SearchResultsDisplayProps {
  events: any[]
  totalCount: number
  loading: boolean
  query: string
  activeFilters: {
    categories: string[]
    eventType: string[]
    timeOfDay: string[]
    location: string
    dateRange: any
  }
  onClearFilter: (filterType: string, value?: string) => void
  onClearAllFilters: () => void
  onShare: (eventId: string) => void
  userRSVPs: Record<string, string>
  className?: string
}

export function SearchResultsDisplay({
  events,
  totalCount,
  loading,
  query,
  activeFilters,
  onClearFilter,
  onClearAllFilters,
  onShare,
  userRSVPs,
  className
}: SearchResultsDisplayProps) {
  const hasActiveFilters = 
    activeFilters.categories.length > 0 ||
    activeFilters.eventType.length > 0 ||
    activeFilters.timeOfDay.length > 0 ||
    activeFilters.location ||
    activeFilters.dateRange

  const getFilterDisplayName = (filterType: string, value: string) => {
    switch (filterType) {
      case 'categories':
        return value.charAt(0).toUpperCase() + value.slice(1)
      case 'eventType':
        return value.replace(/([A-Z])/g, ' $1').trim()
      case 'timeOfDay':
        return value.charAt(0).toUpperCase() + value.slice(1)
      default:
        return value
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <LoadingState />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {query ? `Search Results` : 'All Events'}
          </h2>
          <p className="text-muted-foreground">
            {query && (
              <>
                Showing results for "<span className="font-medium">{query}</span>" • 
              </>
            )}
            <span className="font-medium">{totalCount}</span> event{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {/* Sort and View Options */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(hasActiveFilters || query) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Filters</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Search Query */}
                  {query && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{query}"
                      <button
                        onClick={() => onClearFilter('query')}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}

                  {/* Location Filter */}
                  {activeFilters.location && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {activeFilters.location}
                      <button
                        onClick={() => onClearFilter('location')}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}

                  {/* Date Range Filter */}
                  {activeFilters.dateRange && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Date range
                      <button
                        onClick={() => onClearFilter('dateRange')}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  )}

                  {/* Category Filters */}
                  {activeFilters.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="gap-1">
                      #{getFilterDisplayName('categories', category)}
                      <button
                        onClick={() => onClearFilter('categories', category)}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}

                  {/* Event Type Filters */}
                  {activeFilters.eventType.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {getFilterDisplayName('eventType', type)}
                      <button
                        onClick={() => onClearFilter('eventType', type)}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}

                  {/* Time of Day Filters */}
                  {activeFilters.timeOfDay.map((time) => (
                    <Badge key={time} variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {getFilterDisplayName('timeOfDay', time)}
                      <button
                        onClick={() => onClearFilter('timeOfDay', time)}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {(hasActiveFilters || query) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Search Results */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const link = getEventLink(event);
            if (!link) return null;

            const n = normalizeEvent(event);
            return (
              <div
                key={String(n.id)}
                onClick={() => window.location.href = link}
                aria-label={`Open ${n.title}`}
                className="block cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <EventCard event={event} />
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={query ? "No events found" : "No events available"}
          description={
            query
              ? `No events match your search for "${query}". Try adjusting your filters or search terms.`
              : "No events are currently available. Check back later or create your own event!"
          }
          action={{
            label: "Clear filters",
            onClick: onClearAllFilters
          }}
        />
      )}

      {/* Load More / Pagination (if needed) */}
      {events.length > 0 && events.length < totalCount && (
        <div className="flex justify-center pt-8">
          <Button variant="outline">
            Load more events
          </Button>
        </div>
      )}
    </div>
  )
}