import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StripeConnectSetupProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function StripeConnectSetup({ data, onUpdate, onNext }: StripeConnectSetupProps) {
  const [formData, setFormData] = useState({
    stripeAccountId: data.stripeAccountId || "",
    stripeConnected: data.stripeConnected || false,
    bankAccountLastFour: data.bankAccountLastFour || "",
    payoutEnabled: data.payoutEnabled || false,
    taxId: data.taxId || "",
    businessType: data.businessType || "",
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);

    try {
      // In a real app, you'd call your backend to create a Stripe Connect account
      // and get the onboarding URL
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful connection
      const mockAccountId = `acct_${Date.now()}`;
      
      setFormData(prev => ({
        ...prev,
        stripeAccountId: mockAccountId,
        stripeConnected: true,
        bankAccountLastFour: "1234",
        payoutEnabled: true,
      }));

      toast({
        title: "Stripe Account Connected",
        description: "Your payment account has been successfully set up.",
      });
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.stripeConnected) {
        toast({
          title: "Stripe Account Required",
          description: "Please connect your Stripe account to continue.",
          variant: "destructive",
        });
        return;
      }

      // Update parent component data
      onUpdate(formData);
      
      toast({
        title: "Payment Setup Complete",
        description: "Your payment information has been saved successfully.",
      });

      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error saving payment setup:", error);
      toast({
        title: "Error",
        description: "Failed to save payment setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Setup</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your Stripe account to receive payments from venue bookings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.stripeConnected ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your Stripe account is connected and ready to receive payments.
                Account ID: {formData.stripeAccountId}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Connect with Stripe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stripe handles all payment processing securely. You'll be redirected to complete your account setup.
                </p>
                <Button
                  type="button"
                  onClick={handleStripeConnect}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Stripe Account
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {formData.stripeConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Payment Status</h4>
                <p className="text-sm text-green-700">
                  ✓ Ready to receive payments
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Bank Account</h4>
                <p className="text-sm text-blue-700">
                  ✓ Ending in {formData.bankAccountLastFour}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Required for tax reporting and compliance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange("businessType", e.target.value)}
                placeholder="e.g., LLC, Corporation, Sole Proprietorship"
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (EIN)</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This information is securely stored and used only for tax reporting purposes.
              You can update this information later in your dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Platform fee:</span>
              <span className="font-medium">5% per booking</span>
            </div>
            <div className="flex justify-between">
              <span>Payment processing:</span>
              <span className="font-medium">2.9% + $0.30</span>
            </div>
            <div className="flex justify-between">
              <span>Payout schedule:</span>
              <span className="font-medium">Next business day</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Your earnings:</span>
              <span className="font-medium">~92% of booking total</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Final amounts may vary based on booking details and applicable taxes.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !formData.stripeConnected}>
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