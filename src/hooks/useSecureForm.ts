import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSecurity } from '@/components/SecurityProvider';
import { sanitizeInput, rateLimiters } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface SecureFormOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: z.ZodSchema<T>;
  rateLimitKey?: keyof typeof rateLimiters;
  sanitizeFields?: Array<Path<T>>;
}

export function useSecureForm<T extends FieldValues>({
  schema,
  rateLimitKey,
  sanitizeFields = [],
  ...formOptions
}: SecureFormOptions<T>) {
  const { csrfToken } = useSecurity();
  const { toast } = useToast();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  const secureSubmit = (onSubmit: (data: T) => void | Promise<void>) => {
    return form.handleSubmit(async (data) => {
      // Rate limiting check
      if (rateLimitKey) {
        const limiter = rateLimiters[rateLimitKey];
        const clientId = window.navigator.userAgent;
        
        if (!limiter.isAllowed(clientId)) {
          const remainingTime = limiter.getRemainingTime(clientId);
          const minutes = Math.ceil(remainingTime / 60000);
          toast({
            title: "Rate Limit Exceeded",
            description: `Too many attempts. Try again in ${minutes} minute(s).`,
            variant: "destructive",
          });
          return;
        }
      }

      // Sanitize specified fields
      const sanitizedData = { ...data };
      sanitizeFields.forEach(field => {
        const value = sanitizedData[field];
        if (typeof value === 'string') {
          sanitizedData[field] = sanitizeInput.text(value) as any;
        }
      });

      // Add CSRF token if available
      if (csrfToken) {
        (sanitizedData as any)._csrf = csrfToken;
      }

      try {
        await onSubmit(sanitizedData);
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: "Submission Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      }
    });
  };

  const secureSetValue = (name: Path<T>, value: any) => {
    // Sanitize string values before setting
    const sanitizedValue = typeof value === 'string' ? sanitizeInput.text(value) : value;
    form.setValue(name, sanitizedValue);
  };

  return {
    ...form,
    secureSubmit,
    secureSetValue,
  };
}