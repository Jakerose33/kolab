// src/pages/auth/SignIn.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { Loader2, Mail } from 'lucide-react'

// User-friendly error mapping
const mapError = (error: any): string => {
  const code = error?.code || error?.error_description || '';
  const message = error?.message || '';
  
  if (code.includes('invalid_credentials') || message.includes('Invalid login')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (code.includes('email_not_confirmed') || message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  if (code.includes('too_many_requests')) {
    return 'Too many sign-in attempts. Please wait a few minutes before trying again.';
  }
  if (code.includes('invalid_grant') || message.includes('Invalid grant')) {
    return 'Your session has expired. Please try signing in again.';
  }
  if (code.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return message || 'Unable to sign in. Please try again.';
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SignIn() {
  const nav = useNavigate()
  const { toast } = useToast()
  const { signInEmailPassword, sendMagicLink, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  
  const isLoading = loading || authLoading

  // Validate email on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(null);
    setError(null);
    
    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const onPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    // Client-side validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setLoading(true); 
    setError(null);
    setEmailError(null);

    try {
      const result = await signInEmailPassword(email, password);
      if (result.error) {
        const friendlyMessage = mapError(result.error);
        setError(friendlyMessage);
        toast({ title: 'Sign-in failed', description: friendlyMessage, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back!' });
        nav('/', { replace: true }); // tests expect landing on "/"
      }
    } catch (err: any) {
      const friendlyMessage = mapError(err);
      setError(friendlyMessage);
      toast({ title: 'Sign-in failed', description: friendlyMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const onMagicLink = async () => {
    if (isLoading) return
    
    // Validate email first
    if (!email) {
      setError('Email is required for magic link');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setLoading(true); 
    setError(null);
    setEmailError(null);
    
    try {
      const result = await sendMagicLink(email, `${window.location.origin}/auth/callback`);
      if (result.error) {
        const friendlyMessage = mapError(result.error);
        setError(friendlyMessage);
        toast({ title: 'Failed to send magic link', description: friendlyMessage, variant: 'destructive' });
      } else {
        toast({ 
          title: 'Magic link sent!', 
          description: `Check your inbox at ${email} and click the link to sign in.` 
        });
      }
    } catch (err: any) {
      const friendlyMessage = mapError(err);
      setError(friendlyMessage);
      toast({ title: 'Failed to send magic link', description: friendlyMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={onPasswordSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="signin-email"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                aria-describedby={emailError ? "email-error" : undefined}
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {emailError}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="signin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive" aria-live="polite">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              data-testid="signin-submit" 
              disabled={isLoading || !email || !password || !!emailError}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onMagicLink} 
              disabled={isLoading || !email || !!emailError}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Email me a magic link
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => nav('/auth/forgot-password')}
                className="text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => nav('/auth/signup')}
                className="text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Create account
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
