import { useState, useEffect } from 'react'
import { Search, Bookmark, Clock, Trash2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  created_at: string
}

export function SavedSearches() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

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
        <EmptyState
          icon={Search}
          title="No saved searches"
          description="Save searches to quickly access them later."
        />
      </CardContent>
    </Card>
  )
}