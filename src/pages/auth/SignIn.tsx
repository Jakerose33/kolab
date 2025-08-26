import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

export default function SignIn() {
  const nav = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast({ title: 'Welcome back' })
      nav('/', { replace: true })
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to sign in'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const onMagicLink = async () => {
    setLoading(true); setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
      })
      if (error) throw error
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
              <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={onMagicLink} disabled={loading || !email}>
              Email me a magic link
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/auth/forgot-password" className="underline">Forgot password?</Link>
              <Link to="/auth/signup" className="underline">Create account</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
