import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // For now, return default settings until types are updated
      const defaultSettings: SiteSetting[] = [
        {
          id: 'default-hero',
          setting_key: 'hero_image_url',
          setting_value: '/src/assets/hero-boiler-room.jpg',
          setting_type: 'image_url',
          description: 'URL for the main hero background image on the homepage'
        }
      ];
      
      setSettings(defaultSettings);
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      // For now, just update in memory until database types are available
      setSettings(prev => prev.map(setting => 
        setting.setting_key === key 
          ? { ...setting, setting_value: value }
          : setting
      ));
    } catch (err) {
      console.error('Error updating setting:', err);
      throw err;
    }
  };

  const getSetting = (key: string, defaultValue = '') => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    refetch: fetchSettings
  };
}