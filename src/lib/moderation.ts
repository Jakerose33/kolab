import { supabase } from '@/integrations/supabase/client';
import { useContentModeration } from '@/lib/contentModerationClient';

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_content_id?: string;
  content_type: 'event' | 'message' | 'profile' | 'venue';
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  moderator_id?: string;
  moderator_notes?: string;
  resolution_action?: 'no_action' | 'content_removed' | 'user_warned' | 'user_suspended' | 'user_banned';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason?: string;
  created_at: string;
}

export interface UserSuspension {
  id: string;
  user_id: string;
  moderator_id: string;
  reason: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  action_type: 'report_reviewed' | 'content_removed' | 'user_warned' | 'user_suspended' | 'user_banned' | 'content_restored';
  target_user_id?: string;
  target_content_id?: string;
  content_type?: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

// Content reporting functions
export const createContentReport = async (data: {
  reported_user_id?: string;
  reported_content_id?: string;
  content_type: ContentReport['content_type'];
  reason: ContentReport['reason'];
  description?: string;
}): Promise<{ data: ContentReport | null; error: any }> => {
  try {
    const { data: report, error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
      })
      .select()
      .single();

    return { data: report as ContentReport, error };
  } catch (error) {
    console.error('Error creating content report:', error);
    return { data: null, error };
  }
};

export const getContentReports = async (filters?: {
  status?: ContentReport['status'];
  content_type?: ContentReport['content_type'];
  limit?: number;
}): Promise<{ data: ContentReport[]; error: any }> => {
  try {
    let query = supabase
      .from('content_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    return { data: (data || []) as ContentReport[], error };
  } catch (error) {
    console.error('Error fetching content reports:', error);
    return { data: [], error };
  }
};

export const updateContentReport = async (
  reportId: string,
  updates: {
    status?: ContentReport['status'];
    moderator_notes?: string;
    resolution_action?: ContentReport['resolution_action'];
    resolved_at?: string;
  }
): Promise<{ data: ContentReport | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: report, error } = await supabase
      .from('content_reports')
      .update({
        ...updates,
        moderator_id: user.user?.id,
        resolved_at: updates.status === 'resolved' ? new Date().toISOString() : updates.resolved_at,
      })
      .eq('id', reportId)
      .select()
      .single();

    return { data: report as ContentReport, error };
  } catch (error) {
    console.error('Error updating content report:', error);
    return { data: null, error };
  }
};

// User blocking functions
export const blockUser = async (
  blockedUserId: string,
  reason?: string
): Promise<{ data: UserBlock | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: block, error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: user.user?.id,
        blocked_id: blockedUserId,
        reason,
      })
      .select()
      .single();

    return { data: block, error };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { data: null, error };
  }
};

export const unblockUser = async (
  blockedUserId: string
): Promise<{ error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.user?.id)
      .eq('blocked_id', blockedUserId);

    return { error };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { error };
  }
};

export const getUserBlocks = async (): Promise<{ data: UserBlock[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    console.error('Error fetching user blocks:', error);
    return { data: [], error };
  }
};

export const isUserBlocked = async (
  blockerId: string,
  blockedId: string
): Promise<{ data: boolean; error: any }> => {
  try {
    const { data, error } = await supabase
      .rpc('is_user_blocked', {
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

    return { data: data || false, error };
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return { data: false, error };
  }
};

// User suspension functions (admin only)
export const suspendUser = async (data: {
  user_id: string;
  reason: string;
  end_date?: string;
  is_permanent?: boolean;
}): Promise<{ data: UserSuspension | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: suspension, error } = await supabase
      .from('user_suspensions')
      .insert({
        ...data,
        moderator_id: user.user?.id,
      })
      .select()
      .single();

    // Log the moderation action
    if (suspension) {
      await logModerationAction({
        action_type: 'user_suspended',
        target_user_id: data.user_id,
        reason: data.reason,
        notes: data.is_permanent ? 'Permanent suspension' : `Suspended until ${data.end_date}`,
      });
    }

    return { data: suspension, error };
  } catch (error) {
    console.error('Error suspending user:', error);
    return { data: null, error };
  }
};

export const isUserSuspended = async (
  userId: string
): Promise<{ data: boolean; error: any }> => {
  try {
    const { data, error } = await supabase
      .rpc('is_user_suspended', { user_id: userId });

    return { data: data || false, error };
  } catch (error) {
    console.error('Error checking if user is suspended:', error);
    return { data: false, error };
  }
};

// Moderation logging
export const logModerationAction = async (data: {
  action_type: ModerationLog['action_type'];
  target_user_id?: string;
  target_content_id?: string;
  content_type?: string;
  reason?: string;
  notes?: string;
}): Promise<{ data: ModerationLog | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: log, error } = await supabase
      .from('moderation_log')
      .insert({
        ...data,
        moderator_id: user.user?.id,
      })
      .select()
      .single();

    return { data: log as ModerationLog, error };
  } catch (error) {
    console.error('Error logging moderation action:', error);
    return { data: null, error };
  }
};

export const getModerationLogs = async (filters?: {
  action_type?: ModerationLog['action_type'];
  target_user_id?: string;
  limit?: number;
}): Promise<{ data: ModerationLog[]; error: any }> => {
  try {
    let query = supabase
      .from('moderation_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.action_type) {
      query = query.eq('action_type', filters.action_type);
    }

    if (filters?.target_user_id) {
      query = query.eq('target_user_id', filters.target_user_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    return { data: (data || []) as ModerationLog[], error };
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    return { data: [], error };
  }
};

// Content moderation utilities
export const moderateAndReport = async (content: {
  text?: string;
  contentId: string;
  contentType: ContentReport['content_type'];
  userId?: string;
}) => {
  const { validateContent } = useContentModeration();
  
  if (content.text) {
    const validation = validateContent(content.text);
    
    if (!validation.isValid) {
      // Auto-report suspicious content
      await createContentReport({
        reported_content_id: content.contentId,
        reported_user_id: content.userId,
        content_type: content.contentType,
        reason: 'inappropriate',
        description: `Auto-flagged: ${validation.message}`,
      });
      
      return {
        isAppropriate: false,
        shouldBlock: true,
        message: validation.message,
      };
    }
  }
  
  return {
    isAppropriate: true,
    shouldBlock: false,
  };
};