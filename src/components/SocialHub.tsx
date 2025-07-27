import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, UserPlus, Heart, Share, Calendar, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";

// Mock social data
const mockConnections = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Creative Director",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face",
    verified: true,
    mutualConnections: 12,
    skills: ["Photography", "Design", "Events"],
    isConnected: false,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    title: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    verified: true,
    mutualConnections: 8,
    skills: ["Tech", "Business", "Networking"],
    isConnected: true,
  },
  {
    id: "3",
    name: "Alex Rivera",
    title: "Music Producer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    verified: false,
    mutualConnections: 5,
    skills: ["Music", "Audio", "Events"],
    isConnected: false,
  },
];

const mockPosts = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      title: "Creative Director",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face",
    },
    content: "Just finished an amazing photography workshop! The creative energy was incredible. Looking forward to the next collaboration.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop",
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Marcus Johnson",
      title: "Startup Founder",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    content: "Great networking event tonight! Met some incredible entrepreneurs and potential collaborators. The future of tech is bright! 🚀",
    timestamp: "4 hours ago",
    likes: 31,
    comments: 12,
    isLiked: true,
  },
];

const mockGroups = [
  {
    id: "1",
    name: "Creative Collaborators",
    description: "A community for artists, designers, and creative professionals",
    members: 248,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
    isMember: true,
  },
  {
    id: "2",
    name: "Tech Entrepreneurs",
    description: "Connecting startup founders and tech innovators",
    members: 156,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop",
    isMember: false,
  },
  {
    id: "3",
    name: "Music & Events",
    description: "Musicians, event organizers, and music enthusiasts",
    members: 89,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
    isMember: true,
  },
];

export function SocialHub() {
  const [connections, setConnections] = useState(mockConnections);
  const [posts, setPosts] = useState(mockPosts);
  const [groups, setGroups] = useState(mockGroups);
  const [newPost, setNewPost] = useState("");
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const { toast } = useToast();

  const handleConnect = (userId: string) => {
    setConnections(prev => prev.map(user => 
      user.id === userId ? { ...user, isConnected: !user.isConnected } : user
    ));
    
    const user = connections.find(u => u.id === userId);
    toast({
      title: user?.isConnected ? "Connection Removed" : "Connection Request Sent",
      description: user?.isConnected 
        ? `You're no longer connected with ${user.name}`
        : `Connection request sent to ${user?.name}`,
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, isMember: !group.isMember } : group
    ));
    
    const group = groups.find(g => g.id === groupId);
    toast({
      title: group?.isMember ? "Left Group" : "Joined Group",
      description: group?.isMember 
        ? `You left ${group.name}`
        : `Welcome to ${group?.name}!`,
    });
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: Date.now().toString(),
      author: {
        name: "You",
        title: "Event Organizer",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      },
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      isLiked: false,
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Social Hub
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect, collaborate, and build meaningful relationships within the Kolab community
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Profile Summary */}
            <Card className="rounded-xl shadow-sm border bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
                    <AvatarFallback>YU</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-primary">{connections.filter(c => c.isConnected).length}</div>
                      <div className="text-muted-foreground">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{posts.length}</div>
                      <div className="text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-xl shadow-sm border bg-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="default"
                    onClick={() => setShowCreateEventDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Following List */}
            <Card className="rounded-xl shadow-sm border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Following</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {connections.filter(c => c.isConnected).slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.title}</p>
                      </div>
                    </div>
                  ))}
                  {connections.filter(c => c.isConnected).length === 0 && (
                    <p className="text-sm text-muted-foreground">No connections yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-6">
              {/* Create Post */}
              <Card className="rounded-xl shadow-sm border bg-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          placeholder="What's on your mind? Share your latest collaboration or event..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[60px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateEventDialog(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Event
                      </Button>
                      <Button 
                        onClick={handleCreatePost} 
                        disabled={!newPost.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Share Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {posts.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No posts yet"
                  description="Be the first to share something with the community! Start a conversation or share your latest project."
                  action={{
                    label: "Create Your First Post",
                    onClick: () => {
                      const input = document.querySelector('input[placeholder*="What\'s on your mind"]') as HTMLInputElement;
                      input?.focus();
                    }
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="rounded-xl shadow-sm border bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Post Header */}
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold">{post.author.name}</h4>
                              <p className="text-sm text-muted-foreground">{post.author.title}</p>
                              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="space-y-3">
                            <p className="text-base leading-relaxed">{post.content}</p>
                            {post.image && (
                              <img
                                src={post.image}
                                alt="Post content"
                                className="w-full rounded-lg object-cover max-h-96"
                              />
                            )}
                          </div>

                          {/* Post Actions */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleLikePost(post.id)}
                                className={`${post.isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"} transition-colors`}
                              >
                                <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:text-primary">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:text-primary">
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              {connections.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No connections yet"
                  description="Start building your network by connecting with other community members. Find people with similar interests and collaborate!"
                  action={{
                    label: "Explore Community",
                    onClick: () => toast({ title: "Feature coming soon", description: "Community discovery is being built!" })
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {connections.map((user) => (
                    <Card key={user.id} className="rounded-xl shadow-sm border bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <Avatar className="w-16 h-16 mx-auto">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-lg font-bold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.title}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {user.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {user.mutualConnections} mutual connections
                          </p>
                          <Button 
                            variant={user.isConnected ? "outline" : "default"}
                            className={`w-full ${!user.isConnected ? "bg-primary hover:bg-primary/90" : ""}`}
                            onClick={() => handleConnect(user.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {user.isConnected ? "Connected" : "Connect"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              {groups.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No groups yet"
                  description="Join communities of like-minded individuals. Share knowledge, collaborate on projects, and grow together!"
                  action={{
                    label: "Browse Groups",
                    onClick: () => toast({ title: "Feature coming soon", description: "Group discovery is being built!" })
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <Card key={group.id} className="rounded-xl shadow-sm border bg-card hover:shadow-md transition-shadow overflow-hidden">
                      <div className="relative">
                        <img
                          src={group.image}
                          alt={group.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-bold">{group.name}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {group.members} members
                          </div>
                          <Button 
                            variant={group.isMember ? "outline" : "default"}
                            className={`w-full ${!group.isMember ? "bg-primary hover:bg-primary/90" : ""}`}
                            onClick={() => handleJoinGroup(group.id)}
                          >
                            {group.isMember ? "Leave Group" : "Join Group"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <EmptyState
                icon={MessageCircle}
                title="Messages coming soon"
                description="Direct messaging feature is in development. Soon you'll be able to connect directly with other community members."
                action={{
                  label: "Get Notified",
                  onClick: () => toast({ title: "Thanks for your interest!", description: "We'll notify you when messaging is available." })
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <CreateEventWizard
        open={showCreateEventDialog}
        onOpenChange={setShowCreateEventDialog}
        onCreateEvent={(eventData) => {
          toast({
            title: "Event Created",
            description: `${eventData.title} has been created successfully.`,
          });
          setShowCreateEventDialog(false);
        }}
      />
    </div>
  );
}