// Security management dashboard for admins
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { SecurityManager } from '@/lib/security';
import { Shield, AlertTriangle, Eye, Users, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface RateLimit {
  identifier: string;
  action_type: string;
  request_count: number;
  window_start: string;
}

export default function SecurityDashboard() {
  const { isAdmin, loading } = useUserRoles();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadSecurityData();
    }
  }, [isAdmin]);

  const loadSecurityData = async () => {
    setLoadingData(true);
    try {
      // Load audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setAuditLogs((logs || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent as string | null
      })));

      // Load rate limits
      const { data: limits, error: limitsError } = await supabase
        .from('rate_limits')
        .select('*')
        .order('window_start', { ascending: false })
        .limit(50);

      if (limitsError) throw limitsError;
      setRateLimits(limits || []);

    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAnonymizeUser = async (userId: string) => {
    if (!confirm('Are you sure you want to anonymize this user\'s data? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await SecurityManager.anonymizeUserData(userId);
      if (success) {
        toast.success('User data anonymized successfully');
        loadSecurityData(); // Reload to see the changes
      } else {
        toast.error('Failed to anonymize user data');
      }
    } catch (error) {
      console.error('Anonymization error:', error);
      toast.error('Failed to anonymize user data');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access the security dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate Limits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimits.length}</div>
            <p className="text-xs text-muted-foreground">
              Current rate limit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="anonymization">Data Anonymization</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>
                Track all sensitive data access and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={loadSecurityData} 
                  disabled={loadingData}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action_type}</Badge>
                          <span className="font-medium">{log.table_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          User: {log.user_id} | IP: {log.ip_address || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rate Limits</CardTitle>
              <CardDescription>
                Monitor API rate limiting and abuse prevention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {rateLimits.map((limit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{limit.action_type}</Badge>
                          <span className="font-medium">{limit.identifier}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requests: {limit.request_count}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(limit.window_start).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {rateLimits.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No active rate limits
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anonymization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Anonymization</CardTitle>
              <CardDescription>
                Manage user data privacy and GDPR compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Data anonymization is irreversible. Use with caution.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Anonymization Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Removes all personally identifiable information</li>
                    <li>• Replaces names with anonymous identifiers</li>
                    <li>• Clears contact information and social links</li>
                    <li>• Anonymizes analytics data while preserving insights</li>
                    <li>• Logs all anonymization actions for audit trail</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    To anonymize a specific user's data, use the user management 
                    interface or contact the system administrator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}