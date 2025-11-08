import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { openErrorPromptFor } from '@/components/reporting/ErrorPrompt';

export function SimpleReportButton() {
  const handleClick = () => {
    openErrorPromptFor('User opened manual report', 'manual');
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border hover:bg-muted/50 shadow-lg"
    >
      <Bug className="w-4 h-4 mr-2" />
      Report Issue
    </Button>
  );
}