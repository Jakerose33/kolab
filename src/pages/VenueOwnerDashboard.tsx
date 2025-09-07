import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Eye,
  Edit,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { format } from "date-fns";

interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  hourly_rate: number;
  capacity: number;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  venue_id: string;
  start_date: string;
  end_date: string;
  guest_count: number;
  event_type: string;
  status: string;
  payment_status: string;
  message: string;
  created_at: string;
  user_id: string;
  venue: {
    name: string;
  };
  user_profile?: {
    full_name?: string;
  } | null;
}

interface VenueAnalytics {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  avg_booking_value: number;
}

export default function VenueOwnerDashboard() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<VenueAnalytics>({
    total_bookings: 0,
    total_revenue: 0,
    occupancy_rate: 0,
    avg_booking_value: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load venues owned by current user
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('owner_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (venuesError) throw venuesError;

      // Load bookings for user's venues - simplified query
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('venue_bookings')
        .select(`
          *,
          venue:venues!inner(name)
        `)
        .eq('venue.owner_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Calculate analytics
      const totalBookings = bookingsData?.filter(b => b.status === 'confirmed').length || 0;
      const totalRevenue = bookingsData?.reduce((sum, booking) => {
        if (booking.status === 'confirmed' && booking.payment_status === 'paid') {
          const hours = Math.ceil(
            (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60)
          );
          const venue = venuesData?.find(v => v.id === booking.venue_id);
          return sum + (hours * (venue?.hourly_rate || 0));
        }
        return sum;
      }, 0) || 0;

      setVenues(venuesData || []);
      setBookings(bookingsData || []);
      setAnalytics({
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        occupancy_rate: totalBookings > 0 ? (totalBookings / Math.max(venuesData?.length || 1, 1)) * 10 : 0,
        avg_booking_value: totalBookings > 0 ? totalRevenue / totalBookings : 0
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Dashboard",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'decline') => {
    try {
      const status = action === 'approve' ? 'confirmed' : 'declined';
      
      const { error } = await supabase
        .from('venue_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Reload data
      loadDashboardData();
      
      toast({
        title: `Booking ${action === 'approve' ? 'Approved' : 'Declined'}`,
        description: `The booking has been ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} booking. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      confirmed: { label: "Confirmed", variant: "default" as const },
      declined: { label: "Declined", variant: "destructive" as const },
      cancelled: { label: "Cancelled", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { label: "Unpaid", variant: "secondary" as const },
      pending: { label: "Pending", variant: "secondary" as const },
      paid: { label: "Paid", variant: "default" as const },
      failed: { label: "Failed", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!session?.user) {
    return (
      <EmptyState
        icon={Building}
        title="Authentication Required"
        description="Please sign in to access your venue owner dashboard."
      />
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venue Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your venues and bookings</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Venue
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_bookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_revenue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.avg_booking_value.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="venues">My Venues</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {(bookings || []).slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {(bookings || []).slice(0, 5).map((booking) => (
                      <div key={booking?.id || Math.random()} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{booking?.venue?.name || 'Unknown Venue'}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking?.start_date ? format(new Date(booking.start_date), 'MMM dd, yyyy') : 'Date TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking?.status || 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Venue Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {(venues || []).length > 0 ? (
                  <div className="space-y-4">
                    {(venues || []).slice(0, 3).map((venue) => {
                      const venueBookings = (bookings || []).filter(b => b?.venue_id === venue?.id && b?.status === 'confirmed');
                      return (
                        <div key={venue?.id || Math.random()} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium">{venue?.name || 'Unknown Venue'}</p>
                            <p className="text-sm text-muted-foreground">
                              {venueBookings.length} bookings
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${venue?.hourly_rate || 0}/hr</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No venues created yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          {(venues || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(venues || []).map((venue) => (
                <Card key={venue?.id || Math.random()}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{venue?.name || 'Unknown Venue'}</span>
                      <Badge variant={venue?.status === 'active' ? 'default' : 'secondary'}>
                        {venue?.status || 'inactive'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue?.description || 'No description available'}
                    </p>
                    
                    <div className="flex justify-between text-sm">
                      <span>Capacity: {venue?.capacity || 0} people</span>
                      <span className="font-medium">${venue?.hourly_rate || 0}/hr</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building}
              title="No venues yet"
              description="Create your first venue to start receiving bookings."
              action={{
                label: "Add Venue",
                onClick: () => toast({ title: "Feature coming soon!" })
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {(bookings || []).length > 0 ? (
            <div className="space-y-4">
              {(bookings || []).map((booking) => (
                <Card key={booking?.id || Math.random()}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{booking?.venue?.name || 'Unknown Venue'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking?.user_profile?.full_name || 'Unknown User'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(booking?.status || 'pending')}
                        {getPaymentStatusBadge(booking?.payment_status || 'unpaid')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {booking?.start_date ? format(new Date(booking.start_date), 'MMM dd, yyyy HH:mm') : 'Date TBD'} - 
                          {booking?.end_date ? format(new Date(booking.end_date), 'HH:mm') : 'Time TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Guest Count</p>
                        <p className="text-sm text-muted-foreground">{booking?.guest_count || 0} people</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Event Type</p>
                        <p className="text-sm text-muted-foreground">{booking?.event_type || 'Event'}</p>
                      </div>
                    </div>

                    {booking?.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium">Message</p>
                        <p className="text-sm text-muted-foreground">{booking.message}</p>
                      </div>
                    )}

                    {booking?.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleBookingAction(booking?.id || '', 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBookingAction(booking?.id || '', 'decline')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No bookings yet"
              description="Bookings for your venues will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}