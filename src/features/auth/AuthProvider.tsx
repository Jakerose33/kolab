import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  lastError: AuthError | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  sendMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'magiclink') => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const handleAuthError = useCallback((error: AuthError | null, action: string) => {
    if (error) {
      setLastError(error);
      console.error(`Auth Error (${action}):`, {
        code: error.message,
        message: error.message,
        status: error.status,
        full: error
      });
      
      toast({
        title: `${action} Failed`,
        description: `${error.message} (Code: ${error.status || 'N/A'})`,
        variant: "destructive",
      });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      }
    });

    handleAuthError(error, 'Sign Up');
    
    if (!error) {
      toast({
        title: "Check Your Email",
        description: "We've sent you a confirmation link.",
      });
    }

    return { error };
  }, [handleAuthError]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    handleAuthError(error, 'Sign In');
    
    if (!error) {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    }

    return { error };
  }, [handleAuthError]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    handleAuthError(error, 'Sign Out');
    
    if (!error) {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }

    return { error };
  }, [handleAuthError]);

  const sendMagicLink = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    handleAuthError(error, 'Magic Link');
    
    if (!error) {
      toast({
        title: "Magic Link Sent",
        description: "Check your email for the magic link.",
      });
    }

    return { error };
  }, [handleAuthError]);

  const verifyOtp = useCallback(async (email: string, token: string, type: 'signup' | 'magiclink') => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    handleAuthError(error, 'OTP Verification');
    
    if (!error) {
      toast({
        title: "Verification Successful",
        description: "You have been authenticated successfully.",
      });
    }

    return { error };
  }, [handleAuthError]);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    handleAuthError(error, 'Password Reset');
    
    if (!error) {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    }

    return { error };
  }, [handleAuthError]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', { event, session });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clear error on successful auth
        if (session) {
          setLastError(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    lastError,
    signUp,
    signIn,
    signOut,
    sendMagicLink,
    verifyOtp,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}