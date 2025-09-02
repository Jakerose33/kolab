import { useState, useEffect, useRef } from 'react'
import { Send, Phone, Video, Paperclip, Smile, Search, MoreVertical, Users, Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { useRealtime } from '@/hooks/useRealtime'
import { supabase } from '@/integrations/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  attachment_url?: string
  read_at?: string
  created_at: string
  sender?: {
    full_name: string
    avatar_url: string
    handle: string
  }
}

interface Conversation {
  id: string
  participant_one_id: string
  participant_two_id: string
  last_message?: Message
  last_message_at: string
  unread_count: number
  other_participant: {
    id: string
    full_name: string
    avatar_url: string
    handle: string
    is_online: boolean
  }
}

interface RealtimeMessagingProps {
  className?: string
}

export function RealtimeMessaging({ className }: RealtimeMessagingProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  // Set up real-time messaging
  useRealtime({
    onMessageReceived: (message) => {
      setMessages(prev => [...prev, message])
      updateConversationLastMessage(message)
      scrollToBottom()
    }
  })

  useEffect(() => {
    if (user) {
      loadConversations()
      subscribeToPresence()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_one:participant_one_id (id, full_name, avatar_url, handle),
          participant_two:participant_two_id (id, full_name, avatar_url, handle),
          last_message:last_message_id (*)
        `)
        .or(`participant_one_id.eq.${user?.id},participant_two_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      const formattedConversations = data?.map(conv => {
        const otherParticipant = conv.participant_one.id === user?.id 
          ? conv.participant_two 
          : conv.participant_one
        
        return {
          ...conv,
          other_participant: {
            ...otherParticipant,
            is_online: onlineUsers.has(otherParticipant.id)
          },
          unread_count: 0 // Would be calculated from messages
        }
      }) || []

      setConversations(formattedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (full_name, avatar_url, handle)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
      
      // Mark messages as read
      markMessagesAsRead(conversationId)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToPresence = () => {
    const channel = supabase.channel('online-users')
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const online = new Set(Object.keys(state))
        setOnlineUsers(online)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => new Set([...prev, key]))
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev)
          updated.delete(key)
          return updated
        })
      })
      .subscribe()

    // Track current user's presence
    channel.track({ user_id: user?.id, online_at: new Date().toISOString() })

    return () => supabase.removeChannel(channel)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const conversation = conversations.find(c => c.id === selectedConversation)
      if (!conversation) return

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: conversation.other_participant.id,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error

      setNewMessage('')
      
      // Optimistically add message to UI
      setMessages(prev => [...prev, {
        ...data,
        sender: {
          full_name: user?.user_metadata?.full_name || 'You',
          avatar_url: user?.user_metadata?.avatar_url || '',
          handle: user?.user_metadata?.handle || ''
        }
      }])

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: data.id,
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConversation)

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user?.id)
        .is('read_at', null)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const updateConversationLastMessage = (message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.other_participant.id === message.sender_id) {
        return {
          ...conv,
          last_message: message,
          last_message_at: message.created_at,
          unread_count: conv.unread_count + 1
        }
      }
      return conv
    }))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_participant.handle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  if (!user) return null

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <div className="flex h-full">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
                    selectedConversation === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conv.other_participant.avatar_url} />
                      <AvatarFallback>
                        {conv.other_participant.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.other_participant.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate">
                        {conv.other_participant.full_name}
                      </h4>
                      {conv.last_message && (
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm opacity-70 truncate">
                      {conv.last_message?.content || 'Start a conversation...'}
                    </p>
                    
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={selectedConv.other_participant.avatar_url} />
                        <AvatarFallback>
                          {selectedConv.other_participant.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConv.other_participant.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConv.other_participant.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConv.other_participant.is_online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender_id !== user?.id && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender?.avatar_url} />
                          <AvatarFallback>
                            {message.sender?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          message.sender_id === user?.id
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}