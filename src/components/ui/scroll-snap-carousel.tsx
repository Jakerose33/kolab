import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ScrollSnapCarouselProps {
  children: React.ReactNode
  className?: string
  showIndicators?: boolean
  showNavigation?: boolean
  snapAlign?: "start" | "center" | "end"
  itemClassName?: string
}

const ScrollSnapCarousel = React.forwardRef<
  HTMLDivElement,
  ScrollSnapCarouselProps
>(({
  children,
  className,
  showIndicators = true,
  showNavigation = true,
  snapAlign = "start",
  itemClassName,
  ...props
}, ref) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  
  const childrenArray = React.Children.toArray(children)
  const itemCount = childrenArray.length

  const checkScrollability = React.useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  const updateCurrentIndex = React.useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollLeft, clientWidth } = container
    const itemWidth = clientWidth / Math.min(itemCount, 3) // Assuming max 3 visible items
    const index = Math.round(scrollLeft / itemWidth)
    setCurrentIndex(Math.min(index, itemCount - 1))
  }, [itemCount])

  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      checkScrollability()
      updateCurrentIndex()
    }

    const handleScrollEnd = () => {
      updateCurrentIndex()
    }

    container.addEventListener('scroll', handleScroll)
    container.addEventListener('scrollend', handleScrollEnd)
    
    // Check initial state
    checkScrollability()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('scrollend', handleScrollEnd)
    }
  }, [checkScrollability, updateCurrentIndex])

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    if (!container) return

    const { clientWidth } = container
    const itemWidth = clientWidth / Math.min(itemCount, 3)
    const scrollLeft = index * itemWidth

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }

  const scrollLeft = () => {
    const container = scrollRef.current
    if (!container) return

    const { clientWidth, scrollLeft: currentScroll } = container
    const scrollAmount = clientWidth * 0.8
    
    container.scrollTo({
      left: Math.max(0, currentScroll - scrollAmount),
      behavior: 'smooth'
    })
  }

  const scrollRight = () => {
    const container = scrollRef.current
    if (!container) return

    const { clientWidth, scrollLeft: currentScroll, scrollWidth } = container
    const scrollAmount = clientWidth * 0.8
    
    container.scrollTo({
      left: Math.min(scrollWidth - clientWidth, currentScroll + scrollAmount),
      behavior: 'smooth'
    })
  }

  return (
    <div ref={ref} className={cn("relative group", className)} {...props}>
      {/* Navigation buttons */}
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              !canScrollLeft && "opacity-0 pointer-events-none"
            )}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              !canScrollRight && "opacity-0 pointer-events-none"
            )}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Scrollable container with CSS scroll snap */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-hide",
          "scroll-smooth scroll-snap-x-mandatory",
          // Reduce motion for accessibility
          "motion-safe:scroll-smooth"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={cn(
              "flex-none scroll-snap-align-start",
              snapAlign === "center" && "scroll-snap-align-center",
              snapAlign === "end" && "scroll-snap-align-end",
              itemClassName
            )}
            style={{
              scrollSnapAlign: snapAlign
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Indicators */}
      {showIndicators && itemCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(itemCount, 5) }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 micro-spring",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
})

ScrollSnapCarousel.displayName = "ScrollSnapCarousel"

// CSS-only scroll snap component for pure performance
const PureScrollSnap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    snapAlign?: "start" | "center" | "end"
    direction?: "horizontal" | "vertical"
  }
>(({ className, snapAlign = "start", direction = "horizontal", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-auto scrollbar-hide",
        direction === "horizontal" 
          ? "flex scroll-snap-x-mandatory scroll-smooth" 
          : "scroll-snap-y-mandatory scroll-smooth",
        className
      )}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
      {...props}
    />
  )
})

PureScrollSnap.displayName = "PureScrollSnap"

const ScrollSnapItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    snapAlign?: "start" | "center" | "end"
  }
>(({ className, snapAlign = "start", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-none",
        snapAlign === "start" && "scroll-snap-align-start",
        snapAlign === "center" && "scroll-snap-align-center",
        snapAlign === "end" && "scroll-snap-align-end",
        className
      )}
      {...props}
    />
  )
})

ScrollSnapItem.displayName = "ScrollSnapItem"

export {
  ScrollSnapCarousel,
  PureScrollSnap,
  ScrollSnapItem
}