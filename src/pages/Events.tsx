import { AppLayout } from "@/components/AppLayout";
import { EventCard } from "@/components/EventCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample events data
const sampleEvents = [
  {
    id: "1",
    title: "Underground Art Gallery Opening",
    description: "Exclusive underground art exhibition featuring emerging local artists",
    start_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_at: null,
    venue_name: "Hidden Gallery",
    venue_address: "Downtown",
    capacity: 50,
    tags: ["Art", "Gallery"],
    image_url: "/images/events/street-art-opening.jpg",
    status: "published",
    organizer_id: "organizer1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Art Curator",
      handle: "artcurator"
    }
  },
  {
    id: "2", 
    title: "Midnight Jazz Session",
    description: "Intimate jazz performance in a secret speakeasy location",
    start_at: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_at: null,
    venue_name: "The Vault",
    venue_address: "City Center", 
    capacity: 40,
    tags: ["Music", "Jazz"],
    image_url: "/images/events/midnight-jazz.jpg",
    status: "published",
    organizer_id: "organizer2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Jazz Collective",
      handle: "jazzvibes"
    }
  },
  {
    id: "3",
    title: "Warehouse Rave",
    description: "Electronic music event in an abandoned warehouse with top DJs",
    start_at: new Date(Date.now() + 604800000).toISOString(), // Next week
    end_at: null,
    venue_name: "Warehouse District",
    venue_address: "Industrial Area",
    capacity: 200,
    tags: ["Music", "Electronic", "Rave"],
    image_url: "/images/events/warehouse-rave.jpg",
    status: "published", 
    organizer_id: "organizer3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Underground Events",
      handle: "undergroundevents"
    }
  }
];

const sampleCategories = [
  { id: "art", name: "Art", icon: null, count: 5 },
  { id: "music", name: "Music", icon: null, count: 8 },
  { id: "nightlife", name: "Nightlife", icon: null, count: 3 },
  { id: "food", name: "Food", icon: null, count: 4 }
];

export default function Events() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <main className="container px-4 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-muted-foreground">
                Discover and create amazing events in your area
              </p>
            </div>
            
            {/* Category Filter */}
            <CategoryFilter 
              categories={sampleCategories}
              selectedCategory={selectedCategory === "All" ? null : selectedCategory}
              onCategorySelect={(categoryId) => setSelectedCategory(categoryId || "All")}
            />
            
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onShare={(eventId) => toast({ title: "Event shared!" })}
                />
              ))}
            </div>
          </div>
        </main>
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