import { z } from "zod";

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{8,}$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  noScript: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  noHtml: /<[^>]*>/g,
  sqlInjection: /('|('')|;|\/\*|\*\/|xp_|sp_|union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
};

// Input sanitization functions
export const sanitizeInput = {
  text: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(ValidationPatterns.noScript, '')
      .replace(ValidationPatterns.noHtml, '')
      .replace(ValidationPatterns.sqlInjection, '')
      .trim()
      .slice(0, 1000); // Limit length
  },
  
  html: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    // Allow basic HTML but remove scripts and dangerous elements
    return input
      .replace(ValidationPatterns.noScript, '')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/<object[^>]*>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .slice(0, 5000);
  },
  
  email: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input.toLowerCase().trim().slice(0, 254);
  },
  
  url: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    try {
      const url = new URL(input);
      return url.toString();
    } catch {
      return '';
    }
  }
};

// Validation schemas
export const UserValidation = {
  email: z.string()
    .email("Invalid email format")
    .max(254, "Email too long")
    .transform(sanitizeInput.email),
    
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
    
  name: z.string()
    .min(1, "Name required")
    .max(100, "Name too long")
    .transform(sanitizeInput.text),
    
  bio: z.string()
    .max(500, "Bio too long")
    .transform(sanitizeInput.text)
    .optional(),
    
  website: z.string()
    .url("Invalid URL")
    .transform(sanitizeInput.url)
    .optional()
    .or(z.literal('')),
};

export const EventValidation = {
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title too long")
    .transform(sanitizeInput.text),
    
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long")
    .transform(sanitizeInput.html),
    
  capacity: z.number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(100000, "Capacity too large")
    .optional(),
    
  tags: z.array(z.string().transform(sanitizeInput.text))
    .max(10, "Too many tags")
    .optional(),
    
  startAt: z.string()
    .datetime("Invalid date format")
    .refine((date) => new Date(date) > new Date(), "Start date must be in the future"),
    
  endAt: z.string()
    .datetime("Invalid date format")
    .optional(),
};

export const VenueValidation = {
  name: z.string()
    .min(3, "Venue name must be at least 3 characters")
    .max(100, "Venue name too long")
    .transform(sanitizeInput.text),
    
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long")
    .transform(sanitizeInput.html),
    
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address too long")
    .transform(sanitizeInput.text),
    
  capacity: z.number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(50000, "Capacity too large"),
    
  hourlyRate: z.number()
    .min(0, "Rate cannot be negative")
    .max(10000, "Rate too high")
    .optional(),
};

export const MessageValidation = {
  content: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long")
    .transform(sanitizeInput.text),
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    return Math.max(0, attempt.resetTime - Date.now());
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Global rate limiters
export const rateLimiters = {
  auth: new RateLimiter(15, 5 * 60 * 1000), // 15 attempts per 5 minutes (more reasonable)
  events: new RateLimiter(10, 60 * 1000), // 10 events per minute
  messages: new RateLimiter(30, 60 * 1000), // 30 messages per minute
  bookings: new RateLimiter(5, 60 * 1000), // 5 bookings per minute
};