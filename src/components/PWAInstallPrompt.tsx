import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useToast } from '@/hooks/use-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if app is already installed or running in standalone mode
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsStandalone(isStandaloneMode || isIOSStandalone)
      
      // Don't show prompt if already in standalone mode
      if (isStandaloneMode || isIOSStandalone) {
        setIsInstalled(true)
        return
      }
    }

    checkInstallStatus()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      
      // Show the prompt after a delay (to not be too intrusive)
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      toast({
        title: "App installed!",
        description: "Kolab has been added to your home screen.",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        toast({
          title: "Installing...",
          description: "Kolab is being added to your device.",
        })
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
      toast({
        title: "Installation failed",
        description: "There was an error installing the app. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    
    if (isIOS) {
      return {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Install on iOS",
        steps: [
          "Tap the Share button in Safari",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to install Kolab"
        ]
      }
    } else if (isAndroid) {
      return {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Install on Android",
        steps: [
          "Tap the menu button (three dots)",
          "Select 'Add to Home screen'",
          "Tap 'Add' to install Kolab"
        ]
      }
    } else {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: "Install on Desktop",
        steps: [
          "Click the install button in your browser's address bar",
          "Or use the install button below",
          "Follow your browser's installation prompts"
        ]
      }
    }
  }

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showPrompt) return null

  const instructions = getInstallInstructions()

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md border-primary/20 bg-card/95 backdrop-blur-sm md:left-auto md:right-4 md:mx-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            Install Kolab
            <Badge variant="secondary" className="text-xs">
              PWA
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get the full Kolab experience with offline access, push notifications, and faster loading.
        </p>
        
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            {instructions.icon}
            {instructions.title}
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-2">
          {deferredPrompt && (
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
          )}
          <Button variant="outline" onClick={handleDismiss}>
            Maybe Later
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Benefits:</strong> Offline access, push notifications, faster loading, home screen shortcut
        </div>
      </CardContent>
    </Card>
  )
}