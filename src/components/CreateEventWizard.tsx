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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createEvent } from "@/lib/supabase";
import { CalendarIcon, MapPin, Users, Clock, Tag, X } from "lucide-react";
import { format } from "date-fns";

interface CreateEventWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreateEvent?: (eventData: any) => void;
}

const EVENT_TAGS = [
  'Music', 'Art', 'Food', 'Tech', 'Sports', 'Business', 'Education', 
  'Social', 'Gaming', 'Wellness', 'Creative', 'Community'
];

export function CreateEventWizard({ 
  isOpen, 
  onClose, 
  open, 
  onOpenChange, 
  onCreateEvent 
}: CreateEventWizardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_at: new Date(),
    end_at: new Date(),
    venue_name: '',
    venue_address: '',
    capacity: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published'
  });
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        start_at: formData.start_at.toISOString(),
        end_at: formData.end_at.toISOString(),
      };

      const { data, error } = await createEvent(eventData);
      
      if (error) throw error;

      toast({
        title: formData.status === 'published' ? "Event published!" : "Event saved as draft!",
        description: formData.status === 'published' 
          ? "Your event is now live and visible to everyone."
          : "You can continue editing and publish when ready.",
      });

      // Call legacy callback if provided
      if (onCreateEvent) {
        onCreateEvent(data);
      }

      // Close dialog using either callback
      if (onClose) onClose();
      if (onOpenChange) onOpenChange(false);
      
      setFormData({
        title: '', description: '', start_at: new Date(), end_at: new Date(),
        venue_name: '', venue_address: '', capacity: '', tags: [], status: 'draft'
      });
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <Dialog open={isOpen || open} onOpenChange={onClose || onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create your event. You can save as draft or publish immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's your event called?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell people about your event..."
                rows={3}
              />
            </div>
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
                    {format(formData.start_at, "PPp")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_at}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, start_at: date }));
                        setShowStartCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {format(formData.end_at, "PPp")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_at}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, end_at: date }));
                        setShowEndCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue_name" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue Name
              </Label>
              <Input
                id="venue_name"
                value={formData.venue_name}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                placeholder="Where is your event?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_address">Address</Label>
              <Input
                id="venue_address"
                value={formData.venue_address}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                placeholder="Full address including postcode"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacity (Optional)
            </Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="How many people can attend?"
              min="1"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <Select onValueChange={addTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags to help people find your event" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TAGS.filter(tag => !formData.tags.includes(tag)).map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                handleSubmit(new Event('submit') as any);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'published' }));
                handleSubmit(new Event('submit') as any);
              }}
              disabled={isLoading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? "Publishing..." : "Publish Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}