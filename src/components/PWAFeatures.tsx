import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Share, 
  Bell,
  Settings
} from 'lucide-react'

export function PWAFeatures() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission)

  useEffect(() => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://')
    setIsInstalled(isStandalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
      toast.success('App installed successfully!')
    }

    // Online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('Installation started...')
      } else {
        toast.info('Installation cancelled')
      }
    } catch (error) {
      toast.error('Installation failed')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kolab - Underground Culture',
          text: 'Discover underground events and hidden venues',
          url: window.location.origin
        })
        toast.success('Shared successfully!')
      } catch (error) {
        toast.error('Sharing failed')
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!')
        
        // Show welcome notification
        new Notification('Welcome to Kolab!', {
          body: 'You\'ll now receive updates about new events and venues',
          icon: '/lovable-uploads/2c93db7f-d994-4dea-81df-8944d43e9b56.png',
          badge: '/lovable-uploads/2c93db7f-d994-4dea-81df-8944d43e9b56.png'
        })
      } else {
        toast.error('Notifications blocked')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            Connection Status
          </CardTitle>
          <CardDescription>
            Your app works offline and syncs when you're back online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </CardContent>
      </Card>

      {/* Installation */}
      {!isInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install App
            </CardTitle>
            <CardDescription>
              Install Kolab on your device for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleInstall} 
              disabled={!canInstall}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share App
          </CardTitle>
          <CardDescription>
            Share Kolab with friends who love underground culture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Get notified about new events and venues in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification Status:</span>
            <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
              {notificationPermission}
            </Badge>
          </div>
          {notificationPermission !== 'granted' && (
            <Button onClick={requestNotifications} variant="outline" className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PWA Features
          </CardTitle>
          <CardDescription>
            Enhanced features available in the installed app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Offline Access</span>
              <Badge variant="default">✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                {notificationPermission === 'granted' ? '✓' : '○'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Background Sync</span>
              <Badge variant="default">✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Native Sharing</span>
              <Badge variant={navigator.share ? 'default' : 'secondary'}>
                {navigator.share ? '✓' : '○'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Installed</span>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? '✓' : '○'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}