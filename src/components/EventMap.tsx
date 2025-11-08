import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface EventMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  venueName?: string
  className?: string
}

export default function EventMap({ 
  latitude, 
  longitude, 
  address, 
  venueName,
  className = "space-y-4"
}: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const hasValidCoords = latitude !== null && longitude !== null && latitude !== undefined && longitude !== undefined

  useEffect(() => {
    if (!mapRef.current || !hasValidCoords) return

    const lat = latitude!
    const lng = longitude!

    // Initialize map with error handling
    if (!mapInstanceRef.current) {
      try {
        // Verify container still exists
        if (!mapRef.current.parentNode) {
          console.warn('[EventMap] Container removed before map initialization')
          return
        }

        const map = L.map(mapRef.current).setView([lat, lng], 15)
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        mapInstanceRef.current = map
      } catch (error) {
        console.error('[EventMap] Failed to initialize map:', error)
        return
      }
    } else {
      // Update existing map
      try {
        mapInstanceRef.current.setView([lat, lng], 15)
      } catch (error) {
        console.error('[EventMap] Failed to update map view:', error)
        return
      }
    }

    // Add marker with error handling
    if (mapInstanceRef.current) {
      try {
        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current?.removeLayer(layer)
          }
        })

        // Add new marker
        const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current)
        
        if (address || venueName) {
          const popupContent = `
            <div class="text-sm">
              ${venueName ? `<strong>${venueName}</strong><br>` : ''}
              ${address || 'Event venue location'}
            </div>
          `
          marker.bindPopup(popupContent)
        }
      } catch (error) {
        console.error('[EventMap] Failed to add marker:', error)
      }
    }

    // Safe cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          // Check if map container still exists in DOM
          const container = mapInstanceRef.current.getContainer()
          if (container && container.parentNode) {
            mapInstanceRef.current.remove()
          } else {
            // Container already removed, just clear the reference
            console.warn('[EventMap] Map container already removed from DOM')
          }
        } catch (error) {
          // Silently handle cleanup errors to prevent crashes
          console.warn('[EventMap] Error during cleanup (safe to ignore):', error.message)
        } finally {
          mapInstanceRef.current = null
        }
      }
    }
  }, [latitude, longitude, address, venueName, hasValidCoords])

  const handleDirections = () => {
    if (!hasValidCoords) return
    
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(googleMapsUrl, '_blank')
  }

  if (!hasValidCoords) {
    return (
      <div className={className}>
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Map not available - venue coordinates not provided
          </p>
          {address && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                window.open(searchUrl, '_blank')
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Search on Google Maps
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="h-[300px] w-full rounded-lg border border-border overflow-hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleDirections}
        className="w-full"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Get Directions
      </Button>
    </div>
  )
}