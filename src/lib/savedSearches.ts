import { supabase } from '@/integrations/supabase/client';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  query: string;
  filters: any;
  is_alert: boolean;
  alert_frequency: string;
  created_at: string;
  updated_at: string;
}

export const savedSearchService = {
  // Get all saved searches for the current user
  async getSavedSearches(): Promise<{ data: SavedSearch[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return { data: [], error };
    }
  },

  // Save a new search
  async saveSearch(searchData: {
    name: string;
    query: string;
    filters: any;
    is_alert?: boolean;
    alert_frequency?: string;
  }): Promise<{ data: SavedSearch | null; error: any }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.user.id,
          name: searchData.name,
          query: searchData.query,
          filters: searchData.filters,
          is_alert: searchData.is_alert || false,
          alert_frequency: searchData.alert_frequency || 'daily',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving search:', error);
      return { data: null, error };
    }
  },

  // Update an existing saved search
  async updateSavedSearch(
    searchId: string,
    updates: Partial<SavedSearch>
  ): Promise<{ data: SavedSearch | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .update(updates)
        .eq('id', searchId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating saved search:', error);
      return { data: null, error };
    }
  },

  // Delete a saved search
  async deleteSavedSearch(searchId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return { error };
    }
  },

  // Execute a saved search
  async executeSavedSearch(searchId: string): Promise<{ data: any[]; error: any }> {
    try {
      // Get the saved search
      const { data: savedSearch, error: searchError } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('id', searchId)
        .maybeSingle();

      if (searchError) throw searchError;

      // Execute the search using the saved filters
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .ilike('title', `%${savedSearch.query}%`)
        .order('start_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error executing saved search:', error);
      return { data: [], error };
    }
  },
};