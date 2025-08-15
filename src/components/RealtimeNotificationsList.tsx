import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, CheckCheck, Clock, Users, MapPin, Calendar, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils'

export function RealtimeNotificationsList() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useRealtimeNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />
      case 'event':
        return <Users className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'venue':
        return <MapPin className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'event':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'message':
        return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'venue':
        return 'bg-orange-500/10 text-orange-600 border-orange-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 px-2 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                      !notification.read_at && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                    onClick={() => {
                      if (!notification.read_at) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-medium leading-none",
                          !notification.read_at && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notification.type}
                        </Badge>
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}