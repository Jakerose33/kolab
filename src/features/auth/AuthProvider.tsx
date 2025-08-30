// src/features/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type Ctx = {
  session: Session | null
  user: any
  loading: boolean
  isAuthenticated: boolean
  profile: any
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<any>
  signUpEmailPassword: (email: string, password: string) => Promise<void>
  signInEmailPassword: (email: string, password: string) => Promise<any>
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)
export const useAuth = () => useContext(AuthCtx)!

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, s) => {
      setSession(s)
      setLoading(false)
    })
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
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

  // Computed values for backward compatibility
  const user = session?.user || null
  const isAuthenticated = !!session
  const profile = null // For backward compatibility, components should fetch profiles separately

  return <AuthCtx.Provider value={{ 
    session, 
    user,
    loading,
    isAuthenticated,
    profile,
    signUp: signUpEmailPassword,
    signIn: signInEmailPassword,
    signUpEmailPassword, 
    signInEmailPassword, 
    sendMagicLink, 
    signOut 
  }}>
    {children}
  </AuthCtx.Provider>
}