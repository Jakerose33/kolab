import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('Auth callback error:', { error, errorDescription });
          setErrorMessage(errorDescription || error);
          setStatus('error');
          return;
        }

        // Check for authorization code (PKCE flow)
        const code = searchParams.get('code');
        
        if (code) {
          console.log('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setErrorMessage(exchangeError.message);
            setStatus('error');
            return;
          }
          
          if (data.session) {
            console.log('Session established successfully:', data.session);
            setSuccessMessage('Authentication successful! Redirecting...');
            setStatus('success');
            
            // Get redirect URL from state or default to home
            const redirectTo = searchParams.get('state') || '/';
            
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 2000);
            return;
          }
        }

        // Check for other auth-related params (like for OTP verification)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Setting session from tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setErrorMessage(sessionError.message);
            setStatus('error');
            return;
          }
          
          if (data.session) {
            console.log('Session established from tokens:', data.session);
            setSuccessMessage('Authentication successful! Redirecting...');
            setStatus('success');
            
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
            return;
          }
        }

        // If we get here, check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Existing session found:', session);
          setSuccessMessage('Already authenticated! Redirecting...');
          setStatus('success');
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.log('No session found, redirecting to auth page');
          setErrorMessage('No authentication session found.');
          setStatus('error');
        }
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/auth', { replace: true });
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            
            {status === 'loading' && 'Processing Authentication...'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we process your authentication.'}
            {status === 'success' && 'You will be redirected shortly.'}
            {status === 'error' && 'There was an issue with your authentication.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleGoHome} variant="outline" className="flex-1">
                  Go Home
                </Button>
              </div>
            </>
          )}
          
          {status === 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              <div className="mb-2">Processing your authentication request...</div>
              <div className="text-xs">
                This may take a few moments.
              </div>
            </div>
          )}
          
          {/* Debug info for development */}
          {(status === 'error' || import.meta.env.DEV) && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Debug Info</summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                <div><strong>URL Params:</strong></div>
                {Array.from(searchParams.entries()).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}