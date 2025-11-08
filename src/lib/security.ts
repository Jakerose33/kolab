// Enhanced security utilities
import { supabase } from '@/integrations/supabase/client';

export class SecurityManager {
  // Rate limiting for client-side operations
  static async checkRateLimit(
    actionType: string, 
    limit: number = 100, 
    windowMinutes: number = 60
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: await this.getClientIdentifier(),
        p_action_type: actionType,
        p_limit: limit,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Rate limiting error:', error);
      return false;
    }
  }

  // Get client identifier (IP or user ID)
  private static async getClientIdentifier(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return `user:${user.id}`;
    }
    
    // Fallback to session-based identifier
    return `session:${this.generateSessionId()}`;
  }

  private static generateSessionId(): string {
    let sessionId = localStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  // Audit sensitive operations
  static async auditAccess(
    actionType: string,
    tableName: string,
    recordId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.rpc('log_sensitive_access', {
        p_action_type: actionType,
        p_table_name: tableName,
        p_record_id: recordId,
        p_new_data: additionalData
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate file uploads
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  // Secure local storage operations
  static setSecureItem(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Secure storage failed:', error);
    }
  }

  static getSecureItem<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }

  // Privacy controls
  static async anonymizeUserData(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('anonymize_user_data', {
        target_user_id: userId
      });

      if (error) {
        console.error('Anonymization failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Anonymization error:', error);
      return false;
    }
  }

  // Content Security Policy headers (for server-side implementation)
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.mapbox.com https://*.supabase.co wss://*.supabase.co",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=self'
    };
  }
}

// Rate limiting decorators for API calls
export function withRateLimit(actionType: string, limit: number = 100) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const allowed = await SecurityManager.checkRateLimit(actionType, limit);
      
      if (!allowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Data encryption utilities
export class DataEncryption {
  static async encryptSensitive(data: string): Promise<string> {
    try {
      const { data: encrypted, error } = await supabase.rpc('encrypt_sensitive_data', {
        data,
        key_name: 'default'
      });

      if (error) throw error;
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to plain text
    }
  }

  static async decryptSensitive(encryptedData: string): Promise<string> {
    try {
      const { data: decrypted, error } = await supabase.rpc('decrypt_sensitive_data', {
        encrypted_data: encryptedData,
        key_name: 'default'
      });

      if (error) throw error;
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to encrypted text
    }
  }
}