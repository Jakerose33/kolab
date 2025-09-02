import { AlertTriangle, Shield, X, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'payment_fraud' | 'data_breach' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface SecurityAlertProps {
  alert: SecurityAlert;
  onResolve: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

const severityConfig = {
  low: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
};

const typeConfig = {
  suspicious_activity: { label: 'Suspicious Activity', color: 'destructive' as const },
  payment_fraud: { label: 'Payment Fraud', color: 'destructive' as const },
  data_breach: { label: 'Data Breach', color: 'destructive' as const },
  rate_limit_exceeded: { label: 'Rate Limit Exceeded', color: 'secondary' as const },
};

export function SecurityAlert({ alert, onResolve, onDismiss }: SecurityAlertProps) {
  const severityStyle = severityConfig[alert.severity];
  const typeInfo = typeConfig[alert.type];
  const Icon = severityStyle.icon;

  if (alert.resolved) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          {typeInfo.label} - Resolved
        </AlertTitle>
        <AlertDescription className="text-green-700">
          {alert.message}
          <div className="text-xs mt-1 opacity-70">
            Resolved at {new Date(alert.timestamp).toLocaleString()}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={severityStyle.color}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <AlertTitle className="flex items-center gap-2">
            {typeInfo.label}
            <Badge variant={typeInfo.color} className="text-xs">
              {alert.severity.toUpperCase()}
            </Badge>
          </AlertTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResolve(alert.id)}
              className="h-6 w-6 p-0"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <AlertDescription>
          {alert.message}
          <div className="text-xs mt-1 opacity-70">
            {new Date(alert.timestamp).toLocaleString()}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}