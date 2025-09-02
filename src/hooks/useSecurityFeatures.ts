// Custom hook for security features
import { useState, useEffect, useCallback } from 'react';
import { SecurityManager, DataEncryption } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSecurityFeatures() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalAuditLogs: 0,
    activeRateLimits: 0,
    securityAlerts: 0
  });

  // Rate limiting hook
  const checkRateLimit = useCallback(async (
    actionType: string, 
    limit: number = 100, 
    windowMinutes: number = 60
  ): Promise<boolean> => {
    try {
      const allowed = await SecurityManager.checkRateLimit(actionType, limit, windowMinutes);
      setIsRateLimited(!allowed);
      
      if (!allowed) {
        toast.error('Rate limit exceeded. Please try again later.');
      }
      
      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }, []);

  // Audit logging hook
  const auditAction = useCallback(async (
    actionType: string,
    tableName: string,
    recordId?: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      await SecurityManager.auditAccess(actionType, tableName, recordId, additionalData);
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }, []);

  // Input sanitization hook
  const sanitizeInput = useCallback((input: string): string => {
    return SecurityManager.sanitizeInput(input);
  }, []);

  // File validation hook
  const validateFile = useCallback((file: File) => {
    const result = SecurityManager.validateFileUpload(file);
    
    if (!result.valid && result.error) {
      toast.error(result.error);
    }
    
    return result;
  }, []);

  // Secure storage hooks
  const setSecureData = useCallback((key: string, value: any) => {
    SecurityManager.setSecureItem(key, value);
  }, []);

  const getSecureData = useCallback(<T>(key: string): T | null => {
    return SecurityManager.getSecureItem<T>(key);
  }, []);

  // Data encryption hooks
  const encryptData = useCallback(async (data: string): Promise<string> => {
    try {
      return await DataEncryption.encryptSensitive(data);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }, []);

  const decryptData = useCallback(async (encryptedData: string): Promise<string> => {
    try {
      return await DataEncryption.decryptSensitive(encryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }, []);

  // Load security metrics
  const loadSecurityMetrics = useCallback(async () => {
    try {
      const { data: auditCount } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true });

      const { data: rateLimitCount } = await supabase
        .from('rate_limits')
        .select('id', { count: 'exact', head: true });

      setSecurityMetrics({
        totalAuditLogs: auditCount?.length || 0,
        activeRateLimits: rateLimitCount?.length || 0,
        securityAlerts: 0 // Could be expanded with alerts system
      });
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    }
  }, []);

  // Privacy controls
  const anonymizeUserData = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const success = await SecurityManager.anonymizeUserData(userId);
      
      if (success) {
        toast.success('User data anonymized successfully');
        await auditAction('anonymize_user_data', 'profiles', userId);
      } else {
        toast.error('Failed to anonymize user data');
      }
      
      return success;
    } catch (error) {
      console.error('Anonymization failed:', error);
      toast.error('Failed to anonymize user data');
      return false;
    }
  }, [auditAction]);

  // Security monitoring
  useEffect(() => {
    loadSecurityMetrics();
    
    // Set up periodic security checks
    const interval = setInterval(loadSecurityMetrics, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [loadSecurityMetrics]);

  return {
    // Rate limiting
    isRateLimited,
    checkRateLimit,
    
    // Audit logging
    auditAction,
    
    // Input validation
    sanitizeInput,
    validateFile,
    
    // Secure storage
    setSecureData,
    getSecureData,
    
    // Encryption
    encryptData,
    decryptData,
    
    // Privacy
    anonymizeUserData,
    
    // Metrics
    securityMetrics,
    loadSecurityMetrics
  };
}

// Rate limiting decorator hook
export function useRateLimitedAction(actionType: string, limit: number = 100) {
  const { checkRateLimit } = useSecurityFeatures();
  
  return useCallback(async (action: () => Promise<any> | any) => {
    const allowed = await checkRateLimit(actionType, limit);
    
    if (!allowed) {
      throw new Error('Rate limit exceeded');
    }
    
    return action();
  }, [checkRateLimit, actionType, limit]);
}

// Audited action hook
export function useAuditedAction(tableName: string) {
  const { auditAction } = useSecurityFeatures();
  
  return useCallback(async (
    actionType: string,
    action: () => Promise<any> | any,
    recordId?: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      const result = await action();
      await auditAction(actionType, tableName, recordId, additionalData);
      return result;
    } catch (error) {
      await auditAction(`${actionType}_failed`, tableName, recordId, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        ...additionalData 
      });
      throw error;
    }
  }, [auditAction, tableName]);
}