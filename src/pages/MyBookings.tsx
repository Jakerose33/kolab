import { useState, useEffect } from "react";
import { KolabHeader } from "@/components/KolabHeader";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getUserBookings, getUserRSVPs } from "@/lib/supabase";

// Enhanced booking data with more realistic details
const mockBookings = [
  {
    id: "1",
    type: "event",
    title: "Creative Photography Workshop",
    date: "March 15, 2024",
    time: "2:00 PM",
    endTime: "5:00 PM",
    location: "Downtown Art Studio",
    address: "123 Collins Street, Melbourne VIC 3000",
    status: "confirmed",
    organizer: "Sarah Chen",
    organizerEmail: "sarah@creativestudio.com",
    price: 45,
    bookingDate: "March 10, 2024",
    attendees: 12,
    maxAttendees: 15,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=200&fit=crop",
    description: "Learn professional photography techniques in this hands-on workshop.",
    category: "Art & Photography",
    refundable: true,
    refundDeadline: "March 13, 2024",
  },
  {
    id: "2",
    type: "venue",
    title: "Urban Studio Loft",
    date: "March 20, 2024",
    time: "10:00 AM",
    endTime: "6:00 PM",
    location: "Downtown District",
    address: "456 Swanston Street, Melbourne VIC 3000",
    status: "pending",
    organizer: "Jake Rose",
    organizerEmail: "jake@urbanstudios.com",
    price: 150,
    bookingDate: "March 12, 2024",
    attendees: 1,
    maxAttendees: 8,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
    description: "Premium studio space for creative projects and photography.",
    category: "Venue Rental",
    refundable: true,
    refundDeadline: "March 18, 2024",
  },
  {
    id: "3",
    type: "event",
    title: "Tech Startup Networking Mixer",
    date: "March 25, 2024",
    time: "6:30 PM",
    endTime: "9:30 PM",
    location: "Innovation Hub",
    address: "789 La Trobe Street, Melbourne VIC 3000",
    status: "confirmed",
    organizer: "Marcus Johnson",
    organizerEmail: "marcus@techhub.com",
    price: 0,
    bookingDate: "March 8, 2024",
    attendees: 45,
    maxAttendees: 60,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop",
    description: "Connect with fellow entrepreneurs and startup founders.",
    category: "Business & Networking",
    refundable: false,
    refundDeadline: null,
  },
  {
    id: "4",
    type: "event",
    title: "Jazz Quartet Evening",
    date: "March 18, 2024",
    time: "8:00 PM",
    endTime: "11:00 PM",
    location: "Bennett's Lane Jazz Club",
    address: "25 Bennett's Lane, Melbourne VIC 3000",
    status: "confirmed",
    organizer: "Jazz Society Melbourne",
    organizerEmail: "events@jazzsociety.com",
    price: 35,
    bookingDate: "March 5, 2024",
    attendees: 65,
    maxAttendees: 80,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
    description: "Intimate jazz performance featuring Melbourne's finest quartet.",
    category: "Music & Entertainment",
    refundable: true,
    refundDeadline: "March 16, 2024",
  },
  {
    id: "5",
    type: "event",
    title: "Digital Art Workshop",
    date: "March 12, 2024",
    time: "1:00 PM",
    endTime: "4:00 PM",
    location: "Creative Space Collingwood",
    address: "101 Smith Street, Collingwood VIC 3066",
    status: "cancelled",
    organizer: "Digital Arts Studio",
    organizerEmail: "hello@digitalarts.com",
    price: 65,
    bookingDate: "March 1, 2024",
    attendees: 8,
    maxAttendees: 12,
    image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=300&h=200&fit=crop",
    description: "Introduction to digital art creation and design principles.",
    category: "Art & Photography",
    refundable: true,
    refundDeadline: "March 10, 2024",
  }
];

