import { AppLayout } from "@/components/AppLayout";
import { VenueBooking } from "@/components/VenueBooking";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Venues() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <ProtectedRoute>
          <main className="container px-4 py-8">
            <VenueBooking />
          </main>
        </ProtectedRoute>
      </AppLayout>
      
      <CreateEventWizard
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
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