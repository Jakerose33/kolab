import { KolabHeader } from "@/components/KolabHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, User, Palette, Globe, Smartphone } from "lucide-react";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";

export default function Settings() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailUpdates: true,
      pushNotifications: true,
      eventReminders: true,
      socialUpdates: false,
    },
    privacy: {
      profileVisibility: "public",
      showLocation: true,
      showEmail: false,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "America/New_York",
    }
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature will be available soon. Please contact support.",
      variant: "destructive",
    });
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => setShowMessagesDialog(true)}
        onOpenNotifications={() => setShowNotificationsDialog(true)}
      />
      
      <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and privacy settings
            </p>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about events and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-updates" className="text-base">Email Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive event updates and newsletters</p>
                    </div>
                    <Switch
                      id="email-updates"
                      checked={settings.notifications.emailUpdates}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailUpdates', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get instant notifications on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="event-reminders" className="text-base">Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders before events you've joined</p>
                    </div>
                    <Switch
                      id="event-reminders"
                      checked={settings.notifications.eventReminders}
                      onCheckedChange={(checked) => updateSetting('notifications', 'eventReminders', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="social-updates" className="text-base">Social Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications from connections and groups</p>
                    </div>
                    <Switch
                      id="social-updates"
                      checked={settings.notifications.socialUpdates}
                      onCheckedChange={(checked) => updateSetting('notifications', 'socialUpdates', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground mb-3">Who can see your profile</p>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-location" className="text-base">Show Location</Label>
                      <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                    </div>
                    <Switch
                      id="show-location"
                      checked={settings.privacy.showLocation}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showLocation', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-email" className="text-base">Show Email</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => updateSetting('privacy', 'showEmail', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    App Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your app experience and display settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="theme" className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => updateSetting('preferences', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="language" className="text-base">Language</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select your preferred language</p>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => updateSetting('preferences', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="timezone" className="text-base">Timezone</Label>
                    <p className="text-sm text-muted-foreground mb-3">Your local timezone for events</p>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) => updateSetting('preferences', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="current-email" className="text-base">Email Address</Label>
                    <Input
                      id="current-email"
                      type="email"
                      value="jake@kolab.com"
                      disabled
                      className="mt-2"
                    />
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Email
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base">Password</Label>
                    <p className="text-sm text-muted-foreground mb-3">Keep your account secure</p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base">Download Your Data</Label>
                    <p className="text-sm text-muted-foreground mb-3">Get a copy of your account data</p>
                    <Button variant="outline">Request Data Export</Button>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground mb-3">Permanently delete your account</p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="kolab-button-primary">
              Save All Settings
            </Button>
          </div>
        </div>
      </main>
      
      <MessagesDialog
        open={showMessagesDialog}
        onOpenChange={setShowMessagesDialog}
      />
      <NotificationsDrawer
        open={showNotificationsDialog}
        onOpenChange={setShowNotificationsDialog}
      />
    </div>
  );
}