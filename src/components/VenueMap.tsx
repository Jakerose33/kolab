import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface VenueMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  venueName?: string
  className?: string
}

export default function VenueMap({ 
  latitude, 
  longitude, 
  address, 
  venueName,
  className = "h-[300px] w-full rounded-lg border border-border overflow-hidden"
}: VenueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Default to Melbourne CBD if no coordinates
    const lat = latitude ?? -37.8136
    const lng = longitude ?? 144.9631
    const hasCoords = latitude !== null && longitude !== null

    // Initialize map
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], hasCoords ? 15 : 13)
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      mapInstanceRef.current = map
    } else {
      // Update existing map
      mapInstanceRef.current.setView([lat, lng], hasCoords ? 15 : 13)
    }

    // Add marker
    if (mapInstanceRef.current) {
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
            ${address || (hasCoords ? 'Venue location' : 'Default location (Melbourne CBD)')}
          </div>
        `
        marker.bindPopup(popupContent)
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
            console.warn('[VenueMap] Map container already removed from DOM')
          }
        } catch (error) {
          // Silently handle cleanup errors to prevent crashes
          console.warn('[VenueMap] Error during cleanup (safe to ignore):', error.message)
        } finally {
          mapInstanceRef.current = null
        }
      }
    }
  }, [latitude, longitude, address, venueName])

  return <div ref={mapRef} className={className} />
}