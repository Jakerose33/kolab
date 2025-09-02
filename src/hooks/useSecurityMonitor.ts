import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  suspiciousLoginAttempts: number;
  failedPaymentAttempts: number;
  blockedUsers: number;
  lastSecurityCheck: string;
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'payment_fraud' | 'data_breach' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function useSecurityMonitor() {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const checkSecurityMetrics = useCallback(async () => {
    try {
      setIsMonitoring(true);

      // Check for suspicious login patterns
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action_type', 'SUSPICIOUS_LOGIN')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Check for failed payment attempts
      const { data: paymentLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action_type', 'PAYMENT_FAILED')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Check for blocked users
      const { data: blockedUsers } = await supabase
        .from('user_suspensions')
        .select('*')
        .eq('is_permanent', false)
        .gte('end_date', new Date().toISOString());

      const metrics: SecurityMetrics = {
        suspiciousLoginAttempts: auditLogs?.length || 0,
        failedPaymentAttempts: paymentLogs?.length || 0,
        blockedUsers: blockedUsers?.length || 0,
        lastSecurityCheck: new Date().toISOString(),
      };

      setSecurityMetrics(metrics);

      // Generate alerts based on metrics
      const alerts: SecurityAlert[] = [];

      if (metrics.suspiciousLoginAttempts > 10) {
        alerts.push({
          id: `suspicious-logins-${Date.now()}`,
          type: 'suspicious_activity',
          severity: 'high',
          message: `${metrics.suspiciousLoginAttempts} suspicious login attempts detected in the last 24 hours`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      if (metrics.failedPaymentAttempts > 5) {
        alerts.push({
          id: `payment-fraud-${Date.now()}`,
          type: 'payment_fraud',
          severity: 'medium',
          message: `${metrics.failedPaymentAttempts} failed payment attempts detected`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      setSecurityAlerts(alerts);

      // Show critical alerts
      alerts
        .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
        .forEach(alert => {
          toast({
            title: 'Security Alert',
            description: alert.message,
            variant: 'destructive',
          });
        });

    } catch (error) {
      console.error('Error checking security metrics:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, [toast]);

  const markAlertResolved = useCallback((alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  }, []);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    details: Record<string, any>
  ) => {
    try {
      await supabase.functions.invoke('log-security-event', {
        body: {
          event_type: eventType,
          details,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, []);

  // Monitor for real-time security events
  useEffect(() => {
    const subscription = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: 'action_type=in.(SUSPICIOUS_LOGIN,PAYMENT_FAILED,DATA_BREACH)',
        },
        (payload) => {
          const newLog = payload.new;
          
          // Generate real-time alert
          const alert: SecurityAlert = {
            id: `realtime-${newLog.id}`,
            type: newLog.action_type.toLowerCase().includes('login') 
              ? 'suspicious_activity' 
              : newLog.action_type.toLowerCase().includes('payment')
              ? 'payment_fraud'
              : 'data_breach',
            severity: 'high',
            message: `Real-time security event: ${newLog.action_type}`,
            timestamp: newLog.created_at,
            resolved: false,
          };

          setSecurityAlerts(prev => [alert, ...prev]);

          toast({
            title: 'Real-time Security Alert',
            description: alert.message,
            variant: 'destructive',
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Periodic security checks
  useEffect(() => {
    checkSecurityMetrics();
    
    const interval = setInterval(checkSecurityMetrics, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [checkSecurityMetrics]);

  return {
    securityMetrics,
    securityAlerts,
    isMonitoring,
    checkSecurityMetrics,
    markAlertResolved,
    logSecurityEvent,
  };
}