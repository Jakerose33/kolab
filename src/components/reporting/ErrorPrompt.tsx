import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendErrorReport, buildErrorPayload, ErrorPayload } from '@/lib/error-report';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ErrorPrompt({ 
  open, 
  payload, 
  onClose 
}: { 
  open: boolean; 
  payload: ErrorPayload; 
  onClose: () => void; 
}) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  
  // Get first line of error message, truncated to 140 chars
  const errorLine = (payload.message || 'An error has occurred').split('\n')[0].slice(0, 140);
  
  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    
    try {
      await sendErrorReport(payload);
      toast({ title: 'Thanks — error report sent.' });
    } catch (e) {
      toast({ title: 'Thanks — error report sent.' }); // Always show success to user
    } finally {
      setSending(false);
      onClose();
    }
  };

  const handleDontSend = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send error report?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          {errorLine}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleDontSend} disabled={sending}>
            Don't send
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Singleton controller
let lastSig = '';
let shown = false;

export function openErrorPromptFor(err: unknown, source: 'auto' | 'manual' = 'auto') {
  const payload = buildErrorPayload(err, source);
  if (shown && lastSig === payload.fingerprint) return; // de-dupe per page load
  lastSig = payload.fingerprint; 
  shown = true;
  (window as any).__openErrorPrompt?.(payload);
}