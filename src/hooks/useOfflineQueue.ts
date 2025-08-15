import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OfflineAction {
  id: string
  action_type: string
  action_data: any
  created_at: string
  retry_count: number
}

export function useOfflineQueue() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queuedActions, setQueuedActions] = useState<OfflineAction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (queuedActions.length > 0) {
        processQueue()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "Your actions will be saved and synced when you're back online.",
        variant: "destructive",
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queuedActions.length, toast])

  // Load queued actions on mount
  useEffect(() => {
    if (user) {
      loadQueuedActions()
    }
  }, [user])

  const loadQueuedActions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('offline_queue')
        .select('*')
        .eq('user_id', user.id)
        .is('processed_at', null)
        .order('created_at', { ascending: true })

      if (error) throw error
      setQueuedActions(data || [])
    } catch (error) {
      console.error('Error loading queued actions:', error)
    }
  }

  const queueAction = async (actionType: string, actionData: any) => {
    if (!user) return false

    const action = {
      id: `temp_${Date.now()}`,
      action_type: actionType,
      action_data: actionData,
      created_at: new Date().toISOString(),
      retry_count: 0
    }

    // Add to local queue
    setQueuedActions(prev => [...prev, action])

    if (isOnline) {
      // Try to process immediately if online
      return await processAction(action)
    } else {
      // Save to local storage for persistence
      const localQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]')
      localQueue.push(action)
      localStorage.setItem('offline_queue', JSON.stringify(localQueue))

      toast({
        title: "Action queued",
        description: "This action will be processed when you're back online.",
      })
      return true
    }
  }

  const processAction = async (action: OfflineAction): Promise<boolean> => {
    if (!user) return false

    try {
      // Save to database queue
      const { error: queueError } = await supabase
        .from('offline_queue')
        .insert({
          user_id: user.id,
          action_type: action.action_type,
          action_data: action.action_data
        })

      if (queueError) throw queueError

      // Process the action using the database function
      const { data, error } = await supabase.rpc('process_offline_action', {
        p_user_id: user.id,
        p_action_type: action.action_type,
        p_action_data: action.action_data
      })

      if (error) throw error

      if (data) {
        // Mark as processed in queue
        await supabase
          .from('offline_queue')
          .update({ processed_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('action_type', action.action_type)
          .eq('action_data', action.action_data)

        // Remove from local queue
        setQueuedActions(prev => prev.filter(a => a.id !== action.id))
        
        return true
      } else {
        throw new Error('Action processing failed')
      }
    } catch (error) {
      console.error('Error processing action:', error)
      
      // Increment retry count
      const updatedAction = { 
        ...action, 
        retry_count: action.retry_count + 1 
      }

      if (updatedAction.retry_count < 3) {
        setQueuedActions(prev => 
          prev.map(a => a.id === action.id ? updatedAction : a)
        )
      } else {
        // Remove failed action after max retries
        setQueuedActions(prev => prev.filter(a => a.id !== action.id))
        toast({
          title: "Action failed",
          description: "An action couldn't be processed after multiple attempts.",
          variant: "destructive",
        })
      }
      
      return false
    }
  }

  const processQueue = async () => {
    if (isProcessing || !isOnline || queuedActions.length === 0) return

    setIsProcessing(true)
    
    try {
      // Load any actions from local storage
      const localQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]')
      if (localQueue.length > 0) {
        setQueuedActions(prev => [...prev, ...localQueue])
        localStorage.removeItem('offline_queue')
      }

      // Process actions one by one
      const actionsToProcess = [...queuedActions]
      let processedCount = 0

      for (const action of actionsToProcess) {
        const success = await processAction(action)
        if (success) {
          processedCount++
        }
      }

      if (processedCount > 0) {
        toast({
          title: "Actions synced",
          description: `${processedCount} offline actions have been processed.`,
        })
      }
    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearQueue = () => {
    setQueuedActions([])
    localStorage.removeItem('offline_queue')
  }

  // Helper functions for common offline actions
  const queueRSVP = (eventId: string, status: 'going' | 'interested') => {
    return queueAction('create_event_rsvp', { event_id: eventId, status })
  }

  const queueVenueBooking = (venueId: string, bookingData: any) => {
    return queueAction('create_venue_booking', { venue_id: venueId, ...bookingData })
  }

  const queueMessage = (recipientId: string, content: string, messageType = 'text') => {
    return queueAction('send_message', { 
      recipient_id: recipientId, 
      content, 
      message_type: messageType 
    })
  }

  return {
    isOnline,
    queuedActions,
    isProcessing,
    queueAction,
    processQueue,
    clearQueue,
    queueRSVP,
    queueVenueBooking,
    queueMessage
  }
}