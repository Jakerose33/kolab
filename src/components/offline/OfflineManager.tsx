import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

interface OfflineAction {
  id: string
  actionType: string
  actionData: any
  timestamp: number
  status?: 'pending' | 'syncing' | 'completed' | 'failed'
  retryCount?: number
}

export function OfflineManager() {
  const { toast } = useToast()
  const { queuedActions: queue, processQueue: syncQueue, clearQueue } = useOfflineQueue()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncProgress, setSyncProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Connection Restored",
        description: "Syncing your offline actions...",
      })
      syncOfflineActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're Offline",
        description: "Don't worry! Your actions will be saved and synced when you're back online.",
        variant: "destructive"
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Auto-sync when coming back online
    if (isOnline && queue.length > 0) {
      syncOfflineActions()
    }
  }, [isOnline, queue.length])

  const syncOfflineActions = async () => {
    if (queue.length === 0) return

    setSyncProgress(0)
    let completed = 0

    for (const action of queue) {
      try {
        await syncAction(action)
        completed++
        setSyncProgress((completed / queue.length) * 100)
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    if (completed === queue.length) {
      toast({
        title: "All Actions Synced",
        description: "Your offline actions have been successfully synchronized.",
      })
      clearQueue()
    }
  }

  const syncAction = async (action: OfflineAction) => {
    // Simulate API call based on action type
    switch (action.action_type) {
      case 'create_event':
        // In production, this would call your actual API
        await new Promise(resolve => setTimeout(resolve, 1000))
        break
      case 'book_venue':
        await new Promise(resolve => setTimeout(resolve, 800))
        break
      case 'send_message':
        await new Promise(resolve => setTimeout(resolve, 500))
        break
      case 'update_profile':
        await new Promise(resolve => setTimeout(resolve, 600))
        break
      default:
        throw new Error(`Unknown action type: ${action.action_type}`)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create_event': return '📅'
      case 'book_venue': return '🏢'
      case 'send_message': return '💬'
      case 'update_profile': return '👤'
      default: return '📄'
    }
  }

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'create_event': return 'Create Event'
      case 'book_venue': return 'Book Venue'
      case 'send_message': return 'Send Message'
      case 'update_profile': return 'Update Profile'
      default: return 'Unknown Action'
    }
  }

  return (
    <>
      {/* Connection Status Indicator */}
      <Button
        variant={isOnline ? "ghost" : "destructive"}
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-20 z-40"
        aria-label={`Connection status: ${isOnline ? 'Online' : 'Offline'}`}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        {queue.length > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
            {queue.length}
          </Badge>
        )}
      </Button>

      {/* Offline Queue Panel */}
      {isVisible && (
        <Card className="fixed top-16 right-4 z-50 w-80 max-h-96 overflow-y-auto shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              {isOnline ? 'Online' : 'Offline Mode'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className={`p-3 rounded-lg ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">Connected to internet</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800">Working offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Sync Progress */}
            {syncProgress > 0 && syncProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Syncing actions...</span>
                  <span>{Math.round(syncProgress)}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            {/* Pending Actions */}
            {queue.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Pending Actions ({queue.length})</h4>
                  {isOnline && (
                    <Button size="sm" onClick={syncOfflineActions}>
                      <Upload className="h-3 w-3 mr-1" />
                      Sync All
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {queue.map((action) => (
                    <div key={action.id} className="flex items-center gap-3 p-2 rounded border">
                      <span className="text-lg">{getActionIcon(action.action_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{getActionLabel(action.action_type)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(action.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={
                        (action.status || 'pending') === 'pending' ? 'secondary' :
                        (action.status || 'pending') === 'syncing' ? 'default' :
                        (action.status || 'pending') === 'completed' ? 'default' : 'destructive'
                      }>
                        {(action.status || 'pending') === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {(action.status || 'pending') === 'syncing' && <Upload className="h-3 w-3 mr-1" />}
                        {(action.status || 'pending') === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {action.status || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending actions</p>
              </div>
            )}

            {/* Offline Features Info */}
            {!isOnline && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-1">Available Offline:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Browse cached events</li>
                  <li>• Create events (saved locally)</li>
                  <li>• View saved venues</li>
                  <li>• Access your profile</li>
                </ul>
              </div>
            )}

            {/* Clear Queue Option */}
            {queue.length > 0 && (
              <Button variant="outline" onClick={clearQueue} className="w-full">
                Clear All Pending Actions
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}