import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleManager } from "./RoleManager";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  MessageSquare,
  Eye,
  Activity,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAnalyticsMetrics, getEventAnalytics } from "@/lib/analytics";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [metricsResult, eventsResult] = await Promise.all([
        getAnalyticsMetrics(),
        getEventAnalytics(timeframe)
      ]);

      if (metricsResult.error) throw metricsResult.error;
      if (eventsResult.error) throw eventsResult.error;

      setMetrics(metricsResult.data || []);
      setEventData(eventsResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process metrics data
  const getMetricCards = (): MetricCard[] => {
    const latest = metrics.filter(m => m.date_recorded === new Date().toISOString().split('T')[0]);
    const previous = metrics.filter(m => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return m.date_recorded === yesterday.toISOString().split('T')[0];
    });

    const getMetricValue = (metricName: string, isLatest = true) => {
      const data = isLatest ? latest : previous;
      const metric = data.find(m => m.metric_name === metricName);
      return metric?.metric_value?.count || 0;
    };

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const signups = getMetricValue('daily_signups');
    const prevSignups = getMetricValue('daily_signups', false);
    
    const events = getMetricValue('daily_events_created');
    const prevEvents = getMetricValue('daily_events_created', false);
    
    const bookings = getMetricValue('daily_bookings');
    const prevBookings = getMetricValue('daily_bookings', false);
    
    const rsvps = getMetricValue('daily_rsvps');
    const prevRsvps = getMetricValue('daily_rsvps', false);

    return [
      {
        title: "New Users",
        value: signups.toString(),
        change: calculateChange(signups, prevSignups),
        icon: Users,
        trend: signups >= prevSignups ? 'up' : 'down'
      },
      {
        title: "Events Created",
        value: events.toString(),
        change: calculateChange(events, prevEvents),
        icon: Calendar,
        trend: events >= prevEvents ? 'up' : 'down'
      },
      {
        title: "Venue Bookings",
        value: bookings.toString(),
        change: calculateChange(bookings, prevBookings),
        icon: MapPin,
        trend: bookings >= prevBookings ? 'up' : 'down'
      },
      {
        title: "Event RSVPs",
        value: rsvps.toString(),
        change: calculateChange(rsvps, prevRsvps),
        icon: Activity,
        trend: rsvps >= prevRsvps ? 'up' : 'down'
      }
    ];
  };

  // Process event data for charts
  const getChartData = () => {
    const eventsByDay = eventData.reduce((acc, event) => {
      const date = new Date(event.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      if (!acc[date][event.event_name]) acc[date][event.event_name] = 0;
      acc[date][event.event_name]++;
      return acc;
    }, {});

    return Object.entries(eventsByDay).map(([date, events]: [string, any]) => ({
      date,
      ...events
    }));
  };

  const getTopEvents = () => {
    const eventCounts = eventData.reduce((acc, event) => {
      if (!acc[event.event_name]) acc[event.event_name] = 0;
      acc[event.event_name]++;
      return acc;
    }, {});

    return Object.entries(eventCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);
  };

  const metricCards = getMetricCards();
  const chartData = getChartData();
  const topEvents = getTopEvents();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform metrics and user engagement insights
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">7 Days</SelectItem>
              <SelectItem value="month">30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <IconComponent className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-center">
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">vs yesterday</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Event Activity</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>User interactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="page_view" 
                      stroke="#8884d8" 
                      name="Page Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="event_rsvp" 
                      stroke="#82ca9d" 
                      name="RSVPs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Events Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most common user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topEvents}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topEvents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Event creation and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="event_created" fill="#8884d8" name="Events Created" />
                  <Bar dataKey="event_viewed" fill="#82ca9d" name="Events Viewed" />
                  <Bar dataKey="event_rsvp" fill="#ffc658" name="RSVPs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Social features and platform usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="message_sent" fill="#8884d8" name="Messages Sent" />
                  <Bar dataKey="venue_booking_requested" fill="#82ca9d" name="Venue Bookings" />
                  <Bar dataKey="search_performed" fill="#ffc658" name="Searches" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}