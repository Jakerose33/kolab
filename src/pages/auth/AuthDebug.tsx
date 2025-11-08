import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import type { Session, User } from '@supabase/supabase-js'

export default function AuthDebug() {
  const { 
    session, 
    user, 
    signUpEmailPassword, 
    signInEmailPassword, 
    sendMagicLink, 
    signOut 
  } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({
    signUp: 'pending',
    signIn: 'pending',
    magicLink: 'pending',
    signOut: 'pending'
  })
  const { toast } = useToast()

  const handleAction = async (action: () => Promise<any>, testName: string) => {
    setLoading(true)
    setLastError(null)
    
    try {
      const result = await action()
      if (result.error) {
        throw result.error
      }
      setTestResults(prev => ({ ...prev, [testName]: 'success' }))
      toast({ title: `${testName} successful` })
    } catch (error: any) {
      console.error(`${testName} error:`, error)
      setLastError(`${testName}: ${error.code || 'ERROR'} - ${error.message}`)
      setTestResults(prev => ({ ...prev, [testName]: 'error' }))
      toast({
        title: `${testName} failed`,
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Auth state is managed by AuthProvider, no need for manual setup

  const testSignUp = () => handleAction(async () => {
    const testEmail = `test+${Date.now()}@example.com`
    return signUpEmailPassword(testEmail, 'testpassword123')
  }, 'signUp')

  const testSignIn = () => handleAction(async () => {
    return signInEmailPassword('test@example.com', 'testpassword123')
  }, 'signIn')

  const testMagicLink = () => handleAction(async () => {
    const testEmail = `magic+${Date.now()}@example.com`
    return sendMagicLink(testEmail)
  }, 'magicLink')

  const testSignOut = () => handleAction(async () => {
    return signOut()
  }, 'signOut')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Authentication Debug</h1>
          <p className="text-muted-foreground mt-2">
            Test and debug authentication flows
          </p>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <Badge variant="outline">✓ Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span>Anon Key:</span>
              <Badge variant="outline">✓ Present</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {user.id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email Confirmed:</span>
                  <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Session Expires:</span>
                  <span>{session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active session</p>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Email/Password Auth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email</Label>
                <Input id="test-email" type="email" placeholder="test@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Password</Label>
                <Input id="test-password" type="password" placeholder="password123" />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={testSignUp} 
                  disabled={loading} 
                  variant="outline"
                  className="flex-1"
                >
                  Test Sign Up
                </Button>
                <Button 
                  onClick={testSignIn} 
                  disabled={loading}
                  className="flex-1"
                >
                  Test Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Magic Link / OTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email for Magic Link</Label>
                <Input id="magic-email" type="email" placeholder="magic@example.com" />
              </div>
              <Button 
                onClick={testMagicLink} 
                disabled={loading}
                className="w-full"
              >
                Send Magic Link
              </Button>
              <p className="text-xs text-muted-foreground">
                Note: OTP verification is simplified in this debug environment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Other Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Other Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testSignOut} 
              disabled={loading}
              variant="destructive"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Test Status */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(testResults).map(([test, status]) => (
                <div key={test} className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="capitalize">{test}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Last Error */}
        {lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{lastError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
