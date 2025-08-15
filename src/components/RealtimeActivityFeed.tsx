import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Clock, 
  MessageCircle, 
  Bell,
  Activity,
  Eye,
  Calendar,
  Heart,
  UserPlus,
  X
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { usePresence } from "@/hooks/usePresence";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface RealtimeActivityFeedProps {
  className?: string;
}

interface ActivityItem {
  id: string;
  type: 'event_created' | 'rsvp_created' | 'user_joined' | 'message_sent' | 'profile_updated';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

export function RealtimeActivityFeed({ className }: RealtimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showFeed, setShowFeed] = useState(false);
  const { presences, onlineCount } = usePresence();

  // Real-time event handlers
  const handleEventCreated = (event: any) => {
    const activity: ActivityItem = {
      id: `event-${event.id}-${Date.now()}`,
      type: 'event_created',
      title: 'New Event Created',
      description: `${event.title} was just published`,
      timestamp: event.created_at,
      metadata: { eventId: event.id }
    };
    setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  const handleRSVPCreated = (rsvp: any) => {
    const activity: ActivityItem = {
      id: `rsvp-${rsvp.id}-${Date.now()}`,
      type: 'rsvp_created',
      title: 'New RSVP',
      description: `Someone is ${rsvp.status} to an event`,
      timestamp: rsvp.created_at,
      metadata: { rsvpId: rsvp.id, status: rsvp.status }
    };
    setActivities(prev => [activity, ...prev.slice(0, 49)]);
  };

  const handleMessageReceived = (message: any) => {
    const activity: ActivityItem = {
      id: `message-${message.id}-${Date.now()}`,
      type: 'message_sent',
      title: 'New Message',
      description: 'A new message was sent',
      timestamp: message.created_at,
      metadata: { messageId: message.id }
    };
    setActivities(prev => [activity, ...prev.slice(0, 49)]);
  };

  const handleProfileUpdated = (profile: any) => {
    const activity: ActivityItem = {
      id: `profile-${profile.id}-${Date.now()}`,
      type: 'profile_updated',
      title: 'Profile Updated',
      description: `${profile.full_name || 'A user'} updated their profile`,
      timestamp: profile.updated_at,
      user: {
        name: profile.full_name || 'Anonymous',
        avatar: profile.avatar_url
      }
    };
    setActivities(prev => [activity, ...prev.slice(0, 49)]);
  };

  // Set up real-time subscriptions
  useRealtime({
    onEventCreated: handleEventCreated,
    onRSVPCreated: handleRSVPCreated,
    onMessageReceived: handleMessageReceived,
    onProfileUpdated: handleProfileUpdated
  });

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'event_created':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'rsvp_created':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'message_sent':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'profile_updated':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'event_created':
        return 'border-l-primary';
      case 'rsvp_created':
        return 'border-l-red-500';
      case 'user_joined':
        return 'border-l-green-500';
      case 'message_sent':
        return 'border-l-blue-500';
      case 'profile_updated':
        return 'border-l-purple-500';
      default:
        return 'border-l-muted-foreground';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Live Activity</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFeed(!showFeed)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showFeed ? 'Hide' : 'Show'} Feed
            </Button>
          </div>
          <CardDescription>
            Real-time updates from the Kolab community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activities.filter(a => a.type === 'event_created').length}</div>
              <div className="text-sm text-muted-foreground">New Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{activities.filter(a => a.type === 'rsvp_created').length}</div>
              <div className="text-sm text-muted-foreground">New RSVPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{activities.filter(a => a.type === 'message_sent').length}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Online Users ({onlineCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.values(presences).slice(0, 8).map((presence) => (
              <div key={presence.user_id} className="flex items-center space-x-1">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={presence.avatar_url || undefined} alt={presence.full_name} />
                    <AvatarFallback className="text-xs">
                      {presence.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                    presence.status === 'online' ? 'bg-green-500' :
                    presence.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                  )} />
                </div>
                <span className="text-xs text-muted-foreground max-w-[60px] truncate">
                  {presence.full_name}
                </span>
              </div>
            ))}
            {onlineCount > 8 && (
              <Badge variant="outline" className="ml-2">
                +{onlineCount - 8} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      {showFeed && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Activity Feed</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivities([])}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activities will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex space-x-3 p-3 rounded-lg border-l-4 bg-card/50",
                        getActivityColor(activity.type)
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.user && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                  <AvatarFallback className="text-xs">
                                    {activity.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {activity.user.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}