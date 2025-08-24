import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(`${error.code || 'AUTH_ERROR'}: ${error.message}`)
          return
        }

        if (data.session) {
          console.log('Auth callback successful, session created')
          navigate('/', { replace: true })
        } else {
          setError('No session created after authentication')
        }
      } catch (err: any) {
        console.error('Unexpected auth callback error:', err)
        setError(`Unexpected error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <LoadingState />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
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
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full"
          >
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}