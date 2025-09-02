import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationStart?: (user: User) => void;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face",
    role: "Event Organizer",
    isOnline: true,
  },
  {
    id: "2", 
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    role: "Venue Manager",
    isOnline: false,
    lastSeen: "2h ago",
  },
  {
    id: "3",
    name: "Luna Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    role: "Photographer",
    isOnline: true,
  },
  {
    id: "4",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    role: "Sound Engineer",
    isOnline: false,
    lastSeen: "1d ago",
  },
  {
    id: "5",
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face",
    role: "Artist",
    isOnline: true,
  },
  {
    id: "6",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    role: "DJ",
    isOnline: false,
    lastSeen: "3h ago",
  }
];

export function NewConversationDialog({ 
  open, 
  onOpenChange, 
  onConversationStart 
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartConversation = (user: User) => {
    toast({
      title: "Conversation Started",
      description: `You can now chat with ${user.name}`,
    });
    onConversationStart?.(user);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-80 w-full">
            <div className="space-y-2 p-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleStartConversation(user)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{user.name}</h3>
                        {user.isOnline ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {user.lastSeen}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.role}
                      </p>
                    </div>
                    
                    <Button size="sm" variant="ghost" className="ml-2">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {searchQuery === "" && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Search for people to start a conversation
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}