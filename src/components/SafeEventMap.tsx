import { ErrorBoundary } from 'react-error-boundary'
import EventMap from './EventMap'

interface SafeEventMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  venueName?: string
  className?: string
}

function EventMapFallback({ error }: { error: Error }) {
  console.error('[SafeEventMap] Map component error:', error)
  
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          Map temporarily unavailable
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Location services will be restored shortly
        </p>
      </div>
    </div>
  )
}

export default function SafeEventMap(props: SafeEventMapProps) {
  return (
    <ErrorBoundary
      FallbackComponent={EventMapFallback}
      onError={(error, errorInfo) => {
        console.error('[SafeEventMap] Error boundary caught:', error, errorInfo)
      }}
    >
      <EventMap {...props} />
    </ErrorBoundary>
  )
}