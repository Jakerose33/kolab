import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

export default function SignUp() {
  const { signUpEmailPassword, sendMagicLink } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('Password must be at least 8 characters long')
    if (password !== confirm) return setError('Passwords do not match')

    setLoading(true)
    try {
      const { error } = await signUpEmailPassword(email, password)
      if (error) throw error
      setSent(true)
      toast({ title: 'Confirmation sent', description: `Check your inbox: ${email}` })
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to sign up'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const onMagicLink = async () => {
    setLoading(true); setError(null)
    try {
      const { error } = await sendMagicLink(email)
      if (error) throw error
      setSent(true)
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>We’ll email you a confirmation link to finish sign-up.</CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={onSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || !email || password.length < 8 || password !== confirm}>
                {loading ? 'Creating…' : 'Create account'}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={onMagicLink} disabled={loading || !email}>
                Email me a magic link instead
              </Button>

              <div className="text-sm text-center">
                Already have an account? <span onClick={() => window.location.href = "/auth"} className="underline cursor-pointer">Sign in</span>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p>We’ve sent a confirmation link to <span className="font-medium">{email}</span>. Open it on this device to finish sign-up.</p>
              <div className="text-sm">
                Didn’t get it? Check Spam/Promotions, or try again later.
              </div>
              <Button variant="outline" onClick={() => setSent(false)}>Use a different email</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
