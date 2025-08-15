import { useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { TrendingUp, BarChart3, Calendar, Users } from 'lucide-react'

interface AnalyticsChartsProps {
  eventAnalytics: any[]
  venueAnalytics: any[]
  userBehavior: any[]
  className?: string
}

export function AnalyticsCharts({ 
  eventAnalytics, 
  venueAnalytics, 
  userBehavior,
  className 
}: AnalyticsChartsProps) {
  const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }

  const pieColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.accent,
    chartColors.success,
    chartColors.warning,
    chartColors.danger
  ]

  const formatTooltipValue = (value: any, name: string) => {
    if (name.includes('rate') || name.includes('score')) {
      return [`${value}%`, name]
    }
    if (name.includes('revenue')) {
      return [`$${value.toLocaleString()}`, name]
    }
    return [value.toLocaleString(), name]
  }

  const engagementData = useMemo(() => {
    return eventAnalytics.map(item => ({
      date: item.date,
      views: item.views,
      unique_views: item.unique_views,
      rsvps: item.rsvp_conversions,
      shares: item.shares,
      engagement_score: item.engagement_score
    }))
  }, [eventAnalytics])

  const revenueData = useMemo(() => {
    const eventRevenue = eventAnalytics.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.revenue
      return acc
    }, {})

    const venueRevenue = venueAnalytics.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.revenue
      return acc
    }, {})

    const dates = [...new Set([...Object.keys(eventRevenue), ...Object.keys(venueRevenue)])]
    
    return dates.map(date => ({
      date,
      events: eventRevenue[date] || 0,
      venues: venueRevenue[date] || 0,
      total: (eventRevenue[date] || 0) + (venueRevenue[date] || 0)
    })).sort((a, b) => a.date.localeCompare(b.date))
  }, [eventAnalytics, venueAnalytics])

  const categoryDistribution = useMemo(() => {
    const total = eventAnalytics.reduce((sum, item) => sum + item.views, 0)
    
    return [
      { name: 'Tech Events', value: 35, color: pieColors[0] },
      { name: 'Networking', value: 25, color: pieColors[1] },
      { name: 'Workshops', value: 20, color: pieColors[2] },
      { name: 'Social', value: 15, color: pieColors[3] },
      { name: 'Other', value: 5, color: pieColors[4] }
    ]
  }, [eventAnalytics])

  const userActivityData = useMemo(() => {
    return userBehavior.map(item => ({
      date: item.date,
      page_views: item.page_views,
      events_viewed: item.events_viewed,
      bookings_made: item.bookings_made,
      messages_sent: item.messages_sent,
      time_spent: item.time_spent_minutes
    }))
  }, [userBehavior])

  return (
    <div className={className}>
      <Tabs defaultValue="engagement" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Event Engagement Over Time
                </CardTitle>
                <CardDescription>
                  Track views, RSVPs, and engagement scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={formatTooltipValue} />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke={chartColors.primary} 
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rsvps" 
                      stroke={chartColors.success} 
                      strokeWidth={2}
                      name="RSVPs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Score
                </CardTitle>
                <CardDescription>
                  Overall event engagement performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={formatTooltipValue} />
                    <Area 
                      type="monotone" 
                      dataKey="engagement_score" 
                      stroke={chartColors.accent} 
                      fill={chartColors.accent}
                      fillOpacity={0.3}
                      name="Engagement Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Analytics
                <Badge variant="secondary" className="ml-2">
                  ${revenueData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Revenue breakdown by events and venues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Bar 
                    dataKey="events" 
                    stackId="a" 
                    fill={chartColors.primary}
                    name="Events"
                  />
                  <Bar 
                    dataKey="venues" 
                    stackId="a" 
                    fill={chartColors.secondary}
                    name="Venues"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Category Distribution</CardTitle>
                <CardDescription>
                  Breakdown of events by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <Badge variant="secondary">12.5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Engagement</span>
                  <Badge variant="secondary">78.2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <Badge variant="secondary" className="text-green-600">+23%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User Retention</span>
                  <Badge variant="secondary">85.4%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity Timeline
              </CardTitle>
              <CardDescription>
                Track user interactions and engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Area 
                    type="monotone" 
                    dataKey="page_views" 
                    stackId="1"
                    stroke={chartColors.primary} 
                    fill={chartColors.primary}
                    fillOpacity={0.6}
                    name="Page Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="events_viewed" 
                    stackId="1"
                    stroke={chartColors.secondary} 
                    fill={chartColors.secondary}
                    fillOpacity={0.6}
                    name="Events Viewed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings_made" 
                    stackId="1"
                    stroke={chartColors.success} 
                    fill={chartColors.success}
                    fillOpacity={0.6}
                    name="Bookings Made"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}