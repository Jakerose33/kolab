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
  const { signInEmailPassword, sendMagicLink, signInWithOAuth, loading: authLoading } = useAuth()
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

  const onSocialSignIn = async (provider: 'google' | 'facebook' | 'github') => {
    if (isLoading) return
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithOAuth(provider);
      if (result.error) {
        const friendlyMessage = mapError(result.error);
        setError(friendlyMessage);
        toast({ title: 'Social sign-in failed', description: friendlyMessage, variant: 'destructive' });
      }
      // Note: Successful OAuth redirects to provider, so no success handling needed here
    } catch (err: any) {
      const friendlyMessage = mapError(err);
      setError(friendlyMessage);
      toast({ title: 'Social sign-in failed', description: friendlyMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Choose your preferred sign-in method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Sign In Options */}
          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => onSocialSignIn('google')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => onSocialSignIn('facebook')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Continue with Facebook
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => onSocialSignIn('github')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

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
