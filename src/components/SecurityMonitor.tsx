import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityFeatures } from '@/hooks/useSecurityFeatures';
import { useAuth } from '@/features/auth/AuthProvider';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  action?: string;
}

export function SecurityMonitor() {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const { securityMetrics, loadSecurityMetrics } = useSecurityFeatures();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Only show to admins
  if (!user || !isAdmin()) {
    return null;
  }

  useEffect(() => {
    loadSecurityMetrics();
    
    // Simulate security alerts for demo
    const sampleAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        action: 'Rate limiting activated'
      },
      {
        id: '2',
        type: 'info',
        message: 'Security scan completed successfully',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        id: '3',
        type: 'error',
        message: 'Potential SQL injection attempt blocked',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        action: 'Request blocked and logged'
      }
    ];
    
    setAlerts(sampleAlerts);
  }, [loadSecurityMetrics]);

  const handleRefreshMetrics = async () => {
    await loadSecurityMetrics();
    toast.success('Security metrics refreshed');
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    toast.success('Security alerts cleared');
  };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <Shield className="h-4 w-4 mr-2" />
          Security Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Monitor
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time security status
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Security Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="font-semibold text-primary">{securityMetrics.totalAuditLogs}</div>
              <div className="text-muted-foreground">Audit Logs</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="font-semibold text-orange-500">{securityMetrics.activeRateLimits}</div>
              <div className="text-muted-foreground">Rate Limits</div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium">Recent Alerts</h4>
              <Badge variant="outline" className="text-xs">
                {alerts.length}
              </Badge>
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No recent alerts
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/30"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {alert.message}
                      </div>
                      {alert.action && (
                        <div className="text-xs text-muted-foreground">
                          {alert.action}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshMetrics}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={handleClearAlerts}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              disabled={alerts.length === 0}
            >
              <Lock className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}