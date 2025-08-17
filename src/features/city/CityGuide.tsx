import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/OptimizedImage"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { cityGuidesData, neighbourhoods, getGuidesByNeighbourhood, type CityGuide } from "@/data/city-guides"

interface CityGuideProps {
  className?: string
}

const GuideCard = ({ guide }: { guide: CityGuide }) => (
  <Card className="group cursor-pointer overflow-hidden border border-border/50 bg-card hover:bg-card-hover transition-all duration-500 hover:scale-[1.02] hover:shadow-lg">
    <div className="aspect-[4/5] relative overflow-hidden">
      <OptimizedImage
        src={guide.image}
        alt={guide.imageAlt || guide.title}
        aspectRatio="4/5"
        className="filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
      
      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <Badge 
          variant="outline" 
          className="bg-white/10 text-white border-white/30 backdrop-blur-sm font-medium tracking-wide uppercase text-xs"
        >
          {guide.category}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="mb-2">
          <span className="text-white/60 text-xs uppercase tracking-wider font-medium">
            {guide.neighbourhood}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-2 tracking-tight">
          {guide.title}
        </h3>
        <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
          {guide.subtitle}
        </p>
        
        {/* Hover arrow */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-4 h-4 text-white/80" />
        </div>
      </div>
    </div>
  </Card>
)

export default function CityGuide({ className }: CityGuideProps) {
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState('All')
  
  const filteredGuides = getGuidesByNeighbourhood(selectedNeighbourhood)

  return (
    <section className={cn("py-16 bg-background-secondary venue-section", className)}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              City Guide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Curated by locals, for those who know where to look
            </p>
          </div>
          
          <Button variant="outline" className="self-start lg:self-end group">
            All guides
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Filter pills with scroll snap */}
        <div className="mb-8 lg:mb-12">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-snap-x-mandatory scroll-smooth">
            {neighbourhoods.map((neighbourhood) => (
              <Button
                key={neighbourhood}
                variant={selectedNeighbourhood === neighbourhood ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNeighbourhood(neighbourhood)}
                className={cn(
                  "whitespace-nowrap font-medium tracking-wide scroll-snap-align-start micro-spring",
                  "sticky top-0 z-10 backdrop-blur-sm flex-none",
                  selectedNeighbourhood === neighbourhood 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background/80 hover:bg-background"
                )}
              >
                {neighbourhood}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>

        {/* No results state */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No guides found for {selectedNeighbourhood}
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedNeighbourhood('All')}
              className="mt-4"
            >
              Show all guides
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}