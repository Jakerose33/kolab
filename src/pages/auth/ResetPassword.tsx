// src/pages/auth/ResetPassword.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [precheckDone, setPrecheckDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Helper: read tokens from query OR hash (Supabase often uses the hash fragment)
  const hasRecoveryToken = () => {
    const fromQuery = searchParams.get('access_token')
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = hashParams.get('access_token')
    return Boolean(fromQuery || fromHash)
  }

  // Pre-check: if the page wasn’t opened via the email link, update will fail anyway.
  useEffect(() => {
    const run = async () => {
      try {
        // If there is no token in URL, check if Supabase has already created a recovery session
        if (!hasRecoveryToken()) {
          const { data } = await supabase.auth.getSession()
          if (!data.session) {
            setError('This reset link is invalid or has expired. Please request a new one.')
          }
        }
      } catch {
        // ignore — updateUser will show a proper error if it truly can’t proceed
      } finally {
        setPrecheckDone(true)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      })

      // After a successful recovery session, send them to sign in
      navigate('/auth', { replace: true })
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to update password'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const isValid = password.length >= 8 && password === confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Please enter and confirm your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          {!precheckDone ? (
            <p className="text-sm text-muted-foreground">Checking your reset link…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || !isValid}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
