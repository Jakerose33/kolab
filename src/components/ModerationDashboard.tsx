import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  getContentReports, 
  updateContentReport, 
  getModerationLogs,
  type ContentReport,
  type ModerationLog 
} from '@/lib/moderation';
import { formatDistanceToNow } from 'date-fns';

// Helper functions for badges
const getStatusBadge = (status: ContentReport['status']) => {
  const variants = {
    pending: 'destructive',
    reviewing: 'secondary',
    resolved: 'default',
    dismissed: 'outline',
  } as const;

  const icons = {
    pending: AlertTriangle,
    reviewing: Eye,
    resolved: CheckCircle,
    dismissed: XCircle,
  };

  const Icon = icons[status];

  return (
    <Badge variant={variants[status]} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getReasonBadge = (reason: ContentReport['reason']) => {
  const colors = {
    spam: 'bg-yellow-100 text-yellow-800',
    harassment: 'bg-red-100 text-red-800',
    inappropriate: 'bg-orange-100 text-orange-800',
    fake: 'bg-purple-100 text-purple-800',
    violence: 'bg-red-100 text-red-800',
    copyright: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge variant="outline" className={colors[reason]}>
      {reason.charAt(0).toUpperCase() + reason.slice(1)}
    </Badge>
  );
};

export function ModerationDashboard() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ContentReport['status'] | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
    loadLogs();
  }, [selectedStatus]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await getContentReports({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        limit: 50,
      });

      if (error) throw error;
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await getModerationLogs({ limit: 20 });
      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleReportAction = async (
    reportId: string,
    action: ContentReport['resolution_action'],
    status: ContentReport['status'],
    notes?: string
  ) => {
    try {
      const { error } = await updateContentReport(reportId, {
        status,
        resolution_action: action,
        moderator_notes: notes,
      });

      if (error) throw error;

      toast({
        title: "Report Updated",
        description: "Report status has been updated successfully.",
      });

      loadReports();
      loadLogs();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and moderate reported content to maintain community safety.
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="logs">Moderation Log</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ContentReport['status'] | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={loadReports} variant="outline">
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground">
                  {selectedStatus === 'all' 
                    ? 'No content reports have been submitted yet.'
                    : `No ${selectedStatus} reports found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onAction={handleReportAction}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Actions</CardTitle>
              <CardDescription>
                Track all moderation activities and decisions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No moderation actions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="space-y-1">
                        <p className="font-medium">{log.action_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.notes || log.reason}
                        </p>
                        {log.target_user_id && (
                          <p className="text-xs text-muted-foreground">
                            Target User: {log.target_user_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReportCardProps {
  report: ContentReport;
  onAction: (
    reportId: string,
    action: ContentReport['resolution_action'],
    status: ContentReport['status'],
    notes?: string
  ) => void;
}

function ReportCard({ report, onAction }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(report.moderator_notes || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (
    action: ContentReport['resolution_action'],
    status: ContentReport['status']
  ) => {
    setIsProcessing(true);
    try {
      await onAction(report.id, action, status, notes.trim() || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusBadge(report.status)}
              {getReasonBadge(report.reason)}
              <Badge variant="outline">{report.content_type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {report.description && (
            <div>
              <Label className="text-sm font-medium">Report Description</Label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md">
                {report.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Reporter ID</Label>
              <p className="font-mono text-xs">{report.reporter_id}</p>
            </div>
            {report.reported_user_id && (
              <div>
                <Label className="text-xs text-muted-foreground">Reported User ID</Label>
                <p className="font-mono text-xs">{report.reported_user_id}</p>
              </div>
            )}
            {report.reported_content_id && (
              <div>
                <Label className="text-xs text-muted-foreground">Content ID</Label>
                <p className="font-mono text-xs">{report.reported_content_id}</p>
              </div>
            )}
          </div>

          {report.status === 'pending' && (
            <div className="space-y-3">
              <div>
                <Label>Moderator Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('no_action', 'dismissed')}
                  disabled={isProcessing}
                >
                  Dismiss
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAction('user_warned', 'resolved')}
                  disabled={isProcessing}
                >
                  Warn User
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction('content_removed', 'resolved')}
                  disabled={isProcessing}
                >
                  Remove Content
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction('user_suspended', 'resolved')}
                  disabled={isProcessing}
                >
                  Suspend User
                </Button>
              </div>
            </div>
          )}

          {report.moderator_notes && (
            <div>
              <Label className="text-sm font-medium">Moderator Notes</Label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md">
                {report.moderator_notes}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}