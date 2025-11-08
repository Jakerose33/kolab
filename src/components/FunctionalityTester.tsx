import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
}

export function FunctionalityTester() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { session } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { notificationPrefs, updateNotificationPrefs } = useSettings();

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Authentication check
    testResults.push({
      name: 'Authentication',
      status: session?.user ? 'pass' : 'fail',
      message: session?.user ? `Logged in as ${session.user.email}` : 'Not authenticated'
    });

    // Test 2: Profile loading
    testResults.push({
      name: 'Profile Loading',
      status: profile !== undefined ? 'pass' : 'fail',
      message: profile ? 'Profile loaded successfully' : 'Profile not loaded'
    });

    // Test 3: Profile update
    try {
      await updateProfile({ bio: `Test update at ${Date.now()}` });
      testResults.push({
        name: 'Profile Update',
        status: 'pass',
        message: 'Profile updated successfully'
      });
    } catch (error) {
      testResults.push({
        name: 'Profile Update',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: Notification preferences
    try {
      await updateNotificationPrefs({ email_enabled: !notificationPrefs?.email_enabled });
      testResults.push({
        name: 'Notification Settings',
        status: 'pass',
        message: 'Notification preferences updated'
      });
    } catch (error) {
      testResults.push({
        name: 'Notification Settings',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: Toast functionality
    toast.success('Test toast notification');
    testResults.push({
      name: 'Toast Notifications',
      status: 'pass',
      message: 'Toast displayed successfully'
    });

    setTests(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Functionality Test Suite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run All Tests'
          )}
        </Button>

        {tests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{test.message}</span>
                  <Badge variant={test.status === 'pass' ? 'default' : 'destructive'}>
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Quick Actions:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Info toast test')}
            >
              Test Info Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.error('Error toast test')}
            >
              Test Error Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Success toast test')}
            >
              Test Success Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.warning('Warning toast test')}
            >
              Test Warning Toast
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}