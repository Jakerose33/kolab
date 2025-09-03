import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { isValidRouteId } from '@/utils/routing'

type Props = { 
  className?: string;
  eventId?: string;
  venueId?: string;
}

export default function BookingCTA({ className, eventId, venueId }: Props) {
  const nav = useNavigate()
  const location = useLocation()
  
  // Only use eventId or venueId if they're valid
  const currentEventId = isValidRouteId(eventId) ? eventId : null
  const currentVenueId = isValidRouteId(venueId) ? venueId : null

  const onClick = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const authed = !!data?.session

      if (!authed) {
        // Send guests to sign-in and bounce them back here afterwards
        window.location.href = `/auth?next=${encodeURIComponent(location.pathname)}`
        return
      }

      // Navigate to event-specific booking flow if valid ID exists
      if (currentEventId) {
        window.location.href = `/events/${currentEventId}/book`
      } else if (currentVenueId) {
        // Navigate to venue-specific booking flow
        window.location.href = `/venues/${currentVenueId}/book`
      } else {
        // Fallback to general bookings page
        window.location.href = '/bookings'
      }
    } catch (error) {
      console.error('BookingCTA navigation error:', error)
      // Fallback navigation
      window.location.href = '/bookings'
    }
  }

  // Disable button if no valid event or venue ID
  if (!currentEventId && !currentVenueId) {
    return (
      <Button
        disabled
        className={className}
        aria-label="Booking unavailable"
      >
        Booking Unavailable
      </Button>
    )
  }

  return (
    <Button
      data-testid="booking-request"
      aria-label="Request booking"
      onClick={onClick}
      className={className}
    >
      Request booking
    </Button>
  )
}