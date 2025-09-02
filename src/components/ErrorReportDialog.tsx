import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, Send, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";

interface ErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialError?: {
    message?: string;
    stack?: string;
    url?: string;
  };
}

interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  viewportSize: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
}

export function ErrorReportDialog({ 
  open, 
  onOpenChange, 
  initialError 
}: ErrorReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Collect browser information when dialog opens
  useEffect(() => {
    if (open) {
      const info: BrowserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
      };
      setBrowserInfo(info);

      // Pre-fill with initial error if provided
      if (initialError) {
        if (initialError.message && !title) {
          setTitle(initialError.message.substring(0, 100));
        }
        if (initialError.stack && !description) {
          setDescription(`Error: ${initialError.message}\n\nStack trace:\n${initialError.stack}`);
        }
        setSeverity("high"); // Auto errors are usually high severity
      }
    }
  }, [open, initialError]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStepsToReproduce("");
    setSeverity("medium");
    setContactEmail("");
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the error report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const errorReport = {
        user_id: user?.id || null,
        error_type: initialError ? 'javascript_error' : 'user_reported',
        title: title.trim(),
        description: description.trim() || null,
        steps_to_reproduce: stepsToReproduce.trim() || null,
        url: window.location.href,
        user_agent: navigator.userAgent,
        browser_info: browserInfo as any, // Cast to any for JSON compatibility
        error_details: initialError ? {
          message: initialError.message,
          stack: initialError.stack,
          url: initialError.url,
          timestamp: new Date().toISOString(),
        } as any : null, // Cast to any for JSON compatibility
        stack_trace: initialError?.stack || null,
        severity,
        contact_email: contactEmail.trim() || null,
      };

      const { error } = await supabase
        .from('error_reports')
        .insert(errorReport);

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Error Report Submitted",
        description: "Thank you for reporting this issue. We'll investigate it as soon as possible.",
      });

      // Auto-close after 3 seconds
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 3000);

    } catch (error) {
      console.error('Failed to submit error report:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit error report. Please try again or contact support directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Submitted Successfully</h3>
            <p className="text-muted-foreground">
              Thank you for helping us improve the platform. We'll investigate this issue promptly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-500" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Initial error alert */}
          {initialError && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                An error was automatically detected. Details have been pre-filled below.
              </AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={(value: typeof severity) => setSeverity(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Low</Badge>
                    <span>Minor issue</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>
                    <span>Affects some functionality</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">High</Badge>
                    <span>Affects major functionality</span>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-600">Critical</Badge>
                    <span>Blocks essential features</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what happened..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/2000 characters
            </p>
          </div>

          {/* Steps to reproduce */}
          <div className="space-y-2">
            <Label htmlFor="steps">Steps to Reproduce</Label>
            <Textarea
              id="steps"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {stepsToReproduce.length}/1000 characters
            </p>
          </div>

          {/* Contact email for anonymous users */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-muted-foreground">
                We'll only use this to follow up on your report if needed.
              </p>
            </div>
          )}

          {/* Technical info */}
          {browserInfo && (
            <div className="space-y-2">
              <Label>Technical Information</Label>
              <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                <div><strong>URL:</strong> {window.location.href}</div>
                <div><strong>Browser:</strong> {browserInfo.userAgent.split(' ').slice(-2).join(' ')}</div>
                <div><strong>Platform:</strong> {browserInfo.platform}</div>
                <div><strong>Screen:</strong> {browserInfo.screenResolution}</div>
                <div><strong>Viewport:</strong> {browserInfo.viewportSize}</div>
                <div><strong>Online:</strong> {browserInfo.onlineStatus ? 'Yes' : 'No'}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                This technical information helps us reproduce and fix the issue.
              </p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Floating Report Button Component
export function ReportIssueButton() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border hover:bg-muted/50 shadow-lg"
          >
            <Bug className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </DialogTrigger>
      </Dialog>
      
      <ErrorReportDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}