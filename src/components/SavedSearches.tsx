import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bookmark, Clock, Trash2, Star, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '@/features/auth/AuthProvider'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { useToast } from '@/hooks/use-toast'
import { savedSearchService, type SavedSearch } from '@/lib/savedSearches'
import { formatDistanceToNow } from 'date-fns'

export function SavedSearches() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadSavedSearches()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadSavedSearches = async () => {
    setLoading(true)
    try {
      const { data, error } = await savedSearchService.getSavedSearches()
      if (error) throw error
      setSavedSearches(data)
    } catch (error) {
      console.error('Error loading saved searches:', error)
      toast({
        title: "Error",
        description: "Failed to load saved searches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteSavedSearch = async (searchId: string) => {
    try {
      const { error } = await savedSearchService.deleteSavedSearch(searchId)
      if (error) throw error
      
      setSavedSearches(prev => prev.filter(s => s.id !== searchId))
      toast({
        title: "Success",
        description: "Saved search deleted",
      })
    } catch (error) {
      console.error('Error deleting saved search:', error)
      toast({
        title: "Error", 
        description: "Failed to delete saved search",
        variant: "destructive",
      })
    }
  }

  const executeSavedSearch = async (search: SavedSearch) => {
    try {
      const { data, error } = await savedSearchService.executeSavedSearch(search.id)
      if (error) throw error
      
      // Navigate to search page with results
      navigate(`/search?q=${encodeURIComponent(search.query)}`)
    } catch (error) {
      console.error('Error executing saved search:', error)
      toast({
        title: "Error",
        description: "Failed to execute search",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Bookmark}
            title="Sign in to save searches"
            description="Create an account to save and manage your favorite searches."
          />
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Searches
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
          <Bookmark className="h-5 w-5" />
          Saved Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {savedSearches.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No saved searches"
            description="Save searches to quickly access them later."
          />
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{search.name}</h4>
                    {search.is_alert && (
                      <Badge variant="secondary" className="text-xs">
                        Alert
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    "{search.query}"
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Saved {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeSavedSearch(search)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSavedSearch(search.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}