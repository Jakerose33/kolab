import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type Props = { className?: string }

export default function BookingCTA({ className }: Props) {
  const nav = useNavigate()
  const location = useLocation()

  const onClick = async () => {
    const { data } = await supabase.auth.getSession()
    const authed = !!data?.session

    if (!authed) {
      // Send guests to sign-in and bounce them back here afterwards
      nav(`/auth?next=${encodeURIComponent(location.pathname)}`)
      return
    }

    // TODO: wire to real booking flow when ready
    nav('/bookings')
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