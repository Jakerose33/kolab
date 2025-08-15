-- Create messages table for DMs
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = recipient_id AND read_at IS NULL);

-- Create conversations table for organizing messages
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_two_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES public.messages(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_one_id, participant_two_id)
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Participants can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'event_rsvp', 'booking_update', 'system')),
  related_id UUID, -- Can reference events, bookings, messages, etc.
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_one_id, participant_two_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Enable realtime for messages and notifications
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;