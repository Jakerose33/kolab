import { useState, useEffect } from 'react';
import { UserBlock, getUserBlocks, unblockUser } from '@/lib/moderation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ban, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function BlockedUsersManager() {
  const [blockedUsers, setBlockedUsers] = useState<UserBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserBlocks();
      if (error) throw error;
      setBlockedUsers(data);
    } catch (error) {
      console.error('Error loading blocked users:', error);
      toast({
        title: "Error",
        description: "Failed to load blocked users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    try {
      const { error } = await unblockUser(blockedUserId);
      if (error) throw error;

      setBlockedUsers(prev => prev.filter(block => block.blocked_id !== blockedUserId));
      toast({
        title: "User Unblocked",
        description: "You will now see content from this user again.",
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Blocked Users
        </CardTitle>
        <CardDescription>
          Manage users you have blocked. You can unblock them to see their content again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">You haven't blocked any users yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((block) => (
              <div key={block.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Blocked
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      {block.blocked_id}
                    </span>
                  </div>
                  {block.reason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {block.reason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Blocked {formatDistanceToNow(new Date(block.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(block.blocked_id)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}