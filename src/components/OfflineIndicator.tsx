import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineAlert || isOnline) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md">
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-yellow-800 dark:text-yellow-200">
            You're currently offline. Some features may be limited.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOfflineAlert(false)}
            className="text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100"
          >
            ×
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}