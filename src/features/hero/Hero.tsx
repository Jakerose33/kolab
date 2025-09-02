import { Button } from "@/components/ui/button"
import { Flame, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useViewTransition } from "@/hooks/useViewTransition"
const heroImage = "/lovable-uploads/06a2454d-1384-4786-ad03-7aa308f11152.png"

interface HeroProps {
  className?: string
}

export default function Hero({ className }: HeroProps) {
  const { navigateWithAnimation } = useViewTransition();

  const handleTonightClick = () => {
    navigateWithAnimation('/search?filter=today');
  };

  const handleExploreVenuesClick = () => {
    navigateWithAnimation('/venues');
  };

  return (
    <section className={cn(
      "relative min-h-[80vh] md:min-h-[90vh] overflow-hidden bg-black",
      className
    )}>
      {/* Background video/image container */}
      <div className="absolute inset-0">
        {/* Hero background image with scroll parallax */}
        <img 
          src={heroImage}
          alt="Underground electronic music scene"
          className="w-full h-full object-cover opacity-70 scroll-parallax"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 h-full min-h-[80vh] md:min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full items-center">
          {/* Left column - Text content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-2">
              <p className="kolab-accent-text text-white/70 mb-4">
                Your backstage pass
              </p>
              <h1 className="kolab-hero-text text-white leading-[0.85] tracking-tighter">
                Discover the city's{" "}
                <span className="block kolab-display-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text">
                  best-kept secrets
                </span>
              </h1>
            </div>
            
            <p className="kolab-body-large text-white/80 max-w-xl mx-auto lg:mx-0">
              Underground culture, exclusive events, and hidden venues await your discovery
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button 
                size="lg"
                onClick={handleTonightClick}
                className="kolab-button-primary bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 font-semibold px-10 py-4 h-auto text-base shadow-premium"
              >
                <Flame className="w-5 h-5 mr-2 text-red-500" />
                Tonight
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={handleExploreVenuesClick}
                className="kolab-glass border-white/20 bg-white/10 text-black hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-semibold px-10 py-4 h-auto text-base backdrop-blur-md"
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