import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/AuthProvider';

export default function AuthDebug() {
  const auth = useAuth();
  const { session } = auth;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<any>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  // Environment check
  const supabaseUrl = "https://vjdcstouchofifbdanjx.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGNzdG91Y2hvZmlmYmRhbmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzY1NTcsImV4cCI6MjA3MDgxMjU1N30.HvT_EZDdW428jkVOlrAE-XZ_V4W1AEj8eEbSsgF4BoQ";

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Auth Debug Playground</h1>
          <p className="text-muted-foreground">Diagnose and test authentication functionality</p>
        </div>

        {/* Environment Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Supabase URL:</span>
              <Badge variant={supabaseUrl ? "default" : "destructive"}>
                {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Supabase Anon Key:</span>
              <Badge variant={supabaseKey ? "default" : "destructive"}>
                {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "Missing"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Session */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            {false ? (
              <div className="text-muted-foreground">Loading session...</div>
            ) : session ? (
              <div className="space-y-2">
                <div><strong>User ID:</strong> {session.user?.id}</div>
                <div><strong>Email:</strong> {session.user?.email}</div>
                <div><strong>Email Confirmed:</strong> {session.user?.email_confirmed_at ? 'Yes' : 'No'}</div>
                <div><strong>Expires At:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Never'}</div>
                <div><strong>Provider:</strong> {session.user?.app_metadata?.provider || 'email'}</div>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Full Session JSON</summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-muted-foreground">No active session</div>
            )}
          </CardContent>
        </Card>


        {/* Auth Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Email/Password Auth */}
          <Card>
            <CardHeader>
              <CardTitle>Email/Password Auth</CardTitle>
              <CardDescription>Test sign up and sign in flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (for signup)</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction(() => auth.signUpEmailPassword(email, password))}
                  disabled={isLoading || !email || !password}
                  className="flex-1"
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => handleAction(() => auth.signInEmailPassword(email, password))}
                  disabled={isLoading || !email || !password}
                  variant="outline"
                  className="flex-1"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Magic Link / OTP */}
          <Card>
            <CardHeader>
              <CardTitle>Magic Link / OTP</CardTitle>
              <CardDescription>Test passwordless authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magicEmail">Email</Label>
                <Input
                  id="magicEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button
                onClick={() => handleAction(() => auth.sendMagicLink(email))}
                disabled={isLoading || !email}
                className="w-full"
              >
                Send Magic Link
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="otpCode">OTP Code</Label>
                <Input
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <p className="text-sm text-muted-foreground">OTP verification not available in simplified auth</p>
            </CardContent>
          </Card>

          {/* Other Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Other Actions</CardTitle>
              <CardDescription>Password reset and session management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Password reset not available in simplified auth</p>
              
              {session && (
                <Button
                  onClick={() => handleAction(() => auth.signOut())}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  Sign Out
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Checklist</CardTitle>
              <CardDescription>Manual acceptance tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={session ? "default" : "secondary"}>
                  {session ? "✓" : "○"}
                </Badge>
                <span>Email+password sign-up → confirmation email → click link → user appears</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">○</Badge>
                <span>Magic link sign-in → /auth/callback swaps code for session → redirected to /</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">○</Badge>
                <span>OTP flow → call verifyOtp → session present</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={session ? "default" : "secondary"}>
                  {session ? "✓" : "○"}
                </Badge>
                <span>Hard refresh keeps the session</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">○</Badge>
                <span>Sign out clears session</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">○</Badge>
                <span>Failure paths show real error codes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
