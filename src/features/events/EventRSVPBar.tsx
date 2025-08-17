import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Eye, ExternalLink, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useViewTransition } from "@/hooks/useViewTransition"

interface EventRSVPBarProps {
  eventId: string
  going: number
  interested: number
  userRSVP?: 'going' | 'interested' | null
  ticketUrl?: string
  bookingUrl?: string
  onRSVPChange?: (status: 'going' | 'interested' | null) => void
  className?: string
}

export default function EventRSVPBar({
  eventId,
  going,
  interested,
  userRSVP,
  ticketUrl,
  bookingUrl,
  onRSVPChange,
  className
}: EventRSVPBarProps) {
  const [loading, setLoading] = useState<'going' | 'interested' | null>(null)
  const [optimisticGoing, setOptimisticGoing] = useState(going)
  const [optimisticInterested, setOptimisticInterested] = useState(interested)
  const [optimisticUserRSVP, setOptimisticUserRSVP] = useState(userRSVP)
  const { toast } = useToast()
  const { rsvpWithAnimation } = useViewTransition()

  const handleRSVP = async (status: 'going' | 'interested') => {
    const isCurrentStatus = optimisticUserRSVP === status
    const newStatus = isCurrentStatus ? null : status
    
    setLoading(status)

    await rsvpWithAnimation(async () => {
      // Optimistic UI updates
      setOptimisticUserRSVP(newStatus)

      // Update counts optimistically
      if (optimisticUserRSVP === 'going') {
        setOptimisticGoing(prev => prev - 1)
      } else if (optimisticUserRSVP === 'interested') {
        setOptimisticInterested(prev => prev - 1)
      }

      if (newStatus === 'going') {
        setOptimisticGoing(prev => prev + 1)
      } else if (newStatus === 'interested') {
        setOptimisticInterested(prev => prev + 1)
      }
    })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onRSVPChange?.(newStatus)
      
      toast({
        title: newStatus ? `You're ${newStatus}!` : "RSVP removed",
        description: newStatus 
          ? `Added to your ${newStatus} events` 
          : "Removed from your events"
      })
    } catch (error) {
      // Revert optimistic updates on error
      await rsvpWithAnimation(async () => {
        setOptimisticGoing(going)
        setOptimisticInterested(interested)
        setOptimisticUserRSVP(userRSVP)
      })
      
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied!",
      description: "Event link copied to clipboard"
    })
  }

  return (
    <div className={cn(
      "fixed bottom-0 right-0 left-0 lg:sticky lg:top-24 lg:bottom-auto lg:right-auto lg:left-auto",
      "bg-background/95 backdrop-blur-md border-t lg:border lg:rounded-lg",
      "p-4 lg:p-6 space-y-4 z-50 lg:z-auto",
      "lg:w-80 lg:h-fit",
      className
    )}>
      {/* RSVP Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => handleRSVP('going')}
          disabled={loading === 'going'}
          variant={optimisticUserRSVP === 'going' ? 'default' : 'outline'}
          className={cn(
            "w-full justify-between h-12 text-base font-semibold",
            optimisticUserRSVP === 'going' && "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <span>{loading === 'going' ? 'Updating...' : 'Going'}</span>
          </div>
          <Badge variant="secondary" className="bg-background/50">
            {optimisticGoing}
          </Badge>
        </Button>

        <Button
          onClick={() => handleRSVP('interested')}
          disabled={loading === 'interested'}
          variant={optimisticUserRSVP === 'interested' ? 'default' : 'outline'}
          className={cn(
            "w-full justify-between h-12 text-base font-semibold",
            optimisticUserRSVP === 'interested' && "bg-blue-500 hover:bg-blue-600 text-white"
          )}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{loading === 'interested' ? 'Updating...' : 'Interested'}</span>
          </div>
          <Badge variant="secondary" className="bg-background/50">
            {optimisticInterested}
          </Badge>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {(ticketUrl || bookingUrl) && (
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            <a
              href={ticketUrl || bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              {ticketUrl ? 'Get Tickets' : 'Book Now'}
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={handleShare}
          className="w-full h-10 text-sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Event
        </Button>
      </div>
    </div>
  )
}