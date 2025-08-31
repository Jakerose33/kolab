import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Clock, DollarSign, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export interface EventFilters {
  search: string;
  category: string;
  date: Date | null;
  timeOfDay: string;
  radius: number;
  maxPrice: number;
  location: string;
}

interface AdvancedEventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const eventCategories = [
  'all',
  'art',
  'music',
  'technology',
  'business',
  'photography',
  'food',
  'sports',
  'workshop',
  'networking'
];

const timeSlots = [
  { value: 'all', label: 'Any Time' },
  { value: 'morning', label: 'Morning (6AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 11PM)' },
  { value: 'late', label: 'Late Night (11PM+)' }
];

export default function AdvancedEventFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}: AdvancedEventFiltersProps) {
  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.category !== 'all' ||
    filters.date ||
    filters.timeOfDay !== 'all' ||
    filters.radius !== 50 ||
    filters.maxPrice !== 200 ||
    filters.location;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Event Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Events</Label>
          <Input
            placeholder="Search by title, description, or venue..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.date ? format(filters.date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.date}
                onSelect={(date) => updateFilter('date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time of Day */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time of Day
          </Label>
          <Select value={filters.timeOfDay} onValueChange={(value) => updateFilter('timeOfDay', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            placeholder="Enter city, suburb, or address..."
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Radius */}
        <div className="space-y-3">
          <Label>Radius: {filters.radius}km</Label>
          <Slider
            value={[filters.radius]}
            onValueChange={(value) => updateFilter('radius', value[0])}
            max={100}
            min={1}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1km</span>
            <span>100km</span>
          </div>
        </div>

        {/* Max Price */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Max Price: ${filters.maxPrice}
          </Label>
          <Slider
            value={[filters.maxPrice]}
            onValueChange={(value) => updateFilter('maxPrice', value[0])}
            max={500}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Free</span>
            <span>$500+</span>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('category', 'all')}
                  />
                </Badge>
              )}
              {filters.date && (
                <Badge variant="secondary" className="gap-1">
                  {format(filters.date, 'MMM dd')}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('date', null)}
                  />
                </Badge>
              )}
              {filters.timeOfDay !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {timeSlots.find(s => s.value === filters.timeOfDay)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('timeOfDay', 'all')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}