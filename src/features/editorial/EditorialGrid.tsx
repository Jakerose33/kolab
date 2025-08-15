import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Eye, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { editorialData, type EditorialItem } from "@/data/editorial"

interface EditorialGridProps {
  className?: string
}

const EventCard = ({ item }: { item: EditorialItem }) => (
  <Card className="group cursor-pointer overflow-hidden border-0 bg-card hover:bg-card-hover transition-all duration-300 hover:scale-[1.02]">
    <div className="aspect-[4/5] relative overflow-hidden">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {/* Event details overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <span className="text-white/80">{item.date}</span>
          <span className="text-white/60">•</span>
          <span className="text-white/80">{item.time}</span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
        <p className="text-white/70 text-sm mb-3">{item.neighbourhood}</p>
        
        {/* RSVP chips */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30">
            <Flame className="w-3 h-3 mr-1" />
            {item.going} Going
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
            <Eye className="w-3 h-3 mr-1" />
            {item.interested} Interested
          </Badge>
        </div>
      </div>
    </div>
  </Card>
)

const CityGuideCard = ({ item }: { item: EditorialItem }) => (
  <Card className="group cursor-pointer overflow-hidden border border-border/50 bg-card hover:bg-card-hover transition-all duration-300 hover:scale-[1.02]">
    <div className="aspect-[4/5] relative overflow-hidden">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      <div className="absolute top-4 left-4">
        <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
          {item.tag}
        </Badge>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
        <p className="text-white/70 text-sm line-clamp-2">{item.subtitle}</p>
      </div>
    </div>
  </Card>
)

const StoryCard = ({ item }: { item: EditorialItem }) => (
  <Card className="group cursor-pointer overflow-hidden border-0 bg-card hover:bg-card-hover transition-all duration-300 hover:scale-[1.02]">
    <div className="aspect-[4/5] relative overflow-hidden">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      <div className="absolute top-4 left-4">
        <Badge variant="outline" className="bg-black/50 text-white border-white/30 backdrop-blur-sm">
          {item.tag}
        </Badge>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-white/80 text-sm mb-3 line-clamp-2">{item.subtitle}</p>
        <p className="text-white/60 text-xs line-clamp-2">{item.description}</p>
      </div>
    </div>
  </Card>
)

export default function EditorialGrid({ className }: EditorialGridProps) {
  const [activeTab, setActiveTab] = useState<'tonight' | 'week'>('tonight')
  
  const tonightItems = editorialData.filter(item => 
    item.type === 'event' && item.date === 'Tonight'
  )
  
  const weekItems = editorialData.filter(item => 
    item.type === 'event' || item.type === 'city-guide' || item.type === 'story'
  )

  const displayItems = activeTab === 'tonight' ? tonightItems : weekItems.slice(0, 9)

  const renderCard = (item: EditorialItem) => {
    switch (item.type) {
      case 'event':
        return <EventCard key={item.id} item={item} />
      case 'city-guide':
        return <CityGuideCard key={item.id} item={item} />
      case 'story':
        return <StoryCard key={item.id} item={item} />
      default:
        return null
    }
  }

  return (
    <section className={cn("py-16 bg-background", className)}>
      <div className="container mx-auto px-4">
        {/* Section header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-6 sm:mb-0">
            <div className="flex gap-1 mb-4">
              <Button
                variant={activeTab === 'tonight' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('tonight')}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold h-auto p-0 bg-transparent hover:bg-transparent text-foreground hover:text-primary"
              >
                Tonight
              </Button>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-muted-foreground mx-2">/</span>
              <Button
                variant={activeTab === 'week' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('week')}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold h-auto p-0 bg-transparent hover:bg-transparent text-foreground hover:text-primary"
              >
                This week
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className="self-start sm:self-center group">
            View all
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayItems.map(renderCard)}
        </div>
      </div>
    </section>
  )
}