// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      // Handles PKCE / magic link codes in URL
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) { setErr(`${error.code ?? ''} ${error.message}`); return }
      nav('/', { replace: true })
    }
    run()
  }, [nav])

  return (
    <main className="min-h-screen grid place-items-center p-8">
      {err ? <p className="text-red-400">{err}</p> : <p>Signing you in…</p>}
    </main>
  )
}