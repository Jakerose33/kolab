// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { LoadingState } from '@/components/LoadingState'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const { exchangeCodeForSession } = useAuth()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      try {
        // If Supabase put an error in the URL (e.g. expired/invalid link), show it.
        const errDesc = search.get('error_description')
        if (errDesc) {
          throw new Error(errDesc)
        }

        // If there’s no "code" in the URL, there’s nothing to exchange.
        const code = search.get('code')
        if (!code) {
          throw new Error('Missing authorisation code in the URL.')
        }

        // Complete the session from the magic-link / PKCE params in the URL
        const { error } = await exchangeCodeForSession(window.location.href)
        if (error) {
          throw error
        }

        // Success — brief message, then home
        if (!isMounted) return
        navigate('/', { replace: true })
      } catch (e: any) {
        if (!isMounted) return
        const code = e?.code ? `${e.code}: ` : ''
        setError(`${code}${e?.message ?? 'Authentication failed.'}`)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => { isMounted = false }
  }, [navigate, search])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <LoadingState />
        <p className="mt-4 text-muted-foreground">Completing authentication…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Authentication failed: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/auth')} className="w-full">
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Success: render briefly before navigate (usually instantaneous)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  )
}
