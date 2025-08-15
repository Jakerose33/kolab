import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { collaborators } from "@/data/collaborators"

interface CollabsMarqueeProps {
  className?: string
}

export default function CollabsMarquee({ className }: CollabsMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion && marqueeRef.current) {
      // Pause animation for users who prefer reduced motion
      marqueeRef.current.style.animationPlayState = 'paused'
    }

    // Add hover event listeners for pause/play
    const marqueeElement = marqueeRef.current
    if (marqueeElement) {
      const handleMouseEnter = () => {
        marqueeElement.style.animationPlayState = 'paused'
      }
      const handleMouseLeave = () => {
        if (!prefersReducedMotion) {
          marqueeElement.style.animationPlayState = 'running'
        }
      }

      marqueeElement.addEventListener('mouseenter', handleMouseEnter)
      marqueeElement.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        marqueeElement.removeEventListener('mouseenter', handleMouseEnter)
        marqueeElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  // Duplicate the collaborators array to create seamless infinite scroll
  const duplicatedCollaborators = [...collaborators, ...collaborators]

  return (
    <section className={cn("py-16 overflow-hidden bg-muted/30", className)}>
      <div className="space-y-8">
        {/* Section header */}
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Collaborators
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Working with London's most influential venues, labels, and collectives
            </p>
          </div>
        </div>

        {/* Marquee rail */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div
            ref={marqueeRef}
            className={cn(
              "flex gap-8 items-center",
              "animate-marquee",
              "will-change-transform"
            )}
            style={{
              width: 'max-content',
            }}
          >
            {duplicatedCollaborators.map((collaborator, index) => (
              <div
                key={`${collaborator.id}-${index}`}
                className="flex-shrink-0 group"
              >
                <div className="w-32 h-16 flex items-center justify-center bg-background border border-border/50 rounded-lg transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-sm">
                  {/* Fallback for when SVG logos aren't available */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      {collaborator.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {collaborator.category}
                    </div>
                  </div>
                  
                  {/* This would be used when actual logos are available */}
                  {/* <img
                    src={collaborator.logo}
                    alt={collaborator.name}
                    className="h-8 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  /> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}