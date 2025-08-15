import { TrendingUp, TrendingDown, Users, Eye, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  description?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  description,
  icon,
  trend = 'neutral',
  className
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50 border-green-200'
    if (trend === 'down') return 'text-red-600 bg-red-50 border-red-200'
    return 'text-muted-foreground bg-muted border-border'
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <Card className={cn("transition-colors hover:bg-muted/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        
        {(change !== undefined || description) && (
          <div className="flex items-center justify-between mt-2">
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn("text-xs", getTrendColor())}
                >
                  {getTrendIcon()}
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricsGridProps {
  metrics: Array<{
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    description?: string
    iconType?: 'users' | 'eye' | 'calendar' | 'dollar' | 'trending'
    trend?: 'up' | 'down' | 'neutral'
  }>
  className?: string
}

export function MetricsGrid({ metrics, className }: MetricsGridProps) {
  const getIcon = (type: string = '') => {
    switch (type) {
      case 'users':
        return <Users className="h-4 w-4" />
      case 'eye':
        return <Eye className="h-4 w-4" />
      case 'calendar':
        return <Calendar className="h-4 w-4" />
      case 'dollar':
        return <DollarSign className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeLabel={metric.changeLabel}
          description={metric.description}
          icon={getIcon(metric.iconType)}
          trend={metric.trend}
        />
      ))}
    </div>
  )
}