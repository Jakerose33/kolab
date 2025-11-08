import { useSearchParams } from "react-router-dom";
import { ErrorReportDialog } from "@/components/ErrorReportDialog";
import { Navigate } from "react-router-dom";
import { useState } from "react";

export default function AdvancedErrorReport() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  
  // Only show advanced form if ?advanced=1 is in URL
  if (searchParams.get("advanced") !== "1") {
    return <Navigate to="/" replace />;
  }

  if (!open) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ErrorReportDialog
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}