import { Button } from "@/components/ui/button"
import { Flame, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroProps {
  className?: string
}

export default function Hero({ className }: HeroProps) {
  return (
    <section className={cn(
      "relative min-h-[80vh] md:min-h-[90vh] overflow-hidden bg-black",
      className
    )}>
      {/* Background video/image container */}
      <div className="absolute inset-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Video element - muted autoplay */}
        <video
          className="w-full h-full object-cover opacity-60 md:opacity-40"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-fallback.jpg"
        >
          <source src="/media/hero-teaser.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img 
            src="/media/hero-fallback.jpg" 
            alt="Discover underground culture"
            className="w-full h-full object-cover"
          />
        </video>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 h-full min-h-[80vh] md:min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full items-center">
          {/* Left column - Text content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[0.9] tracking-tight">
              Discover the city's{" "}
              <span className="block text-white/90">
                best-kept secrets
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Underground culture, exclusive events, and hidden venues await
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold px-8 py-4 h-auto text-base"
              >
                <Flame className="w-5 h-5 mr-2 text-red-500" />
                Tonight
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 transition-all duration-300 font-semibold px-8 py-4 h-auto text-base backdrop-blur-sm"
              >
                <Eye className="w-5 h-5 mr-2" />
                Explore venues
              </Button>
            </div>
          </div>

          {/* Right column - On larger screens, video extends here */}
          <div className="hidden lg:block">
            {/* This space allows the video to breathe on larger screens */}
          </div>
        </div>
      </div>

      {/* Bottom fade for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}