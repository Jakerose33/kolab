import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, MapPin, Briefcase } from "lucide-react";

interface Notification {
  id: string;
  type: 'event' | 'social' | 'venue' | 'career';
  title: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
  avatar?: string;
}

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "Event Reminder",
    message: "Your Tech Innovation Summit starts in 2 hours",
    timestamp: "2 hours ago",
    isUnread: true,
  },
  {
    id: "2",
    type: "social",
    title: "New Connection",
    message: "Sarah Chen accepted your connection request",
    timestamp: "1 day ago",
    isUnread: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "3",
    type: "venue",
    title: "Booking Confirmed",
    message: "Your venue booking at Creative Space has been confirmed",
    timestamp: "2 days ago",
    isUnread: false,
  },
  {
    id: "4",
    type: "career",
    title: "Job Match",
    message: "New Event Manager position matches your skills",
    timestamp: "3 days ago",
    isUnread: false,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'event':
      return <Calendar className="h-4 w-4" />;
    case 'social':
      return <Users className="h-4 w-4" />;
    case 'venue':
      return <MapPin className="h-4 w-4" />;
    case 'career':
      return <Briefcase className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Notifications
            <Button variant="ghost" size="sm" className="text-sm">
              Mark all as read
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80 w-full">
          <div className="space-y-4 p-4">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  notification.isUnread ? 'bg-background-secondary' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {notification.avatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.avatar} alt="User" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.isUnread && (
                      <Badge variant="secondary" className="h-2 w-2 p-0 bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}