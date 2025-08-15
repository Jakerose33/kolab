import { useState } from 'react'
import { Save, Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { savedSearchService } from '@/lib/savedSearches'

interface SaveSearchDialogProps {
  query: string
  filters: Record<string, any>
  trigger?: React.ReactNode
  onSaved?: () => void
}

export function SaveSearchDialog({ query, filters, trigger, onSaved }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isAlert, setIsAlert] = useState(false)
  const [alertFrequency, setAlertFrequency] = useState('daily')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this search",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await savedSearchService.saveSearch({
        name: name.trim(),
        query,
        filters,
        is_alert: isAlert,
        alert_frequency: alertFrequency,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Search saved successfully",
      })

      setOpen(false)
      setName('')
      setIsAlert(false)
      setAlertFrequency('daily')
      onSaved?.()
    } catch (error) {
      console.error('Error saving search:', error)
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save this search to quickly access it later and optionally set up alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="e.g., Tech Events in SF"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-toggle">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new results match this search
                </p>
              </div>
              <Switch
                id="alert-toggle"
                checked={isAlert}
                onCheckedChange={setIsAlert}
              />
            </div>

            {isAlert && (
              <div className="space-y-2">
                <Label>Alert Frequency</Label>
                <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Search Preview</h4>
            <p className="text-sm text-muted-foreground">
              Query: "{query}"
            </p>
            {Object.keys(filters).length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {Object.keys(filters).length} filter(s) applied
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}