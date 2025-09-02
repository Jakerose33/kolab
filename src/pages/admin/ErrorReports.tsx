import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Bug, Eye, AlertTriangle, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ErrorReport {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  url: string;
  user_agent: string | null;
  stack_trace: string | null;
  contact_email: string | null;
  user_id: string | null;
  status: string;
  created_at: string;
}

export default function ErrorReports() {
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const { toast } = useToast();

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["error-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("error_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ErrorReport[];
    },
  });

  const updateStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("error_reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Report status updated",
      });
      refetch();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "open": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bug className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Error Reports</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bug className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Error Reports</h1>
          <Badge variant="secondary">{reports.length} total</Badge>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No error reports yet</h3>
            <p className="text-muted-foreground">When users report issues, they'll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(report.severity)}>
                        {report.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      {report.severity === "critical" && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1 truncate">{report.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {report.description || "No description provided"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(report.created_at))} ago</span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {new URL(report.url).pathname}
                      </span>
                      {report.contact_email && (
                        <span>Contact: {report.contact_email}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Bug className="w-5 h-5" />
                            Error Report Details
                          </DialogTitle>
                        </DialogHeader>
                        {selectedReport && (
                          <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Title</h4>
                                <p>{selectedReport.title}</p>
                              </div>
                              
                              {selectedReport.description && (
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="whitespace-pre-wrap">{selectedReport.description}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Severity</h4>
                                  <Badge className={getSeverityColor(selectedReport.severity)}>
                                    {selectedReport.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Status</h4>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className={getStatusColor(selectedReport.status)}>
                                      {selectedReport.status}
                                    </Badge>
                                    <div className="flex gap-1">
                                      {["open", "in_progress", "resolved"].map((status) => (
                                        <Button
                                          key={status}
                                          variant={selectedReport.status === status ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateStatus(selectedReport.id, status)}
                                        >
                                          {status.replace("_", " ")}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">URL</h4>
                                <a 
                                  href={selectedReport.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline break-all"
                                >
                                  {selectedReport.url}
                                </a>
                              </div>

                              {selectedReport.user_agent && (
                                <div>
                                  <h4 className="font-semibold mb-2">User Agent</h4>
                                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                                    {selectedReport.user_agent}
                                  </p>
                                </div>
                              )}

                              {selectedReport.stack_trace && (
                                <div>
                                  <h4 className="font-semibold mb-2">Stack Trace</h4>
                                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-40">
                                    {selectedReport.stack_trace}
                                  </pre>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                <p>Created: {new Date(selectedReport.created_at).toLocaleString()}</p>
                                {selectedReport.contact_email && (
                                  <p>Contact: {selectedReport.contact_email}</p>
                                )}
                                {selectedReport.user_id && (
                                  <p>User ID: {selectedReport.user_id}</p>
                                )}
                              </div>
                            </div>
                          </ScrollArea>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}