import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeConnectSetupProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function StripeConnectSetup({ data, onUpdate, onNext }: StripeConnectSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stripeAccountId: data.stripeAccountId || "",
    businessType: data.businessType || "",
    taxId: data.taxId || "",
    isConnected: data.isConnected || false,
    ...data
  });
  const { toast } = useToast();

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate Stripe Connect setup
      // In production, this would redirect to Stripe Connect OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockStripeAccountId = `acct_${Math.random().toString(36).substr(2, 9)}`;
      
      setFormData(prev => ({
        ...prev,
        stripeAccountId: mockStripeAccountId,
        isConnected: true
      }));

      toast({
        title: "Stripe Connected Successfully",
        description: "Your payment processing is now set up.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.isConnected) {
      toast({
        title: "Stripe Connection Required",
        description: "Please connect your Stripe account before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(formData);
      onNext();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            Stripe Connect Status
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from venue bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.isConnected ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Stripe Account Connected</p>
                <p className="text-sm text-green-600">Account ID: {formData.stripeAccountId}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800 font-medium">Stripe Account Required</p>
                <p className="text-sm text-orange-600">
                  You need to connect a Stripe account to receive payments from bookings
                </p>
              </div>
              <Button 
                type="button"
                onClick={handleStripeConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  "Connecting..."
                ) : (
                  <>
                    Connect with Stripe
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Additional details required for payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select 
              value={formData.businessType} 
              onValueChange={(value) => handleInputChange('businessType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="non_profit">Non-profit</SelectItem>
                <SelectItem value="government_entity">Government Entity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taxId">Tax ID (Optional)</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="Enter your tax identification number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
          <CardDescription>
            Review the payment processing terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span className="font-medium">5% per booking</span>
            </div>
            <div className="flex justify-between">
              <span>Stripe Processing Fee:</span>
              <span className="font-medium">2.9% + 30¢</span>
            </div>
            <div className="flex justify-between">
              <span>Payout Schedule:</span>
              <span className="font-medium">Weekly (Fridays)</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-medium">
                <span>Your Net Rate:</span>
                <span>~92% of booking amount</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || !formData.isConnected}
      >
        {isSubmitting ? "Saving..." : "Save & Continue"}
      </Button>
    </form>
  );
}