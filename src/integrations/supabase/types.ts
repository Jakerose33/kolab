export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_id: string
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_metrics: {
        Row: {
          created_at: string
          date_recorded: string
          id: string
          metric_name: string
          metric_value: Json
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name: string
          metric_value: Json
        }
        Update: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name?: string
          metric_value?: Json
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reason: string
          reported_content_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolution_action: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolution_action?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string
          reported_content_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolution_action?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_id: string | null
          participant_one_id: string
          participant_two_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          participant_one_id: string
          participant_two_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          participant_one_id?: string
          participant_two_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      event_analytics: {
        Row: {
          created_at: string
          date: string
          engagement_score: number
          event_id: string
          id: string
          organizer_id: string
          revenue: number
          rsvp_conversions: number
          shares: number
          unique_views: number
          updated_at: string
          views: number
        }
        Insert: {
          created_at?: string
          date?: string
          engagement_score?: number
          event_id: string
          id?: string
          organizer_id: string
          revenue?: number
          rsvp_conversions?: number
          shares?: number
          unique_views?: number
          updated_at?: string
          views?: number
        }
        Update: {
          created_at?: string
          date?: string
          engagement_score?: number
          event_id?: string
          id?: string
          organizer_id?: string
          revenue?: number
          rsvp_conversions?: number
          shares?: number
          unique_views?: number
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          organizer_id: string
          start_at: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          visibility: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          organizer_id: string
          start_at: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          visibility?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          organizer_id?: string
          start_at?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          visibility?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number | null
          application_deadline: string | null
          benefits: string[] | null
          company: string
          created_at: string
          currency: string | null
          description: string
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          job_type: string
          location: string
          posted_by: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          application_count?: number | null
          application_deadline?: string | null
          benefits?: string[] | null
          company: string
          created_at?: string
          currency?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          job_type: string
          location: string
          posted_by?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          application_count?: number | null
          application_deadline?: string | null
          benefits?: string[] | null
          company?: string
          created_at?: string
          currency?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          job_type?: string
          location?: string
          posted_by?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      mentor_requests: {
        Row: {
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          action_type: string
          content_type: string | null
          created_at: string
          id: string
          moderator_id: string
          notes: string | null
          reason: string | null
          target_content_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          content_type?: string | null
          created_at?: string
          id?: string
          moderator_id: string
          notes?: string | null
          reason?: string | null
          target_content_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          content_type?: string | null
          created_at?: string
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string | null
          target_content_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          booking_confirmations: boolean
          created_at: string
          email_enabled: boolean
          event_reminders: boolean
          event_updates: boolean
          id: string
          moderation_updates: boolean
          new_messages: boolean
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_confirmations?: boolean
          created_at?: string
          email_enabled?: boolean
          event_reminders?: boolean
          event_updates?: boolean
          id?: string
          moderation_updates?: boolean
          new_messages?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_confirmations?: boolean
          created_at?: string
          email_enabled?: boolean
          event_reminders?: boolean
          event_updates?: boolean
          id?: string
          moderation_updates?: boolean
          new_messages?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offline_queue: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          processed_at: string | null
          retry_count: number
          user_id: string
        }
        Insert: {
          action_data: Json
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          processed_at?: string | null
          retry_count?: number
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          processed_at?: string | null
          retry_count?: number
          user_id?: string
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          active_users: number
          conversion_rate: number
          created_at: string
          date: string
          id: string
          new_events: number
          new_users: number
          retention_rate: number
          total_bookings: number
          total_events: number
          total_revenue: number
          total_users: number
          total_venues: number
          updated_at: string
        }
        Insert: {
          active_users?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          id?: string
          new_events?: number
          new_users?: number
          retention_rate?: number
          total_bookings?: number
          total_events?: number
          total_revenue?: number
          total_users?: number
          total_venues?: number
          updated_at?: string
        }
        Update: {
          active_users?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          id?: string
          new_events?: number
          new_users?: number
          retention_rate?: number
          total_bookings?: number
          total_events?: number
          total_revenue?: number
          total_users?: number
          total_venues?: number
          updated_at?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          created_at: string | null
          id: string
          show_interests: boolean | null
          show_linkedin: boolean | null
          show_location: boolean | null
          show_skills: boolean | null
          show_website: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_interests?: boolean | null
          show_linkedin?: boolean | null
          show_location?: boolean | null
          show_skills?: boolean | null
          show_website?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          show_interests?: boolean | null
          show_linkedin?: boolean | null
          show_location?: boolean | null
          show_skills?: boolean | null
          show_website?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          experience_level: string | null
          full_name: string | null
          github_url: string | null
          handle: string | null
          hourly_rate: number | null
          id: string
          interests: string[] | null
          is_mentor: boolean | null
          linkedin_url: string | null
          location: string | null
          mentor_bio: string | null
          mentor_expertise: string[] | null
          portfolio_url: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          handle?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          is_mentor?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          mentor_bio?: string | null
          mentor_expertise?: string[] | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          handle?: string | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          is_mentor?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          mentor_bio?: string | null
          mentor_expertise?: string[] | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          keys: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          keys: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          keys?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alert_frequency: string | null
          created_at: string | null
          filters: Json | null
          id: string
          is_alert: boolean | null
          name: string
          query: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_frequency?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_alert?: boolean | null
          name: string
          query: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_frequency?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_alert?: boolean | null
          name?: string
          query?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_analytics: {
        Row: {
          bookings_made: number
          created_at: string
          date: string
          events_created: number
          events_viewed: number
          id: string
          messages_sent: number
          page_views: number
          search_queries: number
          sessions: number
          time_spent_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bookings_made?: number
          created_at?: string
          date?: string
          events_created?: number
          events_viewed?: number
          id?: string
          messages_sent?: number
          page_views?: number
          search_queries?: number
          sessions?: number
          time_spent_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bookings_made?: number
          created_at?: string
          date?: string
          events_created?: number
          events_viewed?: number
          id?: string
          messages_sent?: number
          page_views?: number
          search_queries?: number
          sessions?: number
          time_spent_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_permanent: boolean
          moderator_id: string
          reason: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_permanent?: boolean
          moderator_id: string
          reason: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_permanent?: boolean
          moderator_id?: string
          reason?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_analytics: {
        Row: {
          average_rating: number | null
          booking_conversions: number
          booking_requests: number
          created_at: string
          date: string
          id: string
          occupancy_rate: number
          owner_id: string
          revenue: number
          unique_views: number
          updated_at: string
          venue_id: string
          views: number
        }
        Insert: {
          average_rating?: number | null
          booking_conversions?: number
          booking_requests?: number
          created_at?: string
          date?: string
          id?: string
          occupancy_rate?: number
          owner_id: string
          revenue?: number
          unique_views?: number
          updated_at?: string
          venue_id: string
          views?: number
        }
        Update: {
          average_rating?: number | null
          booking_conversions?: number
          booking_requests?: number
          created_at?: string
          date?: string
          id?: string
          occupancy_rate?: number
          owner_id?: string
          revenue?: number
          unique_views?: number
          updated_at?: string
          venue_id?: string
          views?: number
        }
        Relationships: []
      }
      venue_bookings: {
        Row: {
          created_at: string
          end_date: string
          event_type: string | null
          guest_count: number
          id: string
          message: string | null
          owner_notes: string | null
          special_requests: string | null
          start_date: string
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          event_type?: string | null
          guest_count: number
          id?: string
          message?: string | null
          owner_notes?: string | null
          special_requests?: string | null
          start_date: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          event_type?: string | null
          guest_count?: number
          id?: string
          message?: string | null
          owner_notes?: string | null
          special_requests?: string | null
          start_date?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          amenities: string[] | null
          capacity: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          owner_id: string
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          owner_id: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_engagement_score: {
        Args: {
          p_comments?: number
          p_rsvps: number
          p_shares: number
          p_views: number
        }
        Returns: number
      }
      create_activity_entry: {
        Args: {
          p_action_type: string
          p_actor_id: string
          p_metadata?: Json
          p_target_id?: string
          p_target_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_notification_with_activity: {
        Args: {
          p_action_type?: string
          p_actor_id: string
          p_message: string
          p_related_id?: string
          p_target_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      current_user_has_role: {
        Args: { check_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      get_basic_profile_info: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          handle: string
          id: string
          user_id: string
        }[]
      }
      get_event_with_privacy: {
        Args: { event_id: string }
        Returns: {
          capacity: number
          created_at: string
          description: string
          end_at: string
          id: string
          image_url: string
          latitude: number
          longitude: number
          organizer_id: string
          organizer_info: Json
          start_at: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          venue_address: string
          venue_name: string
          visibility: string
        }[]
      }
      get_profile_with_privacy: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          handle: string
          id: string
          interests: string[]
          linkedin_url: string
          location: string
          skills: string[]
          user_id: string
          website: string
        }[]
      }
      get_profile_with_privacy_safe: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          handle: string
          id: string
          interests: string[]
          linkedin_url: string
          location: string
          skills: string[]
          user_id: string
          website: string
        }[]
      }
      get_public_events: {
        Args: { event_limit?: number; search_query?: string }
        Returns: {
          capacity: number
          description: string
          end_at: string
          id: string
          image_url: string
          organizer_avatar: string
          organizer_handle: string
          organizer_name: string
          start_at: string
          tags: string[]
          title: string
          venue_area: string
          venue_name: string
        }[]
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          handle: string
          id: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          handle: string
          id: string
          user_id: string
        }[]
      }
      get_public_profiles_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          handle: string
          id: string
          user_id: string
        }[]
      }
      get_public_venues: {
        Args: {
          min_capacity?: number
          search_query?: string
          venue_limit?: number
          venue_tags?: string[]
        }
        Returns: {
          address: string
          amenities: string[]
          capacity: number
          description: string
          hourly_rate: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: Json
          owner_avatar: string
          owner_handle: string
          owner_name: string
          status: string
          tags: string[]
        }[]
      }
      get_user_analytics_masked: {
        Args: { target_user_id?: string }
        Returns: {
          created_at: string
          event_name: string
          id: string
          page_url: string
          session_id: string
        }[]
      }
      get_user_privacy_setting: {
        Args: { setting_name: string; target_user_id: string }
        Returns: boolean
      }
      get_venue_public_info: {
        Args: { venue_id: string }
        Returns: {
          address: string
          amenities: string[]
          capacity: number
          created_at: string
          description: string
          hourly_rate: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: Json
          owner_avatar: string
          owner_handle: string
          owner_name: string
          status: string
          tags: string[]
        }[]
      }
      get_venue_with_contact: {
        Args: { venue_id: string }
        Returns: {
          address: string
          amenities: string[]
          capacity: number
          contact_email: string
          contact_phone: string
          created_at: string
          description: string
          hourly_rate: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: Json
          owner_id: string
          owner_info: Json
          status: string
          tags: string[]
          updated_at: string
        }[]
      }
      get_venue_with_contact_safe: {
        Args: { venue_id: string }
        Returns: {
          address: string
          amenities: string[]
          capacity: number
          contact_email: string
          contact_phone: string
          created_at: string
          description: string
          hourly_rate: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: Json
          owner_id: string
          owner_info: Json
          status: string
          tags: string[]
          updated_at: string
        }[]
      }
      get_venues_safe: {
        Args: {
          min_capacity?: number
          search_query?: string
          venue_limit?: number
          venue_tags?: string[]
        }
        Returns: {
          address: string
          amenities: string[]
          capacity: number
          created_at: string
          description: string
          hourly_rate: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: Json
          owner_avatar: string
          owner_handle: string
          owner_name: string
          status: string
          tags: string[]
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          check_user_id: string
        }
        Returns: boolean
      }
      increment_job_view_count: {
        Args: { job_uuid: string }
        Returns: undefined
      }
      is_admin_or_moderator: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { blocked_id: string; blocker_id: string }
        Returns: boolean
      }
      is_user_suspended: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_offline_action: {
        Args: { p_action_data: Json; p_action_type: string; p_user_id: string }
        Returns: boolean
      }
      track_event_view: {
        Args: { p_event_id: string; p_is_unique?: boolean; p_user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
