import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiters, UserValidation } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useSecureAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });
  
  const { toast } = useToast();

  // Clear error state
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Secure sign up with validation and rate limiting
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    // Use email as rate limit key instead of user agent for better per-user limiting
    const clientId = email || 'anonymous';
    
    // Rate limiting check
    if (!rateLimiters.auth.isAllowed(clientId)) {
      const remainingTime = rateLimiters.auth.getRemainingTime(clientId);
      const minutes = Math.ceil(remainingTime / 60000);
      const error = `Too many attempts. Try again in ${minutes} minute(s).`;
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error: { message: error } };
    }

    try {
      // Validate inputs
      const validatedEmail = UserValidation.email.parse(email);
      const validatedPassword = UserValidation.password.parse(password);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedEmail,
        password: validatedPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? {
            full_name: UserValidation.name.parse(fullName),
          } : undefined,
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message === 'User already registered') {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Try signing in instead, or check your email for a confirmation link.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        setAuthState(prev => ({ ...prev, error: error.message }));
      } else {
        rateLimiters.auth.reset(clientId);
        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link. Click it to activate your account.",
        });
      }

      return { data, error };
    } catch (validationError) {
      const errorMessage = validationError instanceof Error 
        ? validationError.message 
        : 'Invalid input provided';
      
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: { message: errorMessage } };
    }
  }, [toast]);

  // Secure sign in with validation and rate limiting
  const signIn = useCallback(async (email: string, password: string) => {
    // Use email as rate limit key instead of user agent for better per-user limiting
    const clientId = email || 'anonymous';
    
    // Rate limiting check
    if (!rateLimiters.auth.isAllowed(clientId)) {
      const remainingTime = rateLimiters.auth.getRemainingTime(clientId);
      const minutes = Math.ceil(remainingTime / 60000);
      const error = `Too many attempts. Try again in ${minutes} minute(s).`;
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error: { message: error } };
    }

    try {
      // Validate inputs
      const validatedEmail = UserValidation.email.parse(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password: password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        rateLimiters.auth.reset(clientId);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }

      return { data, error };
    } catch (validationError) {
      const errorMessage = validationError instanceof Error 
        ? validationError.message 
        : 'Invalid email provided';
      
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: { message: errorMessage } };
    }
  }, [toast]);

  // Secure sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }

      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  }, [toast]);

  // Reset password with validation
  const resetPassword = useCallback(async (email: string) => {
    try {
      const validatedEmail = UserValidation.email.parse(email);
      const redirectUrl = `${window.location.origin}/auth?mode=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
      }

      return { error };
    } catch (validationError) {
      const errorMessage = validationError instanceof Error 
        ? validationError.message 
        : 'Invalid email provided';
      
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error: { message: errorMessage } };
    }
  }, [toast]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null,
        }));
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
  };
}