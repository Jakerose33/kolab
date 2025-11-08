import { AdminDashboard } from "@/components/AdminDashboard";
import { KolabHeader } from "@/components/KolabHeader";
import { AdminRoute } from "@/components/AdminRoute";
import { HeroImageManager } from "@/components/admin/HeroImageManager";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <KolabHeader
          onCreateEvent={() => setShowCreateDialog(true)}
          onOpenMessages={() => setShowMessagesDialog(true)}
          onOpenNotifications={() => setShowNotificationsDialog(true)}
        />
        
        <main className="container px-4 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="site-settings">Site Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            
            <TabsContent value="site-settings">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Site Settings</h2>
                  <p className="text-muted-foreground">Manage your site's appearance and content</p>
                </div>
                <HeroImageManager />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminRoute>
  );
}