-- Create social interactions table for likes, shares, follows
CREATE TABLE public.social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('event', 'user', 'post', 'group')),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'share', 'follow', 'bookmark')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type, interaction_type)
);

-- Create user connections table for networking
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connected_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Create saved searches table for enhanced search functionality
CREATE TABLE public.saved_searches_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  search_type TEXT DEFAULT 'events' CHECK (search_type IN ('events', 'users', 'venues', 'groups')),
  is_alert BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment plans table for installment payments
CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('full', 'split_2', 'split_3', 'split_6')),
  installments INTEGER NOT NULL DEFAULT 1,
  installment_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  interest_rate DECIMAL(5,4) DEFAULT 0,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment installments table
CREATE TABLE public.payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search analytics table
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_interactions
CREATE POLICY "Users can create their own interactions" ON public.social_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" ON public.social_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON public.social_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_connections
CREATE POLICY "Users can create connections" ON public.user_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their connections" ON public.user_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can update their connections" ON public.user_connections
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- RLS Policies for saved_searches_enhanced
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches_enhanced
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for payment_plans
CREATE POLICY "Users can view their payment plans" ON public.payment_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_plans.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payment plans" ON public.payment_plans
  FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

-- RLS Policies for payment_installments
CREATE POLICY "Users can view their installments" ON public.payment_installments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_plans 
      JOIN orders ON orders.id = payment_plans.order_id
      WHERE payment_plans.id = payment_installments.payment_plan_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage installments" ON public.payment_installments
  FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

-- RLS Policies for search_analytics
CREATE POLICY "Users can create search analytics" ON public.search_analytics
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view their search analytics" ON public.search_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all search analytics" ON public.search_analytics
  FOR SELECT USING (current_user_has_role('admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_social_interactions_user_id ON public.social_interactions(user_id);
CREATE INDEX idx_social_interactions_target ON public.social_interactions(target_id, target_type);
CREATE INDEX idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX idx_user_connections_connected_user_id ON public.user_connections(connected_user_id);
CREATE INDEX idx_saved_searches_enhanced_user_id ON public.saved_searches_enhanced(user_id);
CREATE INDEX idx_payment_plans_order_id ON public.payment_plans(order_id);
CREATE INDEX idx_payment_installments_plan_id ON public.payment_installments(payment_plan_id);
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_session_id ON public.search_analytics(session_id);

-- Function to create activity feed entries for social interactions
CREATE OR REPLACE FUNCTION create_social_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Create activity feed entry for follows and connections
  IF NEW.interaction_type = 'follow' OR NEW.interaction_type = 'connect' THEN
    INSERT INTO activity_feed (
      user_id,
      actor_id,
      action_type,
      target_type,
      target_id,
      metadata
    ) VALUES (
      NEW.target_id, -- The user being followed/connected to
      NEW.user_id,   -- The user doing the action
      NEW.interaction_type,
      NEW.target_type,
      NEW.target_id,
      NEW.metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for social activity
CREATE TRIGGER social_activity_trigger
  AFTER INSERT ON public.social_interactions
  FOR EACH ROW EXECUTE FUNCTION create_social_activity();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON public.user_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_enhanced_updated_at
    BEFORE UPDATE ON public.saved_searches_enhanced
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON public.payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();