import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { SecurityAlert } from './SecurityAlert';

export function SecurityDashboardWidget() {
  const { 
    securityMetrics, 
    securityAlerts, 
    isMonitoring, 
    checkSecurityMetrics,
    markAlertResolved 
  } = useSecurityMonitor();

  const handleDismissAlert = (alertId: string) => {
    markAlertResolved(alertId);
  };

  const criticalAlerts = securityAlerts.filter(alert => 
    alert.severity === 'critical' && !alert.resolved
  );

  const activeAlerts = securityAlerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-4">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Status
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalAlerts.length} Critical
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {securityMetrics?.suspiciousLoginAttempts ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Suspicious Logins
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {securityMetrics?.failedPaymentAttempts ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Failed Payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {securityMetrics?.blockedUsers ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Blocked Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {activeAlerts.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Alerts
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Last check: {securityMetrics?.lastSecurityCheck 
                ? new Date(securityMetrics.lastSecurityCheck).toLocaleString()
                : 'Never'
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSecurityMetrics}
              disabled={isMonitoring}
              className="text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              {isMonitoring ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Security Alerts
              <Badge variant="secondary">
                {activeAlerts.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Active security threats and suspicious activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.slice(0, 5).map((alert) => (
              <SecurityAlert
                key={alert.id}
                alert={alert}
                onResolve={markAlertResolved}
                onDismiss={handleDismissAlert}
              />
            ))}
            {activeAlerts.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                And {activeAlerts.length - 5} more alerts...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Status Indicator */}
      {activeAlerts.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-green-700">
              <Shield className="h-8 w-8 mr-3" />
              <div>
                <div className="font-semibold">All systems secure</div>
                <div className="text-sm opacity-80">No active security threats detected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}