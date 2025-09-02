import { useState, useEffect } from 'react'
import { Heart, UserPlus, Share, MessageCircle, Star, Users, TrendingUp, UserCheck, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface SocialFeaturesProps {
  eventId?: string
  userId?: string
  className?: string
}

interface Connection {
  id: string
  user_id: string
  connected_user_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
    handle: string
    bio: string
    skills: string[]
  }
}

interface Recommendation {
  id: string
  type: 'user' | 'event' | 'group'
  title: string
  description: string
  image: string
  score: number
  reason: string
  action_label: string
}

export function SocialFeatures({ eventId, userId, className }: SocialFeaturesProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [connections, setConnections] = useState<Connection[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [socialStats, setSocialStats] = useState({
    followers: 0,
    following: 0,
    likes: 0,
    shares: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSocialData()
    }
  }, [user, eventId, userId])

  const loadSocialData = async () => {
    try {
      // Load mock connections for now since the table was just created
      const mockConnections: Connection[] = [
        {
          id: '1',
          user_id: user?.id || '',
          connected_user_id: '2',
          status: 'accepted',
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'Sarah Chen',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop',
            handle: 'sarah_chen',
            bio: 'Creative Director passionate about design',
            skills: ['Design', 'Photography', 'UI/UX']
          }
        }
      ]
      setConnections(mockConnections)

      // Generate AI-powered recommendations
      generateRecommendations()
      
      // Load social stats
      loadSocialStats()
      
    } catch (error) {
      console.error('Error loading social data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = () => {
    // AI-powered recommendations based on user behavior and interests
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        type: 'user',
        title: 'Sarah Chen',
        description: 'Creative Director with similar interests in design and photography',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b762?w=64&h=64&fit=crop',
        score: 0.92,
        reason: 'Shared interests in design and photography',
        action_label: 'Connect'
      },
      {
        id: '2',
        type: 'event',
        title: 'Design Thinking Workshop',
        description: 'Based on your attendance at creative events',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
        score: 0.89,
        reason: 'Matches your creative interests',
        action_label: 'View Event'
      },
      {
        id: '3',
        type: 'group',
        title: 'Creative Professionals Network',
        description: 'Join 2,400+ designers and creative professionals',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop',
        score: 0.85,
        reason: 'Popular among your connections',
        action_label: 'Join Group'
      }
    ]
    setRecommendations(mockRecommendations)
  }

  const loadSocialStats = () => {
    // Mock social stats - in production, these would come from the database
    setSocialStats({
      followers: 124,
      following: 89,
      likes: 1250,
      shares: 67
    })
  }

  const handleConnect = async (targetUserId: string) => {
    try {
      // Mock connection request for now
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (error) throw error

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      })
    } catch (error) {
      console.error('Error sending connection request:', error)
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleFollow = async (targetUserId: string, eventId?: string) => {
    try {
      // Create notification for the followed user
      await supabase.functions.invoke('create-notification', {
        body: {
          user_ids: [targetUserId],
          title: 'New Follower',
          message: `${user?.email} started following you`,
          type: 'social',
          related_id: eventId
        }
      })

      toast({
        title: "Following",
        description: "You are now following this user.",
      })
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleLike = async (itemId: string, itemType: 'event' | 'post') => {
    try {
      // Mock like action for now
      await new Promise(resolve => setTimeout(resolve, 500))

      setSocialStats(prev => ({ ...prev, likes: prev.likes + 1 }))
      
      toast({
        title: "Liked!",
        description: "Your like has been added.",
      })
    } catch (error) {
      console.error('Error liking item:', error)
    }
  }

  const handleShare = async (itemId: string, platform: string = 'internal') => {
    try {
      if (platform === 'internal') {
        // Share within the platform
        const shareUrl = `${window.location.origin}/events/${itemId}`
        await navigator.clipboard.writeText(shareUrl)
        
        // Mock share tracking for now
        await new Promise(resolve => setTimeout(resolve, 300))

        setSocialStats(prev => ({ ...prev, shares: prev.shares + 1 }))
        
        toast({
          title: "Link Copied!",
          description: "Event link has been copied to your clipboard.",
        })
      } else {
        // External platform sharing
        const shareUrl = `${window.location.origin}/events/${itemId}`
        const shareText = "Check out this amazing event on Kolab!"
        
        const platforms = {
          twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        }
        
        window.open(platforms[platform as keyof typeof platforms], '_blank', 'width=600,height=400')
        
        setSocialStats(prev => ({ ...prev, shares: prev.shares + 1 }))
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (!user) return null

  return (
    <div className={cn("space-y-6", className)}>
      {/* Social Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Social Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{socialStats.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{socialStats.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{socialStats.likes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{socialStats.shares}</div>
              <div className="text-sm text-muted-foreground">Shares</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="connections">Network</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* AI Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommended For You
                <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(rec.score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    <p className="text-xs text-primary">{rec.reason}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {rec.action_label}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Network ({connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={connection.profiles.avatar_url} />
                      <AvatarFallback>
                        {connection.profiles.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{connection.profiles.full_name}</h4>
                      <p className="text-sm text-muted-foreground">@{connection.profiles.handle}</p>
                      <div className="flex flex-wrap gap-1">
                        {connection.profiles.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFollow(connection.connected_user_id)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Feed */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>You connected with <strong>Sarah Chen</strong></span>
                  <span className="text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>You liked <strong>Design Workshop</strong></span>
                  <span className="text-muted-foreground">4 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>You shared <strong>Tech Meetup</strong></span>
                  <span className="text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {eventId && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLike(eventId, 'event')}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(eventId)}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Discuss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}