import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle,
  Users,
  Lock,
  PlusCircle
} from "lucide-react";

// Mock preview data - limited information
const previewConversations = [
  {
    id: "1",
    name: "Event Planning Team",
    lastMessage: "The venue booking is confirmed...",
    time: "2m ago",
    unread: 3,
    type: "group",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=32&h=32&fit=crop",
  },
  {
    id: "2", 
    name: "Sarah C.",
    lastMessage: "Thanks for organizing...",
    time: "1h ago",
    unread: 1,
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "Photography Crew",
    lastMessage: "Meet at Federation Square...",
    time: "3h ago", 
    unread: 0,
    type: "group",
    avatar: "https://images.unsplash.com/photo-1548048026-5a1a941d93d3?w=32&h=32&fit=crop",
  }
];

interface PreviewMessagesListProps {
  onSignInRequired: () => void;
}

export function PreviewMessagesList({ onSignInRequired }: PreviewMessagesListProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Connect with your collaborators and event participants
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Preview Conversations List */}
        <Card className="lg:col-span-1 relative">
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Sign in to access</h3>
              <p className="text-sm text-muted-foreground mb-4">View and send messages</p>
              <Button onClick={onSignInRequired} size="sm" className="bg-gradient-primary">
                Sign In
              </Button>
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button size="sm" variant="ghost" disabled>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {previewConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 border-b opacity-60"
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.type === "group" && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                          <Users className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Preview Chat Area */}
        <Card className="lg:col-span-2 relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-8">
              <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Start Conversations</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect with event organizers, collaborators, and other community members. 
                Share ideas, plan events, and build lasting connections.
              </p>
              <Button onClick={onSignInRequired} className="bg-gradient-primary">
                <Lock className="h-4 w-4 mr-2" />
                Sign In to Start Messaging
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center h-full opacity-30">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}