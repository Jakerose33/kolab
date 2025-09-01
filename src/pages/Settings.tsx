import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import { Bell, Shield, User, Palette, Globe, Smartphone, Download } from "lucide-react";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/features/auth/AuthProvider";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from '@/components/theme/ThemeProvider';

export default function Settings() {
  const [showAuth, setShowAuth] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    notificationPrefs, 
    privacySettings, 
    updateNotificationPrefs, 
    updatePrivacySettings,
    isUpdatingNotifications,
    isUpdatingPrivacy
  } = useSettings();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: "Account Deletion",
        description: "This feature will be available soon. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      await updateNotificationPrefs({ [key]: value });
    } catch (error) {
      console.error('Failed to update notification preference:', error);
    }
  };

  const handlePrivacyChange = async (key: string, value: boolean) => {
    try {
      await updatePrivacySettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
    }
  };

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <ProtectedRoute>
          <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and privacy settings
            </p>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="pwa">Mobile App</TabsTrigger>
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
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-enabled" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-enabled"
                      checked={notificationPrefs?.email_enabled ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('email_enabled', checked)}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-enabled" className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      id="push-enabled"
                      checked={notificationPrefs?.push_enabled ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('push_enabled', checked)}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="event-reminders" className="text-base">Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming events</p>
                    </div>
                    <Switch
                      id="event-reminders"
                      checked={notificationPrefs?.event_reminders ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('event_reminders', checked)}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-messages" className="text-base">New Messages</Label>
                      <p className="text-sm text-muted-foreground">Notifications for new direct messages</p>
                    </div>
                    <Switch
                      id="new-messages"
                      checked={notificationPrefs?.new_messages ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('new_messages', checked)}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="booking-confirmations" className="text-base">Booking Confirmations</Label>
                      <p className="text-sm text-muted-foreground">Notifications for booking updates</p>
                    </div>
                    <Switch
                      id="booking-confirmations"
                      checked={notificationPrefs?.booking_confirmations ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('booking_confirmations', checked)}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PWA/Mobile App Tab */}
            <TabsContent value="pwa" className="space-y-6">
              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile App Experience
                  </CardTitle>
                  <CardDescription>
                    Install Kolab as a native app and manage push notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Push notifications coming soon...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="kolab-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Progressive Web App
                  </CardTitle>
                  <CardDescription>
                    Install Kolab for offline access and better performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Offline event browsing</li>
                        <li>• Faster loading times</li>
                        <li>• Home screen shortcut</li>
                        <li>• Background sync</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Installation</h4>
                      <p className="text-sm text-muted-foreground">
                        Look for the install prompt or check your browser's address bar for the install option.
                      </p>
                    </div>
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
                    Control what information others can see about you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-location" className="text-base">Show Location</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your location</p>
                    </div>
                    <Switch
                      id="show-location"
                      checked={privacySettings?.show_location ?? false}
                      onCheckedChange={(checked) => handlePrivacyChange('show_location', checked)}
                      disabled={isUpdatingPrivacy}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-website" className="text-base">Show Website</Label>
                      <p className="text-sm text-muted-foreground">Display your website on your profile</p>
                    </div>
                    <Switch
                      id="show-website"
                      checked={privacySettings?.show_website ?? false}
                      onCheckedChange={(checked) => handlePrivacyChange('show_website', checked)}
                      disabled={isUpdatingPrivacy}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-linkedin" className="text-base">Show LinkedIn</Label>
                      <p className="text-sm text-muted-foreground">Display your LinkedIn profile</p>
                    </div>
                    <Switch
                      id="show-linkedin"
                      checked={privacySettings?.show_linkedin ?? false}
                      onCheckedChange={(checked) => handlePrivacyChange('show_linkedin', checked)}
                      disabled={isUpdatingPrivacy}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-skills" className="text-base">Show Skills</Label>
                      <p className="text-sm text-muted-foreground">Display your skills and expertise</p>
                    </div>
                    <Switch
                      id="show-skills"
                      checked={privacySettings?.show_skills ?? true}
                      onCheckedChange={(checked) => handlePrivacyChange('show_skills', checked)}
                      disabled={isUpdatingPrivacy}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-interests" className="text-base">Show Interests</Label>
                      <p className="text-sm text-muted-foreground">Display your interests and hobbies</p>
                    </div>
                    <Switch
                      id="show-interests"
                      checked={privacySettings?.show_interests ?? true}
                      onCheckedChange={(checked) => handlePrivacyChange('show_interests', checked)}
                      disabled={isUpdatingPrivacy}
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
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                       <p className="text-sm text-muted-foreground">Use dark theme</p>
                     </div>
                     <Switch
                       id="dark-mode"
                       checked={theme === 'dark'}
                       onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                     />
                   </div>
                  <Separator />
                  <div>
                    <Label htmlFor="language" className="text-base">Language</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select your preferred language</p>
                    <Select
                      value="en"
                      onValueChange={(value) => toast({ title: "Coming Soon", description: "Language selection will be available soon." })}
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
                      value="America/New_York"
                      onValueChange={(value) => toast({ title: "Coming Soon", description: "Timezone selection will be available soon." })}
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
                      value={session?.user?.email || 'Not set'}
                      disabled
                      className="mt-2"
                    />
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({ title: "Coming Soon", description: "Email change will be available soon." })}>
                      Change Email
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base">Password</Label>
                    <p className="text-sm text-muted-foreground mb-3">Keep your account secure</p>
                    <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "Password change will be available soon." })}>Change Password</Button>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base">Download Your Data</Label>
                    <p className="text-sm text-muted-foreground mb-3">Get a copy of your account data</p>
                    <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "Data export will be available soon." })}>Request Data Export</Button>
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
            <Button 
              onClick={() => toast({ title: "Settings Auto-Saved", description: "Your changes are saved automatically." })}
              className="kolab-button-primary"
            >
              Settings Auto-Save
            </Button>
          </div>
          </div>
          </main>
        </ProtectedRoute>
      </AppLayout>
      
      <MessagesDialog
        open={showMessagesDialog}
        onOpenChange={setShowMessagesDialog}
      />
      <NotificationsDrawer
        open={showNotificationsDialog}
        onOpenChange={setShowNotificationsDialog}
      />
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
}