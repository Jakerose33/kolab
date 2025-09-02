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
import { EventFilters } from '@/hooks/useEventsData';

interface UnifiedEventFiltersProps {
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

export default function UnifiedEventFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  className = "" 
}: UnifiedEventFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && 
    !(Array.isArray(value) && value.length === 0)
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Events</Label>
          <Input
            id="search"
            placeholder="Search by title, description, venue..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label>Categories</Label>
          <Select
            value={filters.categories?.length === 1 ? filters.categories[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateFilter('categories', []);
              } else {
                updateFilter('categories', [value]);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((category) => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="minPrice" className="text-xs">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxPrice" className="text-xs">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(new Date(filters.startDate), 'MMM dd') : 'Any date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={(date) => updateFilter('startDate', date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(new Date(filters.endDate), 'MMM dd') : 'Any date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={(date) => updateFilter('endDate', date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Location & Radius */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">Search Area</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter city, neighborhood, or address..."
                value={filters.address || ''}
                onChange={(e) => updateFilter('address', e.target.value)}
              />
            </div>
            {filters.address && (
              <div className="space-y-2">
                <Label className="text-xs">
                  Radius: {filters.radius || 10} km
                </Label>
                <Slider
                  value={[filters.radius || 10]}
                  onValueChange={(value) => updateFilter('radius', value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {Object.values(filters).filter(v => 
                  v !== undefined && v !== null && v !== '' &&
                  !(Array.isArray(v) && v.length === 0)
                ).length} filter(s) active
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}