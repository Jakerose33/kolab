import { ErrorBoundary } from 'react-error-boundary'
import VenueMap from './VenueMap'

interface SafeVenueMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  venueName?: string
  className?: string
}

function VenueMapFallback({ error }: { error: Error }) {
  console.error('[SafeVenueMap] Map component error:', error)
  
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

export default function SafeVenueMap(props: SafeVenueMapProps) {
  return (
    <ErrorBoundary
      FallbackComponent={VenueMapFallback}
      onError={(error, errorInfo) => {
        console.error('[SafeVenueMap] Error boundary caught:', error, errorInfo)
      }}
    >
      <VenueMap {...props} />
    </ErrorBoundary>
  )
}