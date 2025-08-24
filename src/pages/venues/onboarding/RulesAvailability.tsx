import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Calendar, Shield } from "lucide-react";

interface RulesAvailabilityProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const eventTypes = [
  "Corporate Events", "Weddings", "Parties", "Workshops", "Conferences", 
  "Art Shows", "Concerts", "Fundraisers", "Product Launches", "Other"
];

export function RulesAvailability({ data, onUpdate, onNext }: RulesAvailabilityProps) {
  const [formData, setFormData] = useState({
    // Availability
    availableDays: data.availableDays || [],
    openingTime: data.openingTime || "09:00",
    closingTime: data.closingTime || "22:00",
    minimumBookingHours: data.minimumBookingHours || "2",
    maximumBookingHours: data.maximumBookingHours || "12",
    bookingAdvanceNotice: data.bookingAdvanceNotice || "24",
    
    // Rules
    allowedEventTypes: data.allowedEventTypes || [],
    alcoholAllowed: data.alcoholAllowed || false,
    smokingAllowed: data.smokingAllowed || false,
    cateringRequired: data.cateringRequired || false,
    securityRequired: data.securityRequired || false,
    cleaningFee: data.cleaningFee || "",
    securityDeposit: data.securityDeposit || "",
    
    // Policies
    cancellationPolicy: data.cancellationPolicy || "24_hours",
    noiseRestrictions: data.noiseRestrictions || "",
    setupCleanupTime: data.setupCleanupTime || "1",
    additionalRules: data.additionalRules || "",
    
    // Special requirements
    requiresApproval: data.requiresApproval || true,
    autoApprove: data.autoApprove || false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availableDays: checked
        ? [...prev.availableDays, day]
        : prev.availableDays.filter((d: string) => d !== day)
    }));
  };

  const handleEventTypeToggle = (eventType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowedEventTypes: checked
        ? [...prev.allowedEventTypes, eventType]
        : prev.allowedEventTypes.filter((t: string) => t !== eventType)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (formData.availableDays.length === 0) {
        toast({
          title: "Availability Required",
          description: "Please select at least one available day.",
          variant: "destructive",
        });
        return;
      }

      if (formData.allowedEventTypes.length === 0) {
        toast({
          title: "Event Types Required",
          description: "Please select at least one allowed event type.",
          variant: "destructive",
        });
        return;
      }

      // Update parent component data
      onUpdate(formData);
      
      toast({
        title: "Rules & Availability Saved",
        description: "Your venue rules and availability have been saved successfully.",
      });

      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error saving rules and availability:", error);
      toast({
        title: "Error",
        description: "Failed to save rules and availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Availability</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Available Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.availableDays.includes(day)}
                    onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-sm">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                type="time"
                value={formData.openingTime}
                onChange={(e) => handleInputChange("openingTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                type="time"
                value={formData.closingTime}
                onChange={(e) => handleInputChange("closingTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minimumBookingHours">Minimum Booking (hours)</Label>
              <Input
                id="minimumBookingHours"
                type="number"
                min="1"
                value={formData.minimumBookingHours}
                onChange={(e) => handleInputChange("minimumBookingHours", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maximumBookingHours">Maximum Booking (hours)</Label>
              <Input
                id="maximumBookingHours"
                type="number"
                min="1"
                value={formData.maximumBookingHours}
                onChange={(e) => handleInputChange("maximumBookingHours", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bookingAdvanceNotice">Advance Notice (hours)</Label>
              <Input
                id="bookingAdvanceNotice"
                type="number"
                min="1"
                value={formData.bookingAdvanceNotice}
                onChange={(e) => handleInputChange("bookingAdvanceNotice", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types & Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Event Types & Restrictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Allowed Event Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {eventTypes.map((eventType) => (
                <div key={eventType} className="flex items-center space-x-2">
                  <Checkbox
                    id={eventType}
                    checked={formData.allowedEventTypes.includes(eventType)}
                    onCheckedChange={(checked) => handleEventTypeToggle(eventType, checked as boolean)}
                  />
                  <Label htmlFor={eventType} className="text-sm">
                    {eventType}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="alcoholAllowed">Alcohol Allowed</Label>
              <Switch
                id="alcoholAllowed"
                checked={formData.alcoholAllowed}
                onCheckedChange={(checked) => handleInputChange("alcoholAllowed", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
              <Switch
                id="smokingAllowed"
                checked={formData.smokingAllowed}
                onCheckedChange={(checked) => handleInputChange("smokingAllowed", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cateringRequired">Catering Required</Label>
              <Switch
                id="cateringRequired"
                checked={formData.cateringRequired}
                onCheckedChange={(checked) => handleInputChange("cateringRequired", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="securityRequired">Security Required</Label>
              <Switch
                id="securityRequired"
                checked={formData.securityRequired}
                onCheckedChange={(checked) => handleInputChange("securityRequired", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fees & Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Fees & Policies</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cleaningFee">Cleaning Fee ($)</Label>
              <Input
                id="cleaningFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.cleaningFee}
                onChange={(e) => handleInputChange("cleaningFee", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
              <Input
                id="securityDeposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.securityDeposit}
                onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="setupCleanupTime">Setup/Cleanup Time (hours)</Label>
              <Input
                id="setupCleanupTime"
                type="number"
                min="0"
                step="0.5"
                value={formData.setupCleanupTime}
                onChange={(e) => handleInputChange("setupCleanupTime", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Select
              value={formData.cancellationPolicy}
              onValueChange={(value) => handleInputChange("cancellationPolicy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24_hours">24 hours notice</SelectItem>
                <SelectItem value="48_hours">48 hours notice</SelectItem>
                <SelectItem value="1_week">1 week notice</SelectItem>
                <SelectItem value="2_weeks">2 weeks notice</SelectItem>
                <SelectItem value="no_refund">No refunds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="noiseRestrictions">Noise Restrictions</Label>
            <Textarea
              id="noiseRestrictions"
              value={formData.noiseRestrictions}
              onChange={(e) => handleInputChange("noiseRestrictions", e.target.value)}
              placeholder="Describe any noise level restrictions or quiet hours..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additionalRules">Additional Rules & Requirements</Label>
            <Textarea
              id="additionalRules"
              value={formData.additionalRules}
              onChange={(e) => handleInputChange("additionalRules", e.target.value)}
              placeholder="Any other rules, restrictions, or requirements..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Approval */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requiresApproval">Require Manual Approval</Label>
              <p className="text-sm text-muted-foreground">
                Review and approve each booking request manually
              </p>
            </div>
            <Switch
              id="requiresApproval"
              checked={formData.requiresApproval}
              onCheckedChange={(checked) => handleInputChange("requiresApproval", checked)}
            />
          </div>

          {!formData.requiresApproval && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApprove">Auto-approve Bookings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve bookings that meet your criteria
                </p>
              </div>
              <Switch
                id="autoApprove"
                checked={formData.autoApprove}
                onCheckedChange={(checked) => handleInputChange("autoApprove", checked)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  );
}