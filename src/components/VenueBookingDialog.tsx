import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSecureForm } from "@/hooks/useSecureForm";
import { VenueValidation, MessageValidation } from "@/lib/validation";
import { bookVenue } from "@/lib/supabase";
import { CalendarIcon, MapPin, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

interface VenueBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  venue: {
    id: string;
    name: string;
    address: string;
    hourly_rate?: number;
  } | null;
}

const BookingSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  guest_count: z.number().positive("Guest count must be positive"),
  event_type: z.string().optional(),
  special_requests: z.string().optional(),
  message: MessageValidation.content.optional(),
});

export function VenueBookingDialog({ isOpen, onClose, venue }: VenueBookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: new Date(),
    end_date: new Date(),
    guest_count: '',
    event_type: '',
    special_requests: '',
    message: ''
  });
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const { toast } = useToast();

  if (!venue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bookingData = {
        venue_id: venue.id,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
        guest_count: parseInt(formData.guest_count),
        event_type: formData.event_type,
        special_requests: formData.special_requests,
        message: formData.message
      };

      const { data, error } = await bookVenue(bookingData);
      
      if (error) throw error;

      toast({
        title: "Booking request sent!",
        description: "The venue owner will review your request and get back to you soon.",
      });

      onClose();
      setFormData({
        start_date: new Date(),
        end_date: new Date(),
        guest_count: '',
        event_type: '',
        special_requests: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: "Error sending booking request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Book {venue.name}
          </DialogTitle>
          <DialogDescription>
            Send a booking request to the venue owner with your event details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venue Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">{venue.name}</h3>
            <p className="text-sm text-muted-foreground">{venue.address}</p>
            {venue.hourly_rate && (
              <p className="text-sm font-medium mt-1">
                £{venue.hourly_rate}/hour
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time *</Label>
              <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, "PPp")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, start_date: date }));
                        setShowStartCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time *</Label>
              <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.end_date, "PPp")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, end_date: date }));
                        setShowEndCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest_count" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Guests *
              </Label>
              <Input
                id="guest_count"
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_count: e.target.value }))}
                placeholder="How many people will attend?"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message to Venue Owner
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell the venue owner about your event..."
              rows={3}
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
              placeholder="Any special requirements or equipment needed?"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? "Sending Request..." : "Send Booking Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}