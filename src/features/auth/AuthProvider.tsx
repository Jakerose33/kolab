// src/features/auth/AuthProvider.tsx
// Single source of truth for auth; do not call supabase.auth directly
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthResult = { error: null } | { error: any };

type Ctx = {
  session: Session | null;
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  // Auth methods
  signInEmailPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpEmailPassword: (email: string, password: string) => Promise<AuthResult>;
  sendMagicLink: (email: string, redirectTo?: string) => Promise<AuthResult>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  exchangeCodeForSession: (url: string) => Promise<AuthResult>;
  getCurrentSession: () => Promise<Session | null>;
  signOut: () => Promise<AuthResult>;
  // backward-compatible aliases expected by older components
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  profile: any; // legacy shape; keep null
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e: AuthChangeEvent, s) => {
        setSession(s ?? null);
        setLoading(false);
      }
    );
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Wrap Supabase calls to always return { error } instead of throwing.
  const wrap = async <T,>(fn: () => Promise<{ data: T; error: any }>): Promise<AuthResult> => {
    try {
      const { error } = await fn();
      if (error) return { error };
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signInEmailPassword = (email: string, password: string) =>
    wrap(() => supabase.auth.signInWithPassword({ email, password }));

  const signUpEmailPassword = (email: string, password: string) =>
    wrap(() => supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    }));

  const sendMagicLink = (email: string, redirectTo?: string) =>
    wrap(() =>
      supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })
    );

  const resetPassword = (email: string, redirectTo?: string) =>
    wrap(() => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/auth/reset-password`
    }));

  const updatePassword = (password: string) =>
    wrap(() => supabase.auth.updateUser({ password }));

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

  const signOut = () => wrap(() => supabase.auth.signOut().then(() => ({ data: null, error: null })));

  const value: Ctx = {
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: !!session,
    signInEmailPassword,
    signUpEmailPassword,
    sendMagicLink,
    resetPassword,
    updatePassword,
    exchangeCodeForSession,
    getCurrentSession,
    signOut,
    // aliases for legacy callers
    signIn: signInEmailPassword,
    signUp: signUpEmailPassword,
    profile: null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}