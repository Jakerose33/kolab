import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { Eye, EyeOff, Shield, Save } from "lucide-react";

interface PrivacySettings {
  show_location: boolean;
  show_website: boolean;
  show_linkedin: boolean;
  show_skills: boolean;
  show_interests: boolean;
}

export function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySettings>({
    show_location: false,
    show_website: false,
    show_linkedin: false,
    show_skills: true,
    show_interests: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          show_location: data.show_location,
          show_website: data.show_website,
          show_linkedin: data.show_linkedin,
          show_skills: data.show_skills,
          show_interests: data.show_interests,
        });
      }
    } catch (error: any) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Error loading privacy settings",
        description: "Using default settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Controls
        </CardTitle>
        <CardDescription>
          Control what information is visible to other users on your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Location</Label>
              <p className="text-sm text-muted-foreground">
                Show your location to other users
              </p>
            </div>
            <Switch
              checked={settings.show_location}
              onCheckedChange={(checked) => updateSetting('show_location', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Website</Label>
              <p className="text-sm text-muted-foreground">
                Display your website URL on your profile
              </p>
            </div>
            <Switch
              checked={settings.show_website}
              onCheckedChange={(checked) => updateSetting('show_website', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">LinkedIn</Label>
              <p className="text-sm text-muted-foreground">
                Show your LinkedIn profile link
              </p>
            </div>
            <Switch
              checked={settings.show_linkedin}
              onCheckedChange={(checked) => updateSetting('show_linkedin', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Skills</Label>
              <p className="text-sm text-muted-foreground">
                Display your skills and expertise
              </p>
            </div>
            <Switch
              checked={settings.show_skills}
              onCheckedChange={(checked) => updateSetting('show_skills', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Interests</Label>
              <p className="text-sm text-muted-foreground">
                Show your interests and hobbies
              </p>
            </div>
            <Switch
              checked={settings.show_interests}
              onCheckedChange={(checked) => updateSetting('show_interests', checked)}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={savePrivacySettings}
            disabled={isSaving}
            className="w-full flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Public information: Name, handle, avatar, and bio are always visible
          </p>
          <p className="flex items-center gap-1">
            <EyeOff className="h-3 w-3" />
            Private information: Controlled by the settings above
          </p>
        </div>
      </CardContent>
    </Card>
  );
}