// src/features/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

type Ctx = {
  session: Session | null
  signUpEmailPassword: (email: string, password: string) => Promise<void>
  signInEmailPassword: (email: string, password: string) => Promise<void>
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)
export const useAuth = () => useContext(AuthCtx)!

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUpEmailPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  const signInEmailPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const sendMagicLink = async (email: string, redirectTo = `${location.origin}/auth/callback`) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return <AuthCtx.Provider value={{ session, signUpEmailPassword, signInEmailPassword, sendMagicLink, signOut }}>
    {children}
  </AuthCtx.Provider>
}