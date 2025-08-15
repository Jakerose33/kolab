import { formatDistanceToNow } from 'date-fns'
import { Activity, Users, Calendar, MapPin, MessageSquare, UserPlus, Heart, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils'

export function RealtimeActivityFeed() {
  const { activityFeed, loading } = useRealtimeNotifications()

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'event_created':
      case 'event_updated':
        return <Calendar className="h-4 w-4" />
      case 'venue_booked':
      case 'booking_confirmed':
        return <MapPin className="h-4 w-4" />
      case 'message_sent':
        return <MessageSquare className="h-4 w-4" />
      case 'user_joined':
        return <UserPlus className="h-4 w-4" />
      case 'event_liked':
        return <Heart className="h-4 w-4" />
      case 'venue_rated':
        return <Star className="h-4 w-4" />
      case 'rsvp_created':
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'event_created':
      case 'event_updated':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'venue_booked':
      case 'booking_confirmed':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'message_sent':
        return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'user_joined':
        return 'bg-orange-500/10 text-orange-600 border-orange-200'
      case 'event_liked':
        return 'bg-red-500/10 text-red-600 border-red-200'
      case 'venue_rated':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'rsvp_created':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const formatActivityMessage = (activity: any) => {
    const metadata = activity.metadata || {}
    
    switch (activity.action_type) {
      case 'event_created':
        return `New event created: ${metadata.title || 'Untitled Event'}`
      case 'event_updated':
        return `Event updated: ${metadata.title || 'Untitled Event'}`
      case 'venue_booked':
        return `Venue booking request sent for ${metadata.venue_name || 'a venue'}`
      case 'booking_confirmed':
        return `Booking confirmed for ${metadata.venue_name || 'venue'}`
      case 'message_sent':
        return `New message received from ${metadata.sender_name || 'someone'}`
      case 'user_joined':
        return `Welcome! You joined the platform`
      case 'event_liked':
        return `You liked an event: ${metadata.event_title || 'Untitled Event'}`
      case 'venue_rated':
        return `You rated ${metadata.venue_name || 'a venue'}: ${metadata.rating || 'N/A'} stars`
      case 'rsvp_created':
        return `RSVP ${metadata.status || 'created'} for ${metadata.event_title || 'an event'}`
      case 'notification':
        return metadata.title || 'New notification received'
      default:
        return `Activity: ${activity.action_type.replace('_', ' ')}`
    }
  }

  const getActivityBadgeText = (actionType: string) => {
    return actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
          <Badge variant="secondary" className="text-xs">
            {activityFeed.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activityFeed.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Your activity will appear here as you interact with events, venues, and other users."
            />
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-2">
              {activityFeed.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border",
                      getActivityColor(activity.action_type)
                    )}>
                      {getActivityIcon(activity.action_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-relaxed">
                          {formatActivityMessage(activity)}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getActivityBadgeText(activity.action_type)}
                        </Badge>
                        {activity.target_type && activity.target_type !== 'general' && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.target_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < activityFeed.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}