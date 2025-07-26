import { KolabHeader } from "@/components/KolabHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Star, Users, CheckCircle, XCircle } from "lucide-react";

// Mock booking data
const mockBookings = [
  {
    id: "1",
    type: "event",
    title: "Creative Photography Workshop",
    date: "March 15, 2024",
    time: "2:00 PM",
    location: "Downtown Art Studio",
    status: "confirmed",
    organizer: "Sarah Chen",
    price: 45,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=200&fit=crop",
  },
  {
    id: "2",
    type: "venue",
    title: "Urban Studio Loft",
    date: "March 20, 2024",
    time: "10:00 AM - 6:00 PM",
    location: "Downtown District",
    status: "pending",
    organizer: "Jake Rose",
    price: 150,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
  },
  {
    id: "3",
    type: "event",
    title: "Tech Startup Networking Mixer",
    date: "March 25, 2024",
    time: "6:30 PM",
    location: "Innovation Hub",
    status: "confirmed",
    organizer: "Marcus Johnson",
    price: 0,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop",
  },
];

export default function MyBookings() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [bookings, setBookings] = useState(mockBookings);
  const { toast } = useToast();

  const handleCancelBooking = (bookingId: string, title: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "cancelled" }
        : booking
    ));
    toast({
      title: "Booking Cancelled",
      description: `Your booking for "${title}" has been cancelled.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const pastBookings = bookings.filter(b => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => toast({ title: "Messages", description: "Opening messages..." })}
        onOpenNotifications={() => toast({ title: "Notifications", description: "Opening notifications..." })}
      />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your event registrations and venue bookings
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="kolab-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{confirmedBookings.length}</div>
                <div className="text-sm text-muted-foreground">Confirmed Bookings</div>
              </CardContent>
            </Card>
            <Card className="kolab-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-500">{pendingBookings.length}</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </CardContent>
            </Card>
            <Card className="kolab-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-muted-foreground">{pastBookings.length}</div>
                <div className="text-sm text-muted-foreground">Past/Cancelled</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="kolab-card overflow-hidden">
                    <div className="relative">
                      <img
                        src={booking.image}
                        alt={booking.title}
                        className="w-full h-32 object-cover"
                      />
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(booking.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </Badge>
                      <Badge className="absolute top-2 left-2 bg-background/80 text-foreground border">
                        {booking.type === "event" ? "Event" : "Venue"}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{booking.title}</CardTitle>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {booking.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {booking.organizer}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">
                          {booking.price === 0 ? "Free" : `$${booking.price}`}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        {booking.status !== "cancelled" && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id, booking.title)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {confirmedBookings.map((booking) => (
                  <Card key={booking.id} className="kolab-card overflow-hidden">
                    {/* Same card structure */}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingBookings.map((booking) => (
                    <Card key={booking.id} className="kolab-card overflow-hidden">
                      {/* Same card structure */}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Bookings</h3>
                  <p className="text-muted-foreground">All your bookings are confirmed or completed.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="kolab-card overflow-hidden opacity-75">
                      {/* Same card structure */}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Past Bookings</h3>
                  <p className="text-muted-foreground">Your booking history will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}