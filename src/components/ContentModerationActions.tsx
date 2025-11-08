import { useState } from 'react';
import { Flag, Ban, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createContentReport, blockUser, type ContentReport } from '@/lib/moderation';

interface ReportDialogProps {
  contentId?: string;
  userId?: string;
  contentType: ContentReport['content_type'];
  trigger?: React.ReactNode;
}

export function ReportDialog({ contentId, userId, contentType, trigger }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ContentReport['reason']>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'fake', label: 'Fake or Misleading' },
    { value: 'violence', label: 'Violence or Harmful Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' },
  ] as const;

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Missing Information",
        description: "Please select a reason for reporting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await createContentReport({
        reported_content_id: contentId,
        reported_user_id: userId,
        content_type: contentType,
        reason,
        description: description.trim() || undefined,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe. We'll review your report.",
      });

      setIsOpen(false);
      setReason('spam');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Report Failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ContentReport['reason'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BlockUserDialogProps {
  userId: string;
  userName?: string;
  trigger?: React.ReactNode;
  onBlockSuccess?: () => void;
}

export function BlockUserDialog({ userId, userName, trigger, onBlockSuccess }: BlockUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBlock = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await blockUser(userId, reason.trim() || undefined);

      if (error) {
        throw error;
      }

      toast({
        title: "User Blocked",
        description: `You will no longer see content from ${userName || 'this user'}.`,
      });

      setIsOpen(false);
      setReason('');
      onBlockSuccess?.();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Block Failed",
        description: "Unable to block user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Ban className="h-4 w-4" />
            Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Block User
          </DialogTitle>
          <DialogDescription>
            {userName ? `Block ${userName}?` : 'Block this user?'} You won't see their content anymore.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-md">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">This action will:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Hide all content from this user</li>
                  <li>Prevent them from messaging you</li>
                  <li>Remove them from your connections</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-reason">Reason (optional)</Label>
            <Textarea
              id="block-reason"
              placeholder="Why are you blocking this user?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlock}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Blocking...' : 'Block User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ContentModerationActionsProps {
  contentId?: string;
  userId?: string;
  contentType: ContentReport['content_type'];
  userName?: string;
  showBlock?: boolean;
  className?: string;
}

export function ContentModerationActions({
  contentId,
  userId,
  contentType,
  userName,
  showBlock = true,
  className,
}: ContentModerationActionsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <ReportDialog
        contentId={contentId}
        userId={userId}
        contentType={contentType}
        trigger={
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4" />
          </Button>
        }
      />
      
      {showBlock && userId && (
        <BlockUserDialog
          userId={userId}
          userName={userName}
          trigger={
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <Ban className="h-4 w-4" />
            </Button>
          }
        />
      )}
    </div>
  );
}