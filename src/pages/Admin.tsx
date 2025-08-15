import { AdminDashboard } from "@/components/AdminDashboard";
import { KolabHeader } from "@/components/KolabHeader";
import { useState } from "react";

export default function Admin() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => setShowMessagesDialog(true)}
        onOpenNotifications={() => setShowNotificationsDialog(true)}
      />
      
      <main className="container px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  );
}