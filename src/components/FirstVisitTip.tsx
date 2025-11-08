import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export function FirstVisitTip() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('kolab-has-visited');
    if (!hasVisited) {
      setShowTip(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('kolab-has-visited', 'true');
    setShowTip(false);
  };

  if (!showTip) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-lg border">
        <div className="flex items-start justify-between">
          <div className="pr-2">
            <p className="text-sm">
              New here?{' '}
              <Link 
                to="/about" 
                className="underline hover:no-underline"
                onClick={handleDismiss}
              >
                See how Kolab works →
              </Link>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}