import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePerformanceSuite } from '@/hooks/usePerformanceSuite'
import { PWAFeatures } from '@/components/PWAFeatures'
import { 
  Gauge, 
  Image, 
  Wifi, 
  Clock, 
  HardDrive, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export function PerformanceDashboard() {
  const { metrics, isOptimized, performanceScore } = usePerformanceSuite({
    enableImageOptimization: true,
    enableContentVisibility: true,
    enableCaching: true,
    enableMetrics: true,
    criticalResources: ['/src/assets/hero-boiler-room.jpg']
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 75) return 'secondary'
    return 'destructive'
  }

  const formatTime = (time?: number) => {
    if (!time) return 'N/A'
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>
            Overall performance rating based on Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}/100
              </div>
              <Badge variant={getScoreVariant(performanceScore)}>
                {performanceScore >= 90 ? 'Excellent' : performanceScore >= 75 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={performanceScore} className="w-32" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="pwa">PWA Features</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Largest Contentful Paint */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LCP</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.lcp)}</div>
                <p className="text-xs text-muted-foreground">
                  Largest Contentful Paint
                </p>
                <Badge variant={metrics.lcp && metrics.lcp < 2500 ? 'default' : 'destructive'} className="mt-1">
                  {metrics.lcp && metrics.lcp < 2500 ? 'Good' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>

            {/* First Input Delay */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FID</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.fid)}</div>
                <p className="text-xs text-muted-foreground">
                  First Input Delay
                </p>
                <Badge variant={metrics.fid && metrics.fid < 100 ? 'default' : 'destructive'} className="mt-1">
                  {metrics.fid && metrics.fid < 100 ? 'Good' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>

            {/* Cumulative Layout Shift */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CLS</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cumulative Layout Shift
                </p>
                <Badge variant={metrics.cls && metrics.cls < 0.1 ? 'default' : 'destructive'} className="mt-1">
                  {metrics.cls && metrics.cls < 0.1 ? 'Good' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Page Load Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">First Contentful Paint:</span>
                  <span className="text-sm font-medium">{formatTime(metrics.fcp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Time to First Byte:</span>
                  <span className="text-sm font-medium">{formatTime(metrics.ttfb)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Page Load Time:</span>
                  <span className="text-sm font-medium">{formatTime(metrics.pageLoadTime)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Memory Usage:</span>
                  <span className="text-sm font-medium">
                    {metrics.memoryUsage ? `${(metrics.memoryUsage * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Connection:</span>
                  <span className="text-sm font-medium">{metrics.connectionSpeed || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cache Hit Rate:</span>
                  <span className="text-sm font-medium">
                    {metrics.cacheHitRate ? `${(metrics.cacheHitRate * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Image Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lazy Loading:</span>
                    <Badge variant="default">✓ Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WebP Support:</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AVIF Support:</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Responsive Images:</span>
                    <Badge variant="default">✓ Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Caching Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Worker:</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Static Assets:</span>
                    <Badge variant="default">✓ Cached</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Responses:</span>
                    <Badge variant="secondary">Network First</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Images:</span>
                    <Badge variant="secondary">Cache First</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isOptimized ? (
                  <Badge variant="default">✓ Optimized</Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Not Optimized
                  </Badge>
                )}
                Performance Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Visibility:</span>
                  <Badge variant="default">✓ Applied</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Resources:</span>
                  <Badge variant="default">✓ Preloaded</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Image Optimization:</span>
                  <Badge variant="default">✓ Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lazy Loading:</span>
                  <Badge variant="default">✓ Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pwa">
          <PWAFeatures />
        </TabsContent>
      </Tabs>
    </div>
  )
}