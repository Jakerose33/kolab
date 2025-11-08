import { useState } from 'react'
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns'
import { Calendar, Download, RefreshCw, Filter, BarChart3, TrendingUp } from 'lucide-react'
import { KolabHeader } from '@/components/KolabHeader'
import { MetricsGrid } from '@/components/MetricCard'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { DateRange } from 'react-day-picker'

export default function Analytics() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [timeframe, setTimeframe] = useState('30d')

  const {
    eventAnalytics,
    venueAnalytics,
    userBehavior,
    platformMetrics,
    loading,
    error,
    getTopEvents,
    getTopVenues,
    getTotalMetrics,
    refreshData
  } = useAnalytics({
    from: dateRange.from || subDays(new Date(), 30),
    to: dateRange.to || new Date()
  })

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
    const now = new Date()
    
    switch (value) {
      case '7d':
        setDateRange({
          from: subDays(now, 7),
          to: now
        })
        break
      case '30d':
        setDateRange({
          from: subDays(now, 30),
          to: now
        })
        break
      case '90d':
        setDateRange({
          from: subDays(now, 90),
          to: now
        })
        break
      case 'month':
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now)
        })
        break
    }
  }

  const handleExportData = () => {
    // Simulate CSV export
    const csvData = eventAnalytics.map(item => ({
      Date: item.date,
      Views: item.views,
      'Unique Views': item.unique_views,
      'RSVP Conversions': item.rsvp_conversions,
      'Engagement Score': item.engagement_score,
      Revenue: item.revenue
    }))

    toast({
      title: "Export Started",
      description: "Your analytics data is being prepared for download.",
    })
  }

  const totalMetrics = getTotalMetrics()

  const overviewMetrics = [
    {
      title: "Total Views",
      value: totalMetrics.totalViews,
      change: 12.5,
      changeLabel: "vs last period",
      iconType: "eye" as const,
      trend: "up" as const
    },
    {
      title: "Total Revenue",
      value: `$${totalMetrics.totalRevenue.toLocaleString()}`,
      change: 8.2,
      changeLabel: "vs last period",
      iconType: "dollar" as const,
      trend: "up" as const
    },
    {
      title: "Conversions",
      value: totalMetrics.totalConversions,
      change: -2.1,
      changeLabel: "vs last period",
      iconType: "users" as const,
      trend: "down" as const
    },
    {
      title: "Avg. Engagement",
      value: totalMetrics.averageEngagement.toFixed(1),
      change: 15.3,
      changeLabel: "vs last period",
      iconType: "trending" as const,
      trend: "up" as const
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <KolabHeader 
          onCreateEvent={() => {}}
          onOpenMessages={() => {}}
          onOpenNotifications={() => {}}
        />
        <main className="container px-4 py-8">
          <EmptyState
            icon={BarChart3}
            title="Sign in to view analytics"
            description="Please sign in to access your analytics dashboard and insights."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader 
        onCreateEvent={() => {}}
        onOpenMessages={() => {}}
        onOpenNotifications={() => {}}
      />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Insights and performance metrics for your events and venues
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Time Range:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={timeframe} onValueChange={handleTimeframeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={(date) => setDateRange(date || { from: subDays(new Date(), 30), to: new Date() })}
                    className="w-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Metrics */}
          <MetricsGrid metrics={overviewMetrics} />

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="text-destructive text-sm">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-8">
                <LoadingState />
              </CardContent>
            </Card>
          )}

          {/* Analytics Tabs */}
          {!loading && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="venues">Venues</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <AnalyticsCharts
                  eventAnalytics={eventAnalytics}
                  venueAnalytics={venueAnalytics}
                  userBehavior={userBehavior}
                />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Events</CardTitle>
                      <CardDescription>
                        Events with highest engagement scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getTopEvents().length > 0 ? (
                        <div className="space-y-3">
                          {getTopEvents().map((event, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <div className="font-medium">Event #{index + 1}</div>
                                <div className="text-sm text-muted-foreground">
                                  {event.views} views • {event.rsvp_conversions} RSVPs
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{event.engagement_score}</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={TrendingUp}
                          title="No event data"
                          description="Create some events to see analytics here."
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Event Insights</CardTitle>
                      <CardDescription>
                        Key insights from your event data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Best performing day</span>
                        <span className="text-sm font-medium">Friday</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Peak engagement time</span>
                        <span className="text-sm font-medium">2-4 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg. conversion rate</span>
                        <span className="text-sm font-medium">12.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Most popular category</span>
                        <span className="text-sm font-medium">Technology</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="venues" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Revenue Venues</CardTitle>
                      <CardDescription>
                        Venues generating the most revenue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getTopVenues().length > 0 ? (
                        <div className="space-y-3">
                          {getTopVenues().map((venue, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <div className="font-medium">Venue #{index + 1}</div>
                                <div className="text-sm text-muted-foreground">
                                  {venue.booking_requests} requests • {venue.booking_conversions} bookings
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${venue.revenue.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Revenue</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={TrendingUp}
                          title="No venue data"
                          description="Add some venues to see analytics here."
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Venue Performance</CardTitle>
                      <CardDescription>
                        Key metrics for your venues
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg. occupancy rate</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg. booking conversion</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Most booked day</span>
                        <span className="text-sm font-medium">Saturday</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg. rating</span>
                        <span className="text-sm font-medium">4.2⭐</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}