import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, CheckCircle, Pen } from "lucide-react";

interface AgreementESignProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function AgreementESign({ data, onUpdate, onNext }: AgreementESignProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || "",
    title: data.title || "",
    signatureDate: data.signatureDate || new Date().toISOString().split('T')[0],
    ipAddress: data.ipAddress || "",
    userAgent: data.userAgent || "",
    agreementAccepted: data.agreementAccepted || false,
    privacyPolicyAccepted: data.privacyPolicyAccepted || false,
    marketingOptIn: data.marketingOptIn || false,
    signatureCompleted: data.signatureCompleted || false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSign = () => {
    if (!formData.fullName) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to complete the signature.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreementAccepted || !formData.privacyPolicyAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please accept both the Partnership Agreement and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    // Record signature metadata
    setFormData(prev => ({
      ...prev,
      signatureCompleted: true,
      ipAddress: "192.168.1.1", // In real app, get from backend
      userAgent: navigator.userAgent,
      signatureDate: new Date().toISOString().split('T')[0],
    }));

    toast({
      title: "Agreement Signed",
      description: "Your partnership agreement has been signed successfully.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.signatureCompleted) {
        toast({
          title: "Signature Required",
          description: "Please complete the signature process.",
          variant: "destructive",
        });
        return;
      }

      // Update parent component data
      onUpdate(formData);
      
      toast({
        title: "Onboarding Complete!",
        description: "Welcome to our venue partner network. Your venue will be reviewed and published within 24 hours.",
      });

      // Complete onboarding
      onNext();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const agreementText = `
VENUE PARTNERSHIP AGREEMENT

This Venue Partnership Agreement ("Agreement") is entered into between [Platform Name] and the venue owner/operator.

1. PARTNERSHIP TERMS
By accepting this agreement, you agree to list your venue on our platform and allow bookings through our system.

2. COMMISSION STRUCTURE
- Platform fee: 5% of each booking
- Payment processing: 2.9% + $0.30 per transaction
- Payouts: Next business day after event completion

3. VENUE REQUIREMENTS
- Maintain accurate listing information
- Honor confirmed bookings
- Provide safe and clean facilities
- Comply with local regulations and permits

4. BOOKING POLICIES
- Respond to booking requests within 24 hours
- Allow platform to process payments
- Maintain calendar availability accuracy
- Provide clear cancellation policies

5. LIABILITY AND INSURANCE
- Venue owner maintains appropriate insurance coverage
- Platform not liable for property damage or injuries
- Venue owner responsible for compliance with local laws

6. TERMINATION
Either party may terminate this agreement with 30 days written notice.

7. DATA AND PRIVACY
Platform will handle customer data in accordance with privacy policy. Venue information may be displayed publicly.

By signing below, you acknowledge that you have read, understood, and agree to be bound by all terms of this agreement.
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agreement Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Partnership Agreement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-md p-4">
            <div className="whitespace-pre-line text-sm">
              {agreementText}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pen className="h-5 w-5" />
            <span>Electronic Signature</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.signatureCompleted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Agreement Signed</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Signed by:</strong> {formData.fullName}</p>
                <p><strong>Title:</strong> {formData.title}</p>
                <p><strong>Date:</strong> {formData.signatureDate}</p>
                <p><strong>IP Address:</strong> {formData.ipAddress}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Legal Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full legal name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title/Position</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Owner, Manager"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreementAccepted"
                    checked={formData.agreementAccepted}
                    onCheckedChange={(checked) => handleInputChange("agreementAccepted", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agreementAccepted" className="text-sm font-medium">
                      I accept the Partnership Agreement *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, you agree to all terms and conditions outlined above.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyPolicyAccepted"
                    checked={formData.privacyPolicyAccepted}
                    onCheckedChange={(checked) => handleInputChange("privacyPolicyAccepted", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="privacyPolicyAccepted" className="text-sm font-medium">
                      I accept the Privacy Policy *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I acknowledge how my data will be collected, used, and protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingOptIn"
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => handleInputChange("marketingOptIn", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="marketingOptIn" className="text-sm font-medium">
                      I'd like to receive marketing communications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Stay updated on new features, partnership opportunities, and platform updates.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSign}
                disabled={!formData.fullName || !formData.agreementAccepted || !formData.privacyPolicyAccepted}
                className="w-full"
              >
                <Pen className="mr-2 h-4 w-4" />
                Sign Agreement
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legal Notices */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Electronic Signature Validity:</strong> Your electronic signature has the same legal effect as a handwritten signature.
          </p>
          <p>
            <strong>Record Keeping:</strong> A copy of this signed agreement will be stored securely and is available in your dashboard.
          </p>
          <p>
            <strong>Questions?</strong> Contact our legal team at legal@platform.com for any questions about this agreement.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.signatureCompleted}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            "Complete Onboarding"
          )}
        </Button>
      </div>
    </form>
  );
}