import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export function PushNotificationManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window
      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
        checkSubscription()
        
        // Show prompt if not dismissed and permission is default
        if (Notification.permission === 'default' && 
            !localStorage.getItem('push-prompt-dismissed') && 
            user) {
          setTimeout(() => setShowPrompt(true), 5000)
        }
      }
    }

    checkSupport()
  }, [user])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermission = async () => {
    if (!isSupported) return false

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        await subscribeToNotifications()
        return true
      } else {
        toast({
          title: "Notifications blocked",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      })
      return false
    }
  }

  const subscribeToNotifications = async () => {
    if (!user || permission !== 'granted') return

    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Generate VAPID key (in production, this should be from your server)
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual key
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Save subscription to backend
      await supabase.functions.invoke('save-push-subscription', {
        body: {
          user_id: user.id,
          subscription: subscription.toJSON()
        }
      })

      setIsSubscribed(true)
      toast({
        title: "Notifications enabled!",
        description: "You'll now receive push notifications for important updates.",
      })
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      toast({
        title: "Subscription failed",
        description: "Unable to enable push notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromNotifications = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Remove subscription from backend
        if (user) {
          await supabase.functions.invoke('remove-push-subscription', {
            body: { user_id: user.id }
          })
        }
      }
      
      setIsSubscribed(false)
      toast({
        title: "Notifications disabled",
        description: "You'll no longer receive push notifications.",
      })
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast({
        title: "Error",
        description: "Failed to disable notifications.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      if (permission === 'granted') {
        await subscribeToNotifications()
      } else {
        const granted = await requestPermission()
        if (!granted) return
      }
    } else {
      await unsubscribeFromNotifications()
    }
  }

  const handleDismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('push-prompt-dismissed', 'true')
  }

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Test from Kolab', {
        body: 'Push notifications are working correctly!',
        icon: '/lovable-uploads/2c93db7f-d994-4dea-81df-8944d43e9b56.png',
        badge: '/favicon.ico'
      })
    }
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in your browser.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prompt for enabling notifications
  if (showPrompt && permission === 'default' && user) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Enable Notifications
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissPrompt}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stay updated with real-time notifications for booking confirmations, event reminders, and messages.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => requestPermission()}
              disabled={loading}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
            <Button variant="outline" onClick={handleDismissPrompt}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Settings panel
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
          {permission === 'granted' && (
            <Badge variant="secondary" className="text-xs">
              {isSubscribed ? 'Active' : 'Available'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-normal">
              Push notifications
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications for important updates
            </p>
          </div>
          <Switch
            checked={isSubscribed && permission === 'granted'}
            onCheckedChange={handleToggle}
            disabled={loading || permission === 'denied'}
          />
        </div>
        
        {permission === 'denied' && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Notifications blocked</p>
            <p className="text-xs">To enable notifications, go to your browser settings and allow notifications for this site.</p>
          </div>
        )}
        
        {permission === 'granted' && isSubscribed && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testNotification}
            >
              Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}