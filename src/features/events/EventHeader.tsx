import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventHeaderProps {
  title: string
  date: string
  time: string
  neighbourhood: string
  venue?: string
  capacity?: number
  going?: number
  className?: string
}

export default function EventHeader({
  title,
  date,
  time,
  neighbourhood,
  venue,
  capacity,
  going,
  className
}: EventHeaderProps) {
  return (
    <header className={cn("space-y-6", className)}>
      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarDays className="w-4 h-4" />
          <span className="uppercase tracking-wider font-medium">{date}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className="uppercase tracking-wider font-medium">{time}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="uppercase tracking-wider font-medium">{neighbourhood}</span>
        </div>

        {going && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="uppercase tracking-wider font-medium">{going} Going</span>
          </div>
        )}
      </div>

      {/* Main title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight">
        {title}
      </h1>

      {/* Venue information */}
      {venue && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-sm font-medium">
            {venue}
          </Badge>
          {capacity && (
            <p className="text-sm text-muted-foreground">
              Capacity: {capacity} people
            </p>
          )}
        </div>
      )}
    </header>
  )
}