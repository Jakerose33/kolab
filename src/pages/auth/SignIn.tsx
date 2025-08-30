// src/pages/auth/SignIn.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/AuthProvider'

export default function SignIn() {
  const nav = useNavigate()
  const { toast } = useToast()
  const { signInEmailPassword, sendMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true); setError(null)

    try {
      await signInEmailPassword(email, password)
      toast({ title: 'Welcome back' })
      nav('/', { replace: true }) // tests expect landing on "/"
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to sign in'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const onMagicLink = async () => {
    if (loading) return
    setLoading(true); setError(null)
    try {
      await sendMagicLink(email, `${window.location.origin}/auth/callback`)
      toast({ title: 'Magic link sent', description: `Check your inbox: ${email}` })
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to send magic link'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your email and password, or get a magic link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="signin-email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="signin-password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive" aria-live="polite">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" data-testid="signin-submit" disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={onMagicLink} disabled={loading || !email}>
              Email me a magic link
            </Button>

            <div className="flex items-center justify-between text-sm">
              {/* FIX: route matches tests */}
              <Link to="/auth/forgot-password" className="underline">Forgot password?</Link>
              <Link to="/auth/signup" className="underline">Create account</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
