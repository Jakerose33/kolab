// src/features/auth/AuthProvider.tsx
// Single source of truth for auth; do not call supabase.auth directly
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthError = { message: string; code?: string };
type AuthResult = { error: null } | { error: AuthError };

export interface AuthUser extends User {
  profile?: {
    id: string;
    full_name?: string;
    handle?: string;
    avatar_url?: string;
    bio?: string;
  };
}

type OAuthProvider = 'google' | 'facebook' | 'github';

type Ctx = {
  session: Session | null;
  user: AuthUser | null;
  profile: any; // legacy shape; keep null for backward compatibility
  loading: boolean;
  isAuthenticated: boolean;
  // Enhanced auth methods
  signInEmailPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpEmailPassword: (email: string, password: string, metadata?: { fullName?: string }) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResult>;
  sendMagicLink: (email: string, redirectTo?: string) => Promise<AuthResult>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  exchangeCodeForSession: (url: string) => Promise<AuthResult>;
  getCurrentSession: () => Promise<Session | null>;
  signOut: () => Promise<AuthResult>;
  // Profile methods
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<AuthResult>;
  // backward-compatible aliases expected by older components
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Session refresh interval (50 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user as AuthUser);
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setUser(prev => prev ? { ...prev, profile: data } : null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    let mounted = true;
    
    // Initialize session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user as AuthUser ?? null);
      setLoading(false);
      
      // Fetch profile after session is set
      if (data.session?.user) {
        setTimeout(() => fetchProfile(), 0);
      }
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e: AuthChangeEvent, s) => {
        setSession(s ?? null);
        setUser(s?.user as AuthUser ?? null);
        setLoading(false);
        
        // Fetch profile when user signs in
        if (s?.user) {
          setTimeout(() => fetchProfile(), 0);
        }
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Error message mapping
  const mapErrorToMessage = (error: any): AuthError => {
    const message = error?.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return { message: 'Invalid email or password. Please try again.', code: 'invalid_credentials' };
    }
    if (message.includes('Email not confirmed')) {
      return { message: 'Please check your email and click the verification link.', code: 'email_unconfirmed' };
    }
    if (message.includes('User already registered')) {
      return { message: 'An account with this email already exists. Try signing in instead.', code: 'user_exists' };
    }
    if (message.includes('Email rate limit exceeded')) {
      return { message: 'Too many email attempts. Please wait before trying again.', code: 'rate_limit' };
    }
    if (message.includes('Invalid email')) {
      return { message: 'Please enter a valid email address.', code: 'invalid_email' };
    }
    if (message.includes('Password should be at least')) {
      return { message: 'Password must be at least 6 characters long.', code: 'weak_password' };
    }
    
    return { message: message || 'An unexpected error occurred. Please try again.', code: 'unknown' };
  };

  // Enhanced wrapper with error mapping and toast notifications
  const wrap = async <T,>(
    fn: () => Promise<{ data: T; error: any }>, 
    context?: string,
    showSuccessToast?: boolean
  ): Promise<AuthResult> => {
    try {
      const { error } = await fn();
      if (error) {
        const mappedError = mapErrorToMessage(error);
        console.error(`Auth error (${context}):`, error);
        
        toast({
          title: 'Authentication Error',
          description: mappedError.message,
          variant: 'destructive',
        });
        
        return { error: mappedError };
      }
      
      if (showSuccessToast && context) {
        toast({
          title: 'Success',
          description: context,
        });
      }
      
      return { error: null };
    } catch (e: any) {
      const mappedError = mapErrorToMessage(e);
      console.error(`Auth exception (${context}):`, e);
      
      toast({
        title: 'Authentication Error',
        description: mappedError.message,
        variant: 'destructive',
      });
      
      return { error: mappedError };
    }
  };

  const signInEmailPassword = (email: string, password: string) =>
    wrap(() => supabase.auth.signInWithPassword({ email, password }), 'Successfully signed in!', true);

  const signUpEmailPassword = (email: string, password: string, metadata?: { fullName?: string }) =>
    wrap(() => supabase.auth.signUp({ 
      email, 
      password,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata ? { full_name: metadata.fullName } : undefined
      }
    }), 'Account created! Please check your email to verify your account.', true);

  const signInWithOAuth = (provider: OAuthProvider) =>
    wrap(() => supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    }), `Redirecting to ${provider}...`);

  const sendMagicLink = (email: string, redirectTo?: string) =>
    wrap(() =>
      supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      }),
      'Magic link sent! Check your email.',
      true
    );

  const resetPassword = (email: string, redirectTo?: string) =>
    wrap(() => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/auth/reset-password`
    }), 'Password reset link sent to your email.', true);

  const updatePassword = (password: string) =>
    wrap(() => supabase.auth.updateUser({ password }), 'Password updated successfully!', true);

  const updateProfile = async (updates: Record<string, any>): Promise<AuthResult> => {
    if (!user?.id) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });

      return { error: null };
    } catch (error: any) {
      const mappedError = mapErrorToMessage(error);
      toast({
        title: 'Error',
        description: mappedError.message,
        variant: 'destructive',
      });
      return { error: mappedError };
    }
  };

  const exchangeCodeForSession = (url: string) =>
    wrap(() => supabase.auth.exchangeCodeForSession(url));

  const getCurrentSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  };

  const signOut = () => {
    setUser(null);
    return wrap(() => supabase.auth.signOut().then(() => ({ data: null, error: null })), 'Successfully signed out!', true);
  };

  const value: Ctx = {
    session,
    user,
    profile: null, // legacy shape; keep null for backward compatibility
    loading,
    isAuthenticated: !!session,
    // Enhanced auth methods
    signInEmailPassword,
    signUpEmailPassword,
    signInWithOAuth,
    sendMagicLink,
    resetPassword,
    updatePassword,
    exchangeCodeForSession,
    getCurrentSession,
    signOut,
    // Profile methods
    fetchProfile,
    updateProfile,
    // aliases for legacy callers
    signIn: signInEmailPassword,
    signUp: signUpEmailPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}