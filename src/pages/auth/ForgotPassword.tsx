// src/pages/auth/ForgotPassword.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0) // seconds until resend enabled
  const { toast } = useToast()

  useEffect(() => {
    if (resendIn <= 0) return
    const id = setInterval(() => setResendIn(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [resendIn])

  const sendReset = async (targetEmail: string) => {
    const { error } = await resetPassword(targetEmail)
    if (error) throw error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      console.log('Attempting to send reset email to:', email)
      await sendReset(email)
      console.log('Reset email sent successfully, setting sent=true')
      setSent(true)
      setResendIn(60)
      toast({
        title: 'Reset link sent',
        description: `We've sent a password reset link to ${email}.`,
      })
    } catch (err: any) {
      console.error('Reset email error:', err)
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to send reset email'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendIn > 0) return
    setLoading(true)
    setError(null)
    try {
      await sendReset(email)
      setResendIn(60)
      toast({ title: 'Email resent', description: `Another reset link was sent to ${email}.` })
    } catch (err: any) {
      const msg = `${err?.code ? `${err.code}: ` : ''}${err?.message ?? 'Unable to resend email'}`
      setError(msg)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    console.log('Rendering success panel with sent=true')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a reset link to <span className="font-medium">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" data-testid="reset-success">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check Spam/Promotions, or resend below.
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResend}
                className="flex-1"
                disabled={loading || resendIn > 0}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend email'}
              </Button>
              <Button variant="secondary" onClick={() => setSent(false)} className="flex-1">
                Try another email
              </Button>
            </div>

            <Button variant="ghost" onClick={() => window.location.href = "/auth"} className="w-full">
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send reset email'}
            </Button>

            <Button variant="ghost" onClick={() => window.location.href = "/auth"} className="w-full flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
