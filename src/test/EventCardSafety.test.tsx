// Test file to verify EventCard safety guards
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from '@/components/events/EventCard';
import PreviewEventCard from '@/components/events/PreviewEventCard';

// Mock event with undefined ID
const mockEventWithoutId = {
  title: 'Test Event',
  description: 'Test description',
  start_at: '2024-01-01T00:00:00Z',
  venue_name: 'Test Venue'
  // id is intentionally missing
};

const mockEventWithNullId = {
  id: null,
  title: 'Test Event',
  description: 'Test description',
  start_at: '2024-01-01T00:00:00Z',
  venue_name: 'Test Venue'
};

const mockEventWithEmptyId = {
  id: '',
  title: 'Test Event',
  description: 'Test description',
  start_at: '2024-01-01T00:00:00Z',
  venue_name: 'Test Venue'
};

// Test component to verify safety guards work
export function EventCardSafetyTest() {
  return (
    <BrowserRouter>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div>
          <h3>Event without ID</h3>
          <EventCard event={mockEventWithoutId} />
        </div>
        <div>
          <h3>Event with null ID</h3>
          <EventCard event={mockEventWithNullId} />
        </div>
        <div>
          <h3>Event with empty ID</h3>
          <EventCard event={mockEventWithEmptyId} />
        </div>
        <div>
          <h3>Preview Event without ID</h3>
          <PreviewEventCard event={mockEventWithoutId} />
        </div>
        <div>
          <h3>Preview Event with null ID</h3>
          <PreviewEventCard event={mockEventWithNullId} />
        </div>
        <div>
          <h3>Preview Event with empty ID</h3>
          <PreviewEventCard event={mockEventWithEmptyId} />
        </div>
      </div>
    </BrowserRouter>
  );
}