import { useState } from 'react'
import { Search, Filter, SlidersHorizontal, MapPin, Calendar, Users, Tag, DollarSign, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { DateRangePicker } from './ui/date-range-picker'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface EnhancedSearchFiltersProps {
  filters: {
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
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  suggestions: string[]
  className?: string
}

const categories = [
  { id: 'networking', label: 'Networking', icon: Users },
  { id: 'tech', label: 'Technology', icon: Zap },
  { id: 'creative', label: 'Creative', icon: Tag },
  { id: 'business', label: 'Business', icon: DollarSign },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'educational', label: 'Educational', icon: Tag },
]

const timeSlots = [
  { id: 'morning', label: 'Morning (6AM - 12PM)' },
  { id: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { id: 'evening', label: 'Evening (6PM - 12AM)' },
  { id: 'night', label: 'Night (12AM - 6AM)' },
]

const eventTypes = [
  'workshop', 'conference', 'meetup', 'party', 'exhibition', 'performance', 'market', 'festival'
]

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Date (Earliest)' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'capacity', label: 'Largest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

export function EnhancedSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  suggestions,
  className
}: EnhancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleCategory = (categoryId: string) => {
    const categories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId]
    updateFilter('categories', categories)
  }

  const toggleTimeSlot = (timeSlot: string) => {
    const timeOfDay = filters.timeOfDay.includes(timeSlot)
      ? filters.timeOfDay.filter(t => t !== timeSlot)
      : [...filters.timeOfDay, timeSlot]
    updateFilter('timeOfDay', timeOfDay)
  }

  const toggleEventType = (eventType: string) => {
    const types = filters.eventType.includes(eventType)
      ? filters.eventType.filter(t => t !== eventType)
      : [...filters.eventType, eventType]
    updateFilter('eventType', types)
  }

  const activeFiltersCount = [
    filters.location,
    filters.categories.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
    filters.capacity,
    filters.timeOfDay.length > 0,
    filters.eventType.length > 0,
    filters.dateRange?.from
  ].filter(Boolean).length

  return (
    <Card className={cn("border-2 border-primary/20", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Smart Search with Suggestions */}
        <div className="space-y-2">
          <Label>Smart Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, topics, organizers..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      updateFilter('query', suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <DateRangePicker
            selected={filters.dateRange}
            onSelect={(range) => updateFilter('dateRange', range)}
            placeholder="Select date range..."
          />
        </div>

        {/* Location with Distance */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location & Distance
          </Label>
          <Input
            placeholder="City, neighborhood, or venue..."
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Label className="text-sm">Within {filters.distance}km</Label>
            <Slider
              value={[filters.distance]}
              onValueChange={([value]) => updateFilter('distance', value)}
              max={50}
              min={1}
              step={1}
              className="flex-1"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm",
                  filters.categories.includes(category.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted border-border"
                )}
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range (${filters.priceRange[0]} - ${filters.priceRange[1]})
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(range) => updateFilter('priceRange', range)}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Free</span>
                <span>$1000+</span>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Minimum Capacity
              </Label>
              <Input
                type="number"
                placeholder="Minimum attendees"
                value={filters.capacity || ''}
                onChange={(e) => updateFilter('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
              />
            </div>

            {/* Time of Day */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Day
              </Label>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot.id}
                      checked={filters.timeOfDay.includes(slot.id)}
                      onCheckedChange={() => toggleTimeSlot(slot.id)}
                    />
                    <Label htmlFor={slot.id} className="text-sm font-normal">
                      {slot.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Types */}
            <div className="space-y-3">
              <Label>Event Types</Label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.eventType.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEventType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI-Powered Features */}
        <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <Label className="font-medium">AI-Powered Features</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Smart Recommendations</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Predictive Search</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Personalized Results</Label>
              <Switch />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}