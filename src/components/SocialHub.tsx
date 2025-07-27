import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, UserPlus, Heart, Share, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateEventWizard } from "@/components/CreateEventWizard";

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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Social Hub</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect, collaborate, and build meaningful relationships within the Kolab community
        </p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          <Card className="kolab-card">
            <CardHeader>
              <CardTitle>Share with the community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What's on your mind? Share your latest collaboration or event..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-20"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCreateEventDialog(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Event
                  </Button>
                </div>
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  Share Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="kolab-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.author.name}</div>
                      <div className="text-sm text-muted-foreground">{post.author.title}</div>
                      <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={post.isLiked ? "text-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((user) => (
              <Card key={user.id} className="kolab-card">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.title}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    {user.mutualConnections} mutual connections
                  </div>
                  <Button 
                    variant={user.isConnected ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleConnect(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {user.isConnected ? "Connected" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="kolab-card overflow-hidden">
                <div className="relative">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {group.members} members
                  </div>
                  <Button 
                    variant={group.isMember ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    {group.isMember ? "Leave Group" : "Join Group"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card className="kolab-card">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Direct messaging feature coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Stay tuned for our messaging feature to connect directly with other members.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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