export default function MyBookings() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [bookings, setBookings] = useState(mockBookings);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { toast } = useToast();

  // Load real bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const [bookingsResult, rsvpsResult] = await Promise.all([
          getUserBookings(),
          getUserRSVPs()
        ]);

        if (bookingsResult.error) throw bookingsResult.error;
        if (rsvpsResult.error) throw rsvpsResult.error;

        // Merge real data with mock data for demo
        const realBookings = (bookingsResult.data || []).map((booking: any) => ({
          id: booking.id,
          type: "venue",
          title: booking.venues?.name || "Venue Booking",
          date: new Date(booking.start_date).toLocaleDateString(),
          time: new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(booking.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: booking.venues?.name || "Venue",
          address: booking.venues?.address || "Address TBD",
          status: booking.status,
          organizer: "Venue Owner",
          organizerEmail: "venue@email.com",
          price: booking.total_amount || 0,
          bookingDate: new Date(booking.created_at).toLocaleDateString(),
          attendees: booking.guest_count,
          maxAttendees: booking.guest_count,
          image: booking.venues?.images?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
          description: booking.message || booking.special_requests || "Venue booking request",
          category: booking.event_type || "Venue",
          refundable: booking.status === 'pending',
          refundDeadline: booking.status === 'pending' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : null,
        }));
        
        const realRSVPs = rsvpsResult.data || [];
        
        // Convert RSVPs to booking format
        const rsvpBookings = realRSVPs.map((rsvp: any) => ({
          id: rsvp.id,
          type: "event",
          title: `Event RSVP - ${rsvp.event_id}`,
          date: new Date(rsvp.created_at).toLocaleDateString(),
          time: "TBD",
          endTime: "TBD",
          location: "TBD",
          address: "TBD",
          status: rsvp.status === 'going' ? 'confirmed' : 'pending',
          organizer: "Event Organizer",
          organizerEmail: "organizer@email.com",
          price: 0,
          bookingDate: new Date(rsvp.created_at).toLocaleDateString(),
          attendees: 1,
          maxAttendees: 100,
          image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop",
          description: `RSVP status: ${rsvp.status}`,
          category: "Event",
          refundable: false,
          refundDeadline: null,
        }));

        // Show real data if available, otherwise show mock data
        if (realBookings.length > 0 || rsvpBookings.length > 0) {
          setBookings([...realBookings, ...rsvpBookings]);
        }
      } catch (error: any) {
        console.error('Error loading bookings:', error);
        // Keep mock data on error
      }
      setLoading(false);
    };
    
    fetchBookings();
  }, []);

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

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    toast({
      title: "Bookings Updated",
      description: "Your booking list has been refreshed.",
    });
  };

  const handleExportBookings = () => {
    toast({
      title: "Export Started",
      description: "Your bookings are being exported to CSV.",
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

  // Enhanced filtering and sorting
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesType = typeFilter === "all" || booking.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "price":
          return a.price - b.price;
        case "status":
          return a.status.localeCompare(b.status);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const confirmedBookings = filteredAndSortedBookings.filter(b => b.status === "confirmed");
  const pendingBookings = filteredAndSortedBookings.filter(b => b.status === "pending");
  const pastBookings = filteredAndSortedBookings.filter(b => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => setShowMessagesDialog(true)}
        onOpenNotifications={() => setShowNotificationsDialog(true)}
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

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="venue">Venues</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportBookings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({filteredAndSortedBookings.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="kolab-card overflow-hidden">
                      <Skeleton className="w-full h-32" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAndSortedBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedBookings.map((booking) => (
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
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{booking.title}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Booking
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {booking.time} - {booking.endTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {booking.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {booking.attendees}/{booking.maxAttendees} attending
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {booking.category}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold">
                            {booking.price === 0 ? "Free" : `$${booking.price}`}
                          </div>
                          {booking.refundable && booking.status !== "cancelled" && (
                            <Badge variant="secondary" className="text-xs">
                              Refundable
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Booked on {booking.bookingDate}
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
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "You haven't made any bookings yet."}
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}>
                    Clear filters
                  </Button>
                </div>
              )}
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
      
      <CreateEventWizard
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEvent={(eventData) => {
          toast({
            title: "Event Created",
            description: `${eventData.title} has been created successfully.`,
          });
        }}
      />
      
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