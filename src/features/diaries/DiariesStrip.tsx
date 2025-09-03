import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UnifiedImage } from "@/components/UnifiedImage"
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { diariesData, type DiaryEntry } from "@/data/diaries"

interface DiariesStripProps {
  className?: string
}

interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  currentIndex: number
  entries: DiaryEntry[]
  onNavigate: (direction: 'prev' | 'next') => void
}

const Lightbox = ({ isOpen, onClose, currentIndex, entries, onNavigate }: LightboxProps) => {
  const currentEntry = entries[currentIndex]
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        onNavigate('prev')
        break
      case 'ArrowRight':
        e.preventDefault()
        onNavigate('next')
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, onNavigate, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!currentEntry) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
            aria-label="Previous image"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
            aria-label="Next image"
            disabled={currentIndex === entries.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Main image */}
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={currentEntry.image}
              alt={currentEntry.caption || 'Diary entry'}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Caption overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs uppercase tracking-wider">
                  {currentEntry.timestamp}
                </Badge>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/80 text-sm">{currentEntry.location}</span>
              </div>
              
              {currentEntry.caption && (
                <p className="text-white text-lg font-medium mb-2">
                  {currentEntry.caption}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-white/60">
                {currentEntry.photographer && (
                  <div className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{currentEntry.photographer}</span>
                  </div>
                )}
                {currentEntry.event && (
                  <>
                    <span>•</span>
                    <span>{currentEntry.event}</span>
                  </>
                )}
              </div>
              
              {/* Navigation indicator */}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-white/40 text-xs">
                  {currentIndex + 1} of {entries.length}
                </span>
                <div className="flex gap-1">
                  {entries.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-1 h-1 rounded-full transition-colors",
                        index === currentIndex ? "bg-white" : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DiariesStrip({ className }: DiariesStripProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const recentDiaries = diariesData.slice(0, 12)

  const handleImageClick = (index: number) => {
    setSelectedIndex(index)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return
    
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else if (direction === 'next' && selectedIndex < recentDiaries.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const handleClose = () => {
    setSelectedIndex(null)
  }

  return (
    <>
      <section className={cn("py-16 bg-black performance-auto-large scroll-fade-up", className)}>
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Kolab Diaries
            </h2>
            <p className="text-white/60 text-lg max-w-2xl">
              Flash portraits from the underground — moments between moments
            </p>
          </div>

          {/* Contact sheet grid with scroll animation */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2 lg:gap-3 scroll-strip">
            {recentDiaries.map((entry, index) => (
              <div
                key={entry.id}
                className="group cursor-pointer aspect-square overflow-hidden bg-gray-900 hover:scale-105 transition-all duration-300 micro-bounce"
                onClick={() => handleImageClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleImageClick(index)
                  }
                }}
                aria-label={`Open diary entry: ${entry.caption || 'Untitled'}`}
              >
                <UnifiedImage
                  src={entry.image}
                  alt={entry.imageAlt || entry.caption || `Diary entry from ${entry.location}`}
                  aspectRatio="1/1"
                  className="filter contrast-125 saturate-0 group-hover:saturate-100 transition-all duration-500"
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 12.5vw, 8.33vw"
                  priority={false}
                />
                
                {/* Timestamp overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-1 left-1">
                    <span className="text-white text-xs font-mono uppercase tracking-wider">
                      {entry.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View all link */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-white/20 bg-white/10 text-black hover:bg-white/20 transition-all duration-300"
            >
              View all diaries
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={selectedIndex !== null}
        onClose={handleClose}
        currentIndex={selectedIndex || 0}
        entries={recentDiaries}
        onNavigate={handleNavigate}
      />
    </>
  )
}