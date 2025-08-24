import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, Edit2, Camera, MapPin, Briefcase, Calendar, Star, Award, Upload } from "lucide-react";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/features/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
  const [showAuth, setShowAuth] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    experience_level: '',
  });
  const { toast } = useToast();
  const { session } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar, uploading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEditClick = () => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        experience_level: profile.experience_level || '',
      });
    }
    setIsEditing(true);
  };

  const handleAddSkill = async () => {
    const newSkill = prompt("Enter a new skill:");
    if (newSkill && newSkill.trim() && profile) {
      const updatedSkills = [...(profile.skills || []), newSkill.trim()];
      try {
        await updateProfile({ skills: updatedSkills });
      } catch (error) {
        console.error('Failed to add skill:', error);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (profile) {
      const updatedSkills = (profile.skills || []).filter(skill => skill !== skillToRemove);
      try {
        await updateProfile({ skills: updatedSkills });
      } catch (error) {
        console.error('Failed to remove skill:', error);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 5MB.", variant: "destructive" });
        return;
      }
      
      await uploadAvatar(file);
    }
  };

  const stats = [
    { label: "Events Created", value: "23", icon: Calendar },
    { label: "Events Attended", value: "47", icon: User },
    { label: "Connections", value: "156", icon: User },
    { label: "Rating", value: "4.9", icon: Star },
  ];

  const displayName = profile?.full_name || profile?.handle || 'Anonymous User';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <ProtectedRoute>
          <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="kolab-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAvatarClick}>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editData.full_name}
                            onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="experience">Experience Level</Label>
                          <Input
                            id="experience"
                            value={editData.experience_level}
                            onChange={(e) => setEditData({...editData, experience_level: e.target.value})}
                            placeholder="e.g., 5+ years"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => setEditData({...editData, bio: e.target.value})}
                          rows={3}
                          placeholder="Tell others about yourself..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editData.location}
                            onChange={(e) => setEditData({...editData, location: e.target.value})}
                            placeholder="e.g., New York, NY"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={editData.website}
                            onChange={(e) => setEditData({...editData, website: e.target.value})}
                            placeholder="https://yoursite.com"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {profile?.bio && <p className="text-sm mt-2 text-muted-foreground">{profile.bio}</p>}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                        )}
                        {profile?.experience_level && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {profile.experience_level}
                          </div>
                        )}
                      </div>
                      {profile?.website && (
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 block"
                        >
                          {profile.website}
                        </a>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveProfile} disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={handleEditClick}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="kolab-card text-center">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Skills & Portfolio */}
          <Card className="kolab-card">
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || []).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleRemoveSkill(skill)}
                    title="Click to remove"
                  >
                    {skill} ×
                  </Badge>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddSkill}>
                  + Add Skill
                </Button>
              </div>
              {(profile?.skills || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet. Click "Add Skill" to get started.</p>
              )}
            </CardContent>
          </Card>


          {/* Recent Activity */}
          <Card className="kolab-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Created "Creative Photography Workshop"</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Connected with Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">1 week ago</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Attended "Tech Startup Networking Mixer"</p>
                    <p className="text-sm text-muted-foreground">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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