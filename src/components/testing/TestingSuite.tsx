import { useState, useEffect } from 'react'
import { Play, CheckCircle, XCircle, AlertCircle, BarChart3, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface TestResult {
  id: string
  name: string
  status: 'passing' | 'failing' | 'pending' | 'skipped'
  duration: number
  error?: string
  category: 'unit' | 'integration' | 'e2e' | 'accessibility'
}

interface TestSuite {
  name: string
  tests: TestResult[]
  coverage: number
}

export function TestingSuite() {
  const { toast } = useToast()
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [running, setRunning] = useState(false)
  const [selectedSuite, setSelectedSuite] = useState<string>('all')

  useEffect(() => {
    loadTestResults()
  }, [])

  const loadTestResults = async () => {
    // Mock test results - in production, this would come from your test runner
    const mockSuites: TestSuite[] = [
      {
        name: 'Unit Tests',
        coverage: 87,
        tests: [
          { id: '1', name: 'EventCard component renders correctly', status: 'passing', duration: 45, category: 'unit' },
          { id: '2', name: 'Search filters work properly', status: 'passing', duration: 123, category: 'unit' },
          { id: '3', name: 'Payment integration handles errors', status: 'failing', duration: 67, error: 'Network timeout', category: 'unit' },
          { id: '4', name: 'User authentication flow', status: 'passing', duration: 234, category: 'unit' }
        ]
      },
      {
        name: 'Integration Tests', 
        coverage: 73,
        tests: [
          { id: '5', name: 'Event creation workflow', status: 'passing', duration: 1200, category: 'integration' },
          { id: '6', name: 'Venue booking process', status: 'passing', duration: 890, category: 'integration' },
          { id: '7', name: 'Real-time messaging', status: 'pending', duration: 0, category: 'integration' }
        ]
      },
      {
        name: 'E2E Tests',
        coverage: 65,
        tests: [
          { id: '8', name: 'Complete user journey', status: 'passing', duration: 2400, category: 'e2e' },
          { id: '9', name: 'Mobile responsive design', status: 'passing', duration: 1800, category: 'e2e' }
        ]
      },
      {
        name: 'Accessibility Tests',
        coverage: 92,
        tests: [
          { id: '10', name: 'WCAG 2.1 AA compliance', status: 'passing', duration: 156, category: 'accessibility' },
          { id: '11', name: 'Keyboard navigation', status: 'passing', duration: 89, category: 'accessibility' },
          { id: '12', name: 'Screen reader compatibility', status: 'failing', duration: 234, error: 'Missing aria-labels', category: 'accessibility' }
        ]
      }
    ]
    setTestSuites(mockSuites)
  }

  const runTests = async (suite?: string) => {
    setRunning(true)
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update test results
      await loadTestResults()
      
      toast({
        title: "Tests Completed",
        description: `${suite || 'All'} tests have finished running.`,
      })
    } catch (error) {
      toast({
        title: "Test Execution Failed",
        description: "There was an error running the tests.",
        variant: "destructive"
      })
    } finally {
      setRunning(false)
    }
  }

  const getAllTests = () => {
    return testSuites.flatMap(suite => suite.tests)
  }

  const getFilteredTests = () => {
    if (selectedSuite === 'all') return getAllTests()
    const suite = testSuites.find(s => s.name.toLowerCase().replace(' ', '') === selectedSuite)
    return suite?.tests || []
  }

  const getTestStats = () => {
    const tests = getAllTests()
    return {
      total: tests.length,
      passing: tests.filter(t => t.status === 'passing').length,
      failing: tests.filter(t => t.status === 'failing').length,
      pending: tests.filter(t => t.status === 'pending').length,
      coverage: Math.round(testSuites.reduce((acc, suite) => acc + suite.coverage, 0) / testSuites.length)
    }
  }

  const stats = getTestStats()
  const filteredTests = getFilteredTests()

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Suite Dashboard
            </CardTitle>
            <Button 
              onClick={() => runTests()} 
              disabled={running}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {running ? 'Running...' : 'Run All Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.passing}</div>
              <div className="text-sm text-muted-foreground">Passing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failing}</div>
              <div className="text-sm text-muted-foreground">Failing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.coverage}%</div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((stats.passing / stats.total) * 100)}%</span>
            </div>
            <Progress value={(stats.passing / stats.total) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs value={selectedSuite} onValueChange={setSelectedSuite}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="unittests">Unit</TabsTrigger>
          <TabsTrigger value="integrationtests">Integration</TabsTrigger>
          <TabsTrigger value="e2etests">E2E</TabsTrigger>
          <TabsTrigger value="accessibilitytests">A11y</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedSuite} className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.name} className={selectedSuite !== 'all' && !suite.name.toLowerCase().replace(' ', '').includes(selectedSuite) ? 'hidden' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{suite.coverage}% coverage</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTests(suite.name)}
                      disabled={running}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(selectedSuite === 'all' ? suite.tests : filteredTests).map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {test.status === 'passing' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {test.status === 'failing' && <XCircle className="h-4 w-4 text-red-600" />}
                        {test.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                        {test.status === 'skipped' && <AlertCircle className="h-4 w-4 text-gray-400" />}
                        
                        <div>
                          <div className="font-medium">{test.name}</div>
                          {test.error && (
                            <div className="text-sm text-red-600">{test.error}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          test.status === 'passing' ? 'default' :
                          test.status === 'failing' ? 'destructive' :
                          test.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {test.status}
                        </Badge>
                        {test.duration > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}