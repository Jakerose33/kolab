import { useEffect, useState } from "react";
import { ErrorReportDialog } from "./ErrorReportDialog";

interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  url?: string;
}

export function GlobalErrorHandler() {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    // Handle unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      };

      setErrorInfo(error);
      setShowErrorDialog(true);

      // Also log to console for debugging
      console.error('Unhandled error:', error);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ErrorInfo = {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
      };

      setErrorInfo(error);
      setShowErrorDialog(true);

      // Also log to console for debugging
      console.error('Unhandled promise rejection:', error);
    };

    // Handle React error boundary errors (if needed)
    const handleReactError = (event: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        const error: ErrorInfo = {
          message: event.detail.message || 'React error occurred',
          stack: event.detail.stack,
          url: window.location.href,
        };

        setErrorInfo(error);
        setShowErrorDialog(true);

        console.error('React error:', error);
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('react-error', handleReactError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('react-error', handleReactError);
    };
  }, []);

  return (
    <ErrorReportDialog
      open={showErrorDialog}
      onOpenChange={setShowErrorDialog}
      initialError={errorInfo || undefined}
    />
  );
}