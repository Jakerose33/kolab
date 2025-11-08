import { Button } from '@/components/ui/button'
import { Share2, Facebook, Twitter, Link, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface SocialShareProps {
  title: string
  description?: string
  url?: string
  className?: string
}

export default function SocialShare({ 
  title, 
  description = '', 
  url = window.location.href,
  className = ''
}: SocialShareProps) {
  const { toast } = useToast()
  const [isSharing, setIsSharing] = useState(false)

  const shareData = {
    title,
    text: description,
    url
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true)
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          handleCopyLink()
        }
      } finally {
        setIsSharing(false)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank', 'width=555,height=555')
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=555,height=555')
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold">Share This Event</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Native Share (mobile) */}
        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            disabled={isSharing}
            className="flex-1 min-w-[120px]"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
        
        {/* Social platforms */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebookShare}
          className="flex-1 min-w-[120px]"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitterShare}
          className="flex-1 min-w-[120px]"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsAppShare}
          className="flex-1 min-w-[120px]"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex-1 min-w-[120px]"
        >
          <Link className="w-4 h-4 mr-2" />
          Copy Link
        </Button>
      </div>
    </div>
  )
}