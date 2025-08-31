import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { isValidRouteId } from '@/utils/routing'

type Props = { 
  className?: string;
  eventId?: string;
}

export default function BookingCTA({ className, eventId }: Props) {
  const nav = useNavigate()
  const location = useLocation()
  
  // Only use eventId if it's valid
  const currentEventId = isValidRouteId(eventId) ? eventId : null

  const onClick = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const authed = !!data?.session

      if (!authed) {
        // Send guests to sign-in and bounce them back here afterwards
        nav(`/auth?next=${encodeURIComponent(location.pathname)}`)
        return
      }

      // Navigate to event-specific booking flow if valid ID exists
      if (currentEventId) {
        nav(`/events/${currentEventId}/book`)
      } else {
        // Fallback to general bookings page
        nav('/bookings')
      }
    } catch (error) {
      console.error('BookingCTA navigation error:', error)
      // Fallback navigation
      nav('/bookings')
    }
  }

  // Disable button if no valid event ID
  if (!currentEventId) {
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