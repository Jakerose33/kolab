import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PreviewMessagesList } from "@/components/PreviewMessagesList";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NewConversationDialog } from "@/components/NewConversationDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Send, 
  Users, 
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  PlusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton, InlineError } from "@/lib/safe";

// Mock conversation data
const mockConversations = [
  {
    id: "1",
    name: "Event Planning Team",
    lastMessage: "The venue booking is confirmed for Saturday!",
    time: "2m ago",
    unread: 3,
    type: "group",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=32&h=32&fit=crop",
    participants: ["Sarah Chen", "Marcus Johnson", "You"]
  },
  {
    id: "2", 
    name: "Sarah Chen",
    lastMessage: "Thanks for organizing the jazz quartet event!",
    time: "1h ago",
    unread: 1,
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "Photography Crew",
    lastMessage: "Meet at Federation Square at 6 PM",
    time: "3h ago", 
    unread: 0,
    type: "group",
    avatar: "https://images.unsplash.com/photo-1548048026-5a1a941d93d3?w=32&h=32&fit=crop",
    participants: ["Alex Rivera", "Luna Rodriguez", "You"]
  }
];

const mockMessages = [
  {
    id: "1",
    sender: "Sarah Chen",
    content: "Hey! I just wanted to thank you for organizing the jazz quartet event. It was absolutely amazing!",
    time: "1:45 PM",
    isOwn: false,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: "2", 
    sender: "You",
    content: "I'm so glad you enjoyed it! The musicians were incredible. Are you interested in the upcoming photography workshop?",
    time: "1:47 PM",
    isOwn: true
  },
  {
    id: "3",
    sender: "Sarah Chen", 
    content: "Definitely! I've been wanting to improve my portrait photography skills. Is there still space available?",
    time: "1:50 PM",
    isOwn: false,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face"
  }
];

export default function Messages() {
  const { toast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEvent = (eventData: any) => {
    toast({
      title: "Event Created",
      description: `${eventData.title} has been created successfully.`,
    });
  };

  const filteredConversations = mockConversations?.filter(conv =>
    conv?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Your message has been delivered.",
    });
    setNewMessage("");
  };

  const handleStartNewConversation = (user: any) => {
    // Create a new conversation with the selected user
    const newConversation = {
      id: Date.now().toString(),
      name: user.name,
      lastMessage: "Start your conversation...",
      time: "now",
      unread: 0,
      type: "direct",
      avatar: user.avatar
    };
    setSelectedConversation(newConversation);
  };

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <ProtectedRoute 
          showPreview={true}
          fallback={
            <main className="container px-4 py-8">
              <PreviewMessagesList onSignInRequired={() => setShowAuth(true)} />
            </main>
          }
        >
          <main className="container px-4 py-8">
            {loading && <PageSkeleton />}
            {error && <InlineError message={error} />}
            {!loading && !error && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Messages</h1>
                  <p className="text-muted-foreground">
                    Connect with your collaborators and event participants
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowNewConversation(true)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                      selectedConversation?.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
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
                        {conversation.type === "group" && conversation.participants && (
                          <p className="text-xs text-muted-foreground">
                            {conversation.participants.length} participants
                          </p>
                        )}
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

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedConversation.name}</h3>
                        {selectedConversation.type === "group" && (
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.participants?.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] p-4">
                    <div className="space-y-4">
                      {mockMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                            message.isOwn ? "flex-row-reverse space-x-reverse" : ""
                          }`}>
                            {!message.isOwn && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.avatar} />
                                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`rounded-lg p-3 ${
                              message.isOwn 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <Separator />
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </div>
            )}
          </Card>
                </div>
              </>
            )}
          </main>
        </ProtectedRoute>
      </AppLayout>
      
      <MessagesDialog
        open={showMessages}
        onOpenChange={setShowMessages}
      />

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationStart={handleStartNewConversation}
      />
      
      <NotificationsDrawer
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
}