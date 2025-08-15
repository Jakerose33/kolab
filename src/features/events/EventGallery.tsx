import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EventGalleryProps {
  images: string[]
  title: string
  className?: string
}

export default function EventGallery({ images, title, className }: EventGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!images || images.length === 0) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main featured image */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-black">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentImageIndex 
                      ? "bg-white" 
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-sm border-2 transition-all duration-200",
                index === currentImageIndex 
                  ? "border-primary scale-105" 
                  : "border-transparent hover:border-border hover:scale-102"
              )}
            >
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}