// Security utilities and constants
export const SecurityConfig = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: ["'self'", "https://api.mapbox.com", "wss:", "https:"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'", "blob:"],
  },
  
  // CORS settings
  cors: {
    allowedOrigins: [
      process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:5173'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  },
  
  // Rate limiting
  rateLimits: {
    auth: { requests: 5, window: 15 * 60 * 1000 }, // 5 per 15 minutes
    api: { requests: 100, window: 60 * 1000 }, // 100 per minute
    upload: { requests: 10, window: 60 * 1000 }, // 10 per minute
  },
};

// Input sanitization patterns
export const XSSPatterns = {
  script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  javascript: /javascript:/gi,
  onEvents: /on\w+\s*=/gi,
  iframe: /<iframe[^>]*>/gi,
  object: /<object[^>]*>/gi,
  embed: /<embed[^>]*>/gi,
  form: /<form[^>]*>/gi,
  meta: /<meta[^>]*>/gi,
  link: /<link[^>]*>/gi,
};

// SQL injection patterns
export const SQLInjectionPatterns = {
  union: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  comment: /(--|\/\*|\*\/|#)/g,
  quotes: /('|('')|;)/g,
  hex: /(0x[0-9a-f]+)/gi,
};

// Security middleware functions
export const SecurityMiddleware = {
  sanitizeInput: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input;
    
    // Remove XSS patterns
    Object.values(XSSPatterns).forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Remove SQL injection patterns
    Object.values(SQLInjectionPatterns).forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  },
  
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  validateURL: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },
  
  generateCSP: (): string => {
    const { csp } = SecurityConfig;
    return Object.entries(csp)
      .map(([directive, sources]) => {
        const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabDirective} ${sources.join(' ')}`;
      })
      .join('; ');
  },
  
  isSecureContext: (): boolean => {
    return window.isSecureContext || location.protocol === 'https:';
  },
  
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
};

// Hook for security validation utilities
export function useSecurityUtils() {
  const sanitize = (input: string) => SecurityMiddleware.sanitizeInput(input);
  const validateEmail = (email: string) => SecurityMiddleware.validateEmail(email);
  const validateURL = (url: string) => SecurityMiddleware.validateURL(url);
  
  return {
    sanitize,
    validateEmail,
    validateURL,
    isSecureContext: SecurityMiddleware.isSecureContext(),
  };
}

// CSRF token management
export class CSRFManager {
  private static token: string | null = null;
  
  static generateToken(): string {
    this.token = SecurityMiddleware.generateNonce();
    return this.token;
  }
  
  static getToken(): string | null {
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    return this.token === token;
  }
  
  static clearToken(): void {
    this.token = null;
  }
}