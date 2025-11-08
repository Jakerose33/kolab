import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Tag, DollarSign, Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { DatePickerWithRange } from './ui/date-range-picker'
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

interface AdvancedSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  categories: Array<{ id: string; name: string; count: number }>
  onClose?: () => void
}

export function AdvancedSearchFilters({ 
  filters, 
  onFiltersChange, 
  categories,
  onClose 
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  const timeSlots = [
    { id: 'morning', label: 'Morning (6 AM - 12 PM)', value: 'morning' },
    { id: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', value: 'afternoon' },
    { id: 'evening', label: 'Evening (6 PM - 12 AM)', value: 'evening' },
    { id: 'night', label: 'Night (12 AM - 6 AM)', value: 'night' }
  ]

  const eventTypes = [
    { id: 'networking', label: 'Networking' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'conference', label: 'Conference' },
    { id: 'social', label: 'Social Event' },
    { id: 'meetup', label: 'Meetup' },
    { id: 'exhibition', label: 'Exhibition' },
    { id: 'performance', label: 'Performance' },
    { id: 'competition', label: 'Competition' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Date (Upcoming)' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'newest', label: 'Recently Added' },
    { value: 'distance', label: 'Distance' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'capacity', label: 'Capacity' }
  ]

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const toggleArrayFilter = (key: 'categories' | 'timeOfDay' | 'eventType', value: string) => {
    const currentArray = localFilters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose?.()
  }

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      dateRange: undefined,
      location: '',
      categories: [],
      priceRange: [0, 500],
      capacity: undefined,
      timeOfDay: [],
      eventType: [],
      sortBy: 'date',
      distance: 50
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.query) count++
    if (localFilters.dateRange) count++
    if (localFilters.location) count++
    if (localFilters.categories.length > 0) count++
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 500) count++
    if (localFilters.capacity) count++
    if (localFilters.timeOfDay.length > 0) count++
    if (localFilters.eventType.length > 0) count++
    return count
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <Input
            placeholder="Search events, organizers, topics..."
            value={localFilters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <DatePickerWithRange
            date={localFilters.dateRange}
            onDateChange={(date) => updateFilter('dateRange', date)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            placeholder="City, venue, or address..."
            value={localFilters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
          <div className="flex items-center gap-2 mt-2">
            <Label className="text-xs">Distance:</Label>
            <Slider
              value={[localFilters.distance]}
              onValueChange={([value]) => updateFilter('distance', value)}
              max={100}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-12">
              {localFilters.distance}km
            </span>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={localFilters.categories.includes(category.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('categories', category.id)}
                className="h-8"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Event Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Event Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {eventTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={localFilters.eventType.includes(type.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      toggleArrayFilter('eventType', type.id)
                    } else {
                      toggleArrayFilter('eventType', type.id)
                    }
                  }}
                />
                <Label htmlFor={type.id} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time of Day */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time of Day
          </Label>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="flex items-center space-x-2">
                <Checkbox
                  id={slot.id}
                  checked={localFilters.timeOfDay.includes(slot.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      toggleArrayFilter('timeOfDay', slot.value)
                    } else {
                      toggleArrayFilter('timeOfDay', slot.value)
                    }
                  }}
                />
                <Label htmlFor={slot.id} className="text-sm">
                  {slot.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </Label>
          <div className="space-y-2">
            <Slider
              value={localFilters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${localFilters.priceRange[0]}</span>
              <span>${localFilters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Minimum Capacity
          </Label>
          <Input
            type="number"
            placeholder="Number of attendees"
            value={localFilters.capacity || ''}
            onChange={(e) => updateFilter('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
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

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}