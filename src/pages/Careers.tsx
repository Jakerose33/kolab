import { KolabHeader } from "@/components/KolabHeader";
import { CareerHub } from "@/components/CareerHub";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Careers() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => toast({ title: "Messages", description: "Opening messages..." })}
        onOpenNotifications={() => toast({ title: "Notifications", description: "Opening notifications..." })}
      />
      
      <main className="container px-4 py-8">
        <CareerHub />
      </main>
    </div>
  );
}