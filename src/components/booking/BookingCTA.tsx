import { Button } from '@/components/ui/button'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type Props = { 
  className?: string;
  eventId?: string;
}

export default function BookingCTA({ className, eventId }: Props) {
  const nav = useNavigate()
  const location = useLocation()
  const params = useParams()
  
  // Get eventId from props or URL params
  const currentEventId = eventId || params.id

  const onClick = async () => {
    const { data } = await supabase.auth.getSession()
    const authed = !!data?.session

    if (!authed) {
      // Send guests to sign-in and bounce them back here afterwards
      nav(`/auth?next=${encodeURIComponent(location.pathname)}`)
      return
    }

    // Navigate to event-specific booking flow
    if (currentEventId) {
      nav(`/events/${currentEventId}/book`)
    } else {
      // Fallback to general bookings page
      nav('/bookings')
    }
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