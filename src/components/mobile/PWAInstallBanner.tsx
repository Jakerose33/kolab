import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor, Share } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallBanner() {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show banner after delay if supported but no prompt event
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && 'serviceWorker' in navigator) {
        setShowBanner(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [deferredPrompt, isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Manual installation instructions for iOS/other browsers
      showInstallInstructions()
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast({
          title: "App Installing",
          description: "Kolab is being added to your home screen!",
        })
        setShowBanner(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error installing PWA:', error)
      showInstallInstructions()
    }
  }

  const showInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    let instructions = ''
    if (isIOS && isSafari) {
      instructions = 'Tap the share button (⬆️) and select "Add to Home Screen"'
    } else if (/Chrome/.test(navigator.userAgent)) {
      instructions = 'Open Chrome menu (⋮) and select "Add to Home screen"'
    } else {
      instructions = 'Use your browser\'s menu to add this site to your home screen'
    }
    
    toast({
      title: "Install Kolab App",
      description: instructions,
      duration: 8000
    })
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showBanner || isInstalled) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold">Install Kolab App</h4>
            <p className="text-sm text-muted-foreground">
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>
            
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleInstall} className="flex items-center gap-2">
                <Download className="h-3 w-3" />
                Install App
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Features Preview */}
        <div className="mt-3 pt-3 border-t">
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span>Offline Access</span>
            </div>
            <div className="flex items-center gap-1">
              <Share className="h-3 w-3" />
              <span>Push Alerts</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>Fast Loading</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}