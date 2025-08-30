import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, MapPin, Users, CreditCard, Clock } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { LoadingState } from "@/components/LoadingState";

// Mock event data - in real app, fetch from database
const getEventData = (id: string) => {
  const events = {
    '1': {
      id: '1',
      title: 'Underground Art Gallery Opening',
      description: 'Exclusive underground art exhibition featuring emerging local artists',
      start_at: new Date(Date.now() + 86400000).toISOString(),
      venue_name: 'Hidden Gallery',
      venue_address: 'Downtown Arts District',
      capacity: 50,
      tags: ['Art', 'Gallery'],
      image_url: '/images/events/street-art-opening.jpg',
      organizer: { name: 'Art Curator', handle: 'artcurator' },
      price: 25
    },
    '2': {
      id: '2',
      title: 'Midnight Jazz Session',
      description: 'Intimate jazz performance in a secret speakeasy location',
      start_at: new Date(Date.now() + 172800000).toISOString(),
      venue_name: 'The Vault',
      venue_address: 'City Center Underground',
      capacity: 40,
      tags: ['Music', 'Jazz'],
      image_url: '/images/events/midnight-jazz.jpg',
      organizer: { name: 'Jazz Collective', handle: 'jazzvibes' },
      price: 35
    },
    '3': {
      id: '3',
      title: 'Warehouse Rave',
      description: 'Electronic music event in an abandoned warehouse with top DJs',
      start_at: new Date(Date.now() + 604800000).toISOString(),
      venue_name: 'Warehouse District',
      venue_address: 'Industrial Area',
      capacity: 200,
      tags: ['Music', 'Electronic', 'Rave'],
      image_url: '/images/events/warehouse-rave.jpg',
      organizer: { name: 'Underground Events', handle: 'undergroundevents' },
      price: 45
    }
  };
  return events[id as keyof typeof events];
};

export default function EventBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [attendeeType, setAttendeeType] = useState('general');

  useEffect(() => {
    if (!id) {
      navigate('/events');
      return;
    }

    // Simulate loading event data
    setTimeout(() => {
      const eventData = getEventData(id);
      if (eventData) {
        setEvent(eventData);
      }
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!session?.user || !event) return;

    setIsBooking(true);
    
    try {
      // Create booking record
      const bookingData = {
        event_id: event.id,
        user_id: session.user.id,
        ticket_count: ticketCount,
        total_amount: event.price * ticketCount,
        special_requests: specialRequests,
        attendee_type: attendeeType,
        status: 'pending'
      };

      // In real app, this would be stored in database
      console.log('Booking data:', bookingData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success and redirect
      toast({
        title: "Booking Request Sent!",
        description: `Your booking for ${ticketCount} ticket(s) has been submitted. You'll receive confirmation soon.`,
      });

      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to process your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">The event you're trying to book doesn't exist.</p>
            <Button onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const subtotal = event.price * ticketCount;
  const serviceFee = subtotal * 0.1; // 10% service fee
  const total = subtotal + serviceFee;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${event.id}`)}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Event
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.start_at), "PPP 'at' p")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue_name}, {event.venue_address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {event.capacity} people</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Organized by {event.organizer.name}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Book Your Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Tickets</label>
                  <Select value={ticketCount.toString()} onValueChange={(value) => setTicketCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'ticket' : 'tickets'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attendee Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendee Type</label>
                  <Select value={attendeeType} onValueChange={setAttendeeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Admission</SelectItem>
                      <SelectItem value="vip">VIP Experience</SelectItem>
                      <SelectItem value="student">Student (ID Required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Requests (Optional)</label>
                  <Textarea
                    placeholder="Any special requirements or requests..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>{ticketCount} × ${event.price}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button 
                  onClick={handleBooking}
                  className="w-full"
                  size="lg"
                  disabled={isBooking}
                >
                  {isBooking ? "Processing..." : `Book ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By booking, you agree to our terms and conditions. 
                  Refunds available up to 24 hours before the event.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}