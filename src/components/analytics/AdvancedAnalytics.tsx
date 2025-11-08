import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import { TrendingUp, Users, MousePointer, Clock, Target, Zap, Eye, Share } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'

interface AnalyticsData {
  date: string
  pageViews: number
  uniqueVisitors: number
  eventCreated: number
  bookingsMade: number
  timeOnSite: number
  bounceRate: number
}

interface UserBehavior {
  action: string
  count: number
  avgDuration: number
  conversionRate: number
}

interface ABTest {
  id: string
  name: string
  status: 'running' | 'completed' | 'paused'
  variants: {
    name: string
    visitors: number
    conversions: number
    conversionRate: number
  }[]
  confidence: number
  winner?: string
}

export function AdvancedAnalytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([])
  const [abTests, setAbTests] = useState<ABTest[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
    loadUserBehaviorData()
    loadABTestData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      // Mock analytics data - in production, this would come from your analytics service
      const mockData: AnalyticsData[] = [
        { date: '2024-01-01', pageViews: 1250, uniqueVisitors: 890, eventCreated: 23, bookingsMade: 12, timeOnSite: 185, bounceRate: 0.32 },
        { date: '2024-01-02', pageViews: 1450, uniqueVisitors: 1020, eventCreated: 31, bookingsMade: 18, timeOnSite: 210, bounceRate: 0.28 },
        { date: '2024-01-03', pageViews: 1680, uniqueVisitors: 1180, eventCreated: 28, bookingsMade: 22, timeOnSite: 195, bounceRate: 0.25 },
        { date: '2024-01-04', pageViews: 1320, uniqueVisitors: 950, eventCreated: 19, bookingsMade: 15, timeOnSite: 168, bounceRate: 0.35 },
        { date: '2024-01-05', pageViews: 1890, uniqueVisitors: 1340, eventCreated: 42, bookingsMade: 28, timeOnSite: 225, bounceRate: 0.22 },
        { date: '2024-01-06', pageViews: 2100, uniqueVisitors: 1520, eventCreated: 38, bookingsMade: 31, timeOnSite: 240, bounceRate: 0.20 },
        { date: '2024-01-07', pageViews: 1950, uniqueVisitors: 1420, eventCreated: 35, bookingsMade: 26, timeOnSite: 218, bounceRate: 0.24 }
      ]
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  const loadUserBehaviorData = async () => {
    try {
      const mockBehavior: UserBehavior[] = [
        { action: 'Event Search', count: 15420, avgDuration: 120, conversionRate: 0.15 },
        { action: 'Event Details View', count: 8930, avgDuration: 180, conversionRate: 0.32 },
        { action: 'Venue Browse', count: 6540, avgDuration: 95, conversionRate: 0.08 },
        { action: 'Profile Creation', count: 2180, avgDuration: 300, conversionRate: 0.85 },
        { action: 'Booking Process', count: 1820, avgDuration: 450, conversionRate: 0.78 },
        { action: 'Social Sharing', count: 890, avgDuration: 30, conversionRate: 0.12 }
      ]
      setUserBehavior(mockBehavior)
    } catch (error) {
      console.error('Error loading user behavior data:', error)
    }
  }

  const loadABTestData = async () => {
    try {
      const mockABTests: ABTest[] = [
        {
          id: '1',
          name: 'Event Card Design',
          status: 'running',
          confidence: 78,
          variants: [
            { name: 'Original', visitors: 1250, conversions: 156, conversionRate: 0.125 },
            { name: 'New Design', visitors: 1340, conversions: 201, conversionRate: 0.150 }
          ]
        },
        {
          id: '2', 
          name: 'Checkout Flow',
          status: 'completed',
          confidence: 95,
          winner: 'Variant B',
          variants: [
            { name: 'Variant A', visitors: 2100, conversions: 315, conversionRate: 0.15 },
            { name: 'Variant B', visitors: 2080, conversions: 395, conversionRate: 0.19 }
          ]
        }
      ]
      setAbTests(mockABTests)
    } catch (error) {
      console.error('Error loading A/B test data:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackEvent = async (eventName: string, properties: Record<string, any>) => {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_name: eventName,
          event_properties: properties,
          page_url: window.location.href,
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  const getTotalPageViews = () => analyticsData.reduce((sum, day) => sum + day.pageViews, 0)
  const getTotalUniqueVisitors = () => analyticsData.reduce((sum, day) => sum + day.uniqueVisitors, 0)
  const getAvgTimeOnSite = () => Math.round(analyticsData.reduce((sum, day) => sum + day.timeOnSite, 0) / analyticsData.length)
  const getAvgBounceRate = () => Math.round((analyticsData.reduce((sum, day) => sum + day.bounceRate, 0) / analyticsData.length) * 100)

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <div className="text-2xl font-bold">{getTotalPageViews().toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Unique Visitors</span>
            </div>
            <div className="text-2xl font-bold">{getTotalUniqueVisitors().toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Avg. Time on Site</span>
            </div>
            <div className="text-2xl font-bold">{getAvgTimeOnSite()}s</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
            </div>
            <div className="text-2xl font-bold">{getAvgBounceRate()}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="uniqueVisitors" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="eventCreated" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="bookingsMade" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          {/* User Behavior Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                User Behavior Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBehavior.map((behavior, index) => (
                  <div key={behavior.action} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{behavior.action}</h4>
                        <p className="text-sm text-muted-foreground">
                          {behavior.count.toLocaleString()} actions · {behavior.avgDuration}s avg duration
                        </p>
                      </div>
                    </div>
                    <Badge variant={behavior.conversionRate > 0.5 ? 'default' : behavior.conversionRate > 0.2 ? 'secondary' : 'outline'}>
                      {Math.round(behavior.conversionRate * 100)}% conversion
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Behavior Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Flow Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userBehavior}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ action, percent }) => `${action} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {userBehavior.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-4">
          {/* A/B Testing Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                A/B Testing Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {abTests.map((test) => (
                  <div key={test.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {test.confidence}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          test.status === 'running' ? 'default' :
                          test.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {test.status}
                        </Badge>
                        {test.winner && (
                          <Badge variant="default">
                            Winner: {test.winner}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {test.variants.map((variant) => (
                        <div key={variant.name} className="p-3 rounded border bg-muted/30">
                          <h5 className="font-medium mb-2">{variant.name}</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Visitors:</span>
                              <span>{variant.visitors.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversions:</span>
                              <span>{variant.conversions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversion Rate:</span>
                              <span className="font-medium">
                                {Math.round(variant.conversionRate * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}