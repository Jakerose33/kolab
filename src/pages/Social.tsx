import { KolabHeader } from "@/components/KolabHeader";
import { SocialHub } from "@/components/SocialHub";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Social() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => setShowMessagesDialog(true)}
        onOpenNotifications={() => setShowNotificationsDialog(true)}
      />
      
      <main className="container px-4 py-8">
        <SocialHub />
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