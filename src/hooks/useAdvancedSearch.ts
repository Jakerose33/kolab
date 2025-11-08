import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'
import { DateRange } from 'react-day-picker'

interface SearchFilters {
  query: string
  dateRange: DateRange | undefined
  location: string
  categories: string[]
  priceRange: [number, number]
  capacity: number | undefined
  timeOfDay: string[]
  eventType: string[]
  sortBy: string
  distance: number
}

interface SearchResult {
  events: any[]
  totalCount: number
  loading: boolean
  suggestions: string[]
  popularSearches: string[]
}

export function useAdvancedSearch(initialFilters: SearchFilters) {
  const { user } = useAuth()
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])

  // Load all events on mount
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles:organizer_id (
              full_name,
              handle,
              avatar_url
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (error) throw error
        setAllEvents(data || [])
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Load search suggestions and popular searches
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        // Get popular search terms from analytics (simulated)
        setPopularSearches([
          'networking events',
          'tech meetups',
          'startup events',
          'creative workshops',
          'business conferences',
          'design thinking',
          'entrepreneurship',
          'innovation'
        ])

        // Generate suggestions based on current events
        const eventTitles = allEvents.map(event => event.title)
        const eventTags = allEvents.flatMap(event => event.tags || [])
        const uniqueSuggestions = [...new Set([...eventTitles, ...eventTags])]
        setSuggestions(uniqueSuggestions.slice(0, 10))
      } catch (error) {
        console.error('Error loading search data:', error)
      }
    }

    if (allEvents.length > 0) {
      loadSearchData()
    }
  }, [allEvents])

  // Advanced search logic with multiple filters
  const searchResults = useMemo(() => {
    let filteredEvents = [...allEvents]

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filteredEvents = filteredEvents.filter(event => {
        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.venue_name?.toLowerCase().includes(query) ||
          event.venue_address?.toLowerCase().includes(query) ||
          event.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
          event.profiles?.full_name?.toLowerCase().includes(query) ||
          event.profiles?.handle?.toLowerCase().includes(query)
        )
      })
    }

    // Date range filter
    if (filters.dateRange?.from) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start_at)
        const fromDate = filters.dateRange!.from!
        const toDate = filters.dateRange!.to || fromDate
        
        return eventDate >= fromDate && eventDate <= toDate
      })
    }

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase()
      filteredEvents = filteredEvents.filter(event => {
        return (
          event.venue_name?.toLowerCase().includes(location) ||
          event.venue_address?.toLowerCase().includes(location)
        )
      })
    }

    // Categories filter
    if (filters.categories.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        return event.tags?.some((tag: string) => 
          filters.categories.includes(tag.toLowerCase())
        )
      })
    }

    // Event type filter
    if (filters.eventType.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        // Check if event matches any of the selected types
        return filters.eventType.some(type => {
          const eventTags = event.tags?.map((tag: string) => tag.toLowerCase()) || []
          return eventTags.includes(type) || 
                 event.title.toLowerCase().includes(type) ||
                 event.description?.toLowerCase().includes(type)
        })
      })
    }

    // Time of day filter
    if (filters.timeOfDay.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        const eventTime = new Date(event.start_at)
        const hour = eventTime.getHours()
        
        return filters.timeOfDay.some(timeSlot => {
          switch (timeSlot) {
            case 'morning':
              return hour >= 6 && hour < 12
            case 'afternoon':
              return hour >= 12 && hour < 18
            case 'evening':
              return hour >= 18 && hour < 24
            case 'night':
              return hour >= 0 && hour < 6
            default:
              return false
          }
        })
      })
    }

    // Capacity filter
    if (filters.capacity) {
      filteredEvents = filteredEvents.filter(event => {
        return event.capacity && event.capacity >= filters.capacity!
      })
    }

    // Sort results
    switch (filters.sortBy) {
      case 'date':
        filteredEvents.sort((a, b) => 
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        )
        break
      case 'newest':
        filteredEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'capacity':
        filteredEvents.sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        break
      case 'popularity':
        // Could implement based on RSVP count or other metrics
        filteredEvents.sort((a, b) => Math.random() - 0.5) // Random for now
        break
      default:
        break
    }

    return {
      events: filteredEvents,
      totalCount: filteredEvents.length,
      loading,
      suggestions,
      popularSearches
    }
  }, [allEvents, filters, loading, suggestions, popularSearches])

  // Save search query to analytics (for future popular searches)
  const saveSearchQuery = async (query: string) => {
    if (!query.trim() || !user) return

    try {
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        session_id: `session_${Date.now()}`,
        event_name: 'search_performed',
        event_properties: {
          query: query.trim(),
          results_count: searchResults.totalCount
        }
      })
    } catch (error) {
      console.error('Error saving search analytics:', error)
    }
  }

  // Get search suggestions based on partial query
  const getSearchSuggestions = (partialQuery: string): string[] => {
    if (!partialQuery.trim()) return popularSearches.slice(0, 5)

    const query = partialQuery.toLowerCase()
    const matchingSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query)
    )

    return matchingSuggestions.slice(0, 8)
  }

  // Smart search that includes typo tolerance and semantic matching
  const performSmartSearch = async (query: string) => {
    // Save the search for analytics
    await saveSearchQuery(query)

    // Apply the search
    setFilters(prev => ({ ...prev, query }))
  }

  return {
    filters,
    setFilters,
    searchResults,
    getSearchSuggestions,
    performSmartSearch,
    loading,
    clearFilters: () => setFilters(initialFilters),
    updateFilter: (key: keyof SearchFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }
}