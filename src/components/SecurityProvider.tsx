import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CSRFManager } from '@/lib/securityHeaders';

interface SecurityContextType {
  csrfToken: string | null;
  isSecureContext: boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isSecureContext] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || location.protocol === 'https:';
  });

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;
    
    // Generate CSRF token
    const token = CSRFManager.generateToken();
    setCsrfToken(token);

    // Set security headers if possible
    if (isSecureContext) {
      // Add security-related meta tags
      const securityMetas = [
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        { name: 'format-detection', content: 'telephone=no' },
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      ];

      securityMetas.forEach(({ name, httpEquiv, content }) => {
        const meta = document.createElement('meta');
        if (name) meta.name = name;
        if (httpEquiv) meta.httpEquiv = httpEquiv;
        meta.content = content;
        document.head.appendChild(meta);
      });
    }

    // Disable right-click context menu in production
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [isSecureContext]);

  return (
    <SecurityContext.Provider value={{ csrfToken, isSecureContext }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}