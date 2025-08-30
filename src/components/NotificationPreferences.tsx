import { useState, useEffect } from 'react'
import { Settings, Mail, Bell, MessageSquare, Calendar, Users, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { LoadingState } from './LoadingState'

interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  booking_confirmations: boolean
  event_reminders: boolean
  new_messages: boolean
  event_updates: boolean
  moderation_updates: boolean
}

export function NotificationPreferences() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    booking_confirmations: true,
    event_reminders: true,
    new_messages: true,
    event_updates: true,
    moderation_updates: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // Not found error
          throw error
        }

        if (data) {
          setPreferences({
            email_enabled: data.email_enabled,
            push_enabled: data.push_enabled,
            booking_confirmations: data.booking_confirmations,
            event_reminders: data.event_reminders,
            new_messages: data.new_messages,
            event_updates: data.event_updates,
            moderation_updates: data.moderation_updates,
          })
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error)
        toast({
          title: "Error",
          description: "Failed to load notification preferences.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user, toast])

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return

    setSaving(true)
    try {
      const newPreferences = { ...preferences, ...updates }
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
        })

      if (error) throw error

      setPreferences(newPreferences)
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreferences) => {
    updatePreferences({ [key]: !preferences[key] })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            General Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-sm font-normal">
                  Email notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.email_enabled}
                onCheckedChange={() => handleToggle('email_enabled')}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled" className="text-sm font-normal">
                  Push notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive in-app notifications
                </p>
              </div>
              <Switch
                id="push-enabled"
                checked={preferences.push_enabled}
                onCheckedChange={() => handleToggle('push_enabled')}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Event & Booking Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events & Bookings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-confirmations" className="text-sm font-normal">
                  Booking confirmations
                </Label>
                <p className="text-xs text-muted-foreground">
                  When your venue bookings are confirmed or updated
                </p>
              </div>
              <Switch
                id="booking-confirmations"
                checked={preferences.booking_confirmations}
                onCheckedChange={() => handleToggle('booking_confirmations')}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-reminders" className="text-sm font-normal">
                  Event reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reminders for events you're attending
                </p>
              </div>
              <Switch
                id="event-reminders"
                checked={preferences.event_reminders}
                onCheckedChange={() => handleToggle('event_reminders')}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-updates" className="text-sm font-normal">
                  Event updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  When events you're attending are updated
                </p>
              </div>
              <Switch
                id="event-updates"
                checked={preferences.event_updates}
                onCheckedChange={() => handleToggle('event_updates')}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Communication */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-messages" className="text-sm font-normal">
                  New messages
                </Label>
                <p className="text-xs text-muted-foreground">
                  When you receive new direct messages
                </p>
              </div>
              <Switch
                id="new-messages"
                checked={preferences.new_messages}
                onCheckedChange={() => handleToggle('new_messages')}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Moderation */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Moderation
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="moderation-updates" className="text-sm font-normal">
                  Moderation updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Updates about content reports and moderation actions
                </p>
              </div>
              <Switch
                id="moderation-updates"
                checked={preferences.moderation_updates}
                onCheckedChange={() => handleToggle('moderation_updates')}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {saving && (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Saving preferences...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}