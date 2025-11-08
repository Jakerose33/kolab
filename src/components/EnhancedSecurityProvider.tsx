import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SecurityManager } from '@/lib/security';
import { useAuth } from '@/features/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  isSecure: boolean;
  csrfToken: string | null;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  checkRateLimit: (action: string, limit?: number) => Promise<boolean>;
  auditAction: (action: string, details?: any) => Promise<void>;
  sanitizeInput: (input: string) => string;
  isDeviceSecure: boolean;
  sessionValid: boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface EnhancedSecurityProviderProps {
  children: ReactNode;
}

export function EnhancedSecurityProvider({ children }: EnhancedSecurityProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isDeviceSecure, setIsDeviceSecure] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize security measures
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Generate CSRF token
        const token = await generateCSRFToken();
        setCsrfToken(token);

        // Check device security
        const deviceSecure = await checkDeviceSecurity();
        setIsDeviceSecure(deviceSecure);

        // Determine security level
        const level = await calculateSecurityLevel();
        setSecurityLevel(level);

        // Set up session monitoring
        setupSessionMonitoring();

        // Initialize content security policy
        initializeCSP();

      } catch (error) {
        console.error('Security initialization failed:', error);
        setSecurityLevel('low');
      }
    };

    initializeSecurity();
  }, [user]);

  const generateCSRFToken = async (): Promise<string> => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const checkDeviceSecurity = async (): Promise<boolean> => {
    try {
      // Check if we're in a secure context (HTTPS)
      const isSecureContext = window.isSecureContext;
      
      // Check for basic security features
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasSessionStorage = typeof sessionStorage !== 'undefined';
      const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
      
      return isSecureContext && hasLocalStorage && hasSessionStorage && hasCrypto;
    } catch (error) {
      console.error('Device security check failed:', error);
      return false;
    }
  };

  const calculateSecurityLevel = async (): Promise<'low' | 'medium' | 'high' | 'critical'> => {
    let score = 0;

    // Check HTTPS
    if (window.location.protocol === 'https:') score += 2;
    
    // Check device security
    if (isDeviceSecure) score += 2;
    
    // Check for authenticated user
    if (user) score += 1;
    
    // Check browser security features
    if (typeof crypto !== 'undefined' && crypto.subtle) score += 1;
    if (typeof navigator !== 'undefined' && navigator.serviceWorker) score += 1;

    if (score >= 6) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  const setupSessionMonitoring = () => {
    // Monitor for suspicious session activity
    let lastActivity = Date.now();
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Add event listeners for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session timeout
    const sessionTimeout = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

      if (inactiveTime > maxInactiveTime) {
        setSessionValid(false);
        toast({
          title: 'Session Expired',
          description: 'Your session has expired due to inactivity. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(sessionTimeout);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  };

  const initializeCSP = () => {
    // Add Content Security Policy meta tag if it doesn't exist
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ');
      document.head.appendChild(meta);
    }
  };

  const checkRateLimit = async (action: string, limit: number = 10): Promise<boolean> => {
    return await SecurityManager.checkRateLimit(action, limit, 60);
  };

  const auditAction = async (action: string, details: any = {}) => {
    if (!user) return;
    
    await SecurityManager.auditAccess(
      action,
      'user_actions', 
      user.id,
      {
        ...details,
        security_level: securityLevel,
        csrf_token: csrfToken,
        device_secure: isDeviceSecure,
        timestamp: new Date().toISOString()
      }
    );
  };

  const sanitizeInput = (input: string): string => {
    return SecurityManager.sanitizeInput(input);
  };

  const contextValue: SecurityContextType = {
    isSecure: isDeviceSecure && sessionValid && securityLevel !== 'low',
    csrfToken,
    securityLevel,
    checkRateLimit,
    auditAction,
    sanitizeInput,
    isDeviceSecure,
    sessionValid,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useEnhancedSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useEnhancedSecurity must be used within an EnhancedSecurityProvider');
  }
  return context;
}