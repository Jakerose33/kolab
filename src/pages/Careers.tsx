import { AppLayout } from "@/components/AppLayout";
import { CareerHub } from "@/components/CareerHub";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Careers() {
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
            <CareerHub />
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