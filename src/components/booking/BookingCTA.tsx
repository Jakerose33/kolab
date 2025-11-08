import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { isValidRouteId } from '@/utils/routing'

type Props = { 
  className?: string;
  eventId?: string;
  venueId?: string;
}

export default function BookingCTA({ className, eventId, venueId }: Props) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  // Only use eventId or venueId if they're valid
  const currentEventId = isValidRouteId(eventId) ? eventId : null
  const currentVenueId = isValidRouteId(venueId) ? venueId : null

  // Determine navigation target based on auth status
  const getNavigationTarget = () => {
    if (!isAuthenticated) {
      return `/auth?next=${encodeURIComponent(location.pathname)}`
    }
    
    // Navigate to event-specific booking flow if valid ID exists
    if (currentEventId) {
      return `/events/${currentEventId}/book`
    } else if (currentVenueId) {
      // Navigate to venue-specific booking flow
      return `/venues/${currentVenueId}/book`
    } else {
      // Fallback to general bookings page
      return '/bookings'
    }
  }

  // Determine button text based on auth status
  const getButtonText = () => {
    return isAuthenticated ? 'Book Now' : 'Sign In to Book'
  }

  const navigationTarget = getNavigationTarget()
  const buttonText = getButtonText()

  // Always show button with proper test ID, even if no valid IDs
  return (
    <Link to={navigationTarget}>
      <Button
        data-testid="booking-request"
        aria-label={isAuthenticated ? "Request booking" : "Sign in to book"}
        className={className}
      >
        {buttonText}
      </Button>
    </Link>
  )
}