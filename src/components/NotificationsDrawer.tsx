import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Briefcase, 
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle,
  Settings,
  Check,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'follow' | 'message' | 'booking' | 'event' | 'like' | 'comment';
  title: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
  avatar?: string;
  actionUrl?: string;
}

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "follow",
    title: "New Follower",
    message: "Sarah Chen started following you",
    timestamp: "5 min ago",
    isUnread: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/profile/sarah-chen"
  },
  {
    id: "2",
    type: "booking",
    title: "Booking Confirmed",
    message: "Your spot for Jazz Quartet Night is confirmed",
    timestamp: "1 hour ago",
    isUnread: true,
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=32&h=32&fit=crop",
    actionUrl: "/bookings"
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Marcus Johnson sent you a message about the startup event",
    timestamp: "2 hours ago",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/messages"
  },
  {
    id: "4",
    type: "like",
    title: "Event Liked",
    message: "Alex Rivera liked your Creative Photography Workshop",
    timestamp: "3 hours ago",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/events/photography-workshop"
  },
  {
    id: "5",
    type: "event",
    title: "Event Reminder",
    message: "Tech Startup Networking Mixer starts in 30 minutes",
    timestamp: "4 hours ago",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=32&h=32&fit=crop",
    actionUrl: "/events/tech-mixer"
  },
  {
    id: "6",
    type: "comment",
    title: "New Comment",
    message: "Emma Wilson commented on your street art walking tour",
    timestamp: "6 hours ago",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/events/street-art-tour"
  },
  {
    id: "7",
    type: "booking",
    title: "Booking Reminder",
    message: "Don't forget about your Digital Art Workshop tomorrow at 1:00 PM",
    timestamp: "1 day ago",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=32&h=32&fit=crop",
    actionUrl: "/bookings"
  }
];

function getNotificationIcon(type: string) {
  switch (type) {
    case 'follow':
      return UserPlus;
    case 'message':
      return MessageCircle;
    case 'booking':
      return CheckCircle;
    case 'event':
      return Calendar;
    case 'like':
      return Heart;
    case 'comment':
      return MessageCircle;
    default:
      return Calendar;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'follow':
      return 'text-blue-500';
    case 'message':
      return 'text-green-500';
    case 'booking':
      return 'text-primary';
    case 'event':
      return 'text-purple-500';
    case 'like':
      return 'text-red-500';
    case 'comment':
      return 'text-orange-500';
    default:
      return 'text-muted-foreground';
  }
}

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { toast } = useToast();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, isUnread: false }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isUnread: false
    })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.isUnread) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the URL - handle both internal and external links
      try {
        if (notification.actionUrl.startsWith('http')) {
          // External link
          window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
        } else {
          // Internal link
          navigate(notification.actionUrl);
          onOpenChange(false); // Close the drawer
        }
      } catch (error) {
        toast({
          title: "Navigation Error",
          description: "Unable to navigate to the requested page.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You have no new notifications.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                        notification.isUnread && "bg-accent/50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="relative flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>{notification.title[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Icon className={cn("h-5 w-5", iconColor)} />
                          </div>
                        )}
                        {notification.isUnread && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={cn(
                              "text-sm font-medium leading-none mb-1",
                              notification.isUnread && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground mt-1">
                              {notification.timestamp}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="my-1" />}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" size="sm">
              View All Notifications
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}