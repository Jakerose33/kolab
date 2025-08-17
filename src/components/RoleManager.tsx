import { useState } from 'react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus } from 'lucide-react';

export function RoleManager() {
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const { isAdmin, assignRole, removeRole } = useUserRoles();
  const { toast } = useToast();

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAssignRole = async () => {
    if (!targetUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    const result = await assignRole(targetUserId.trim(), selectedRole);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${selectedRole} role assigned successfully`
      });
      setTargetUserId('');
    } else {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async () => {
    if (!targetUserId.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    const result = await removeRole(targetUserId.trim(), selectedRole);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${selectedRole} role removed successfully`
      });
      setTargetUserId('');
    } else {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Role Management
        </CardTitle>
        <CardDescription>
          Assign or remove user roles. Only admins can manage roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter User ID"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
          </div>
          <Select value={selectedRole} onValueChange={(value: AppRole) => setSelectedRole(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                <Badge variant={getRoleBadgeVariant('user')}>User</Badge>
              </SelectItem>
              <SelectItem value="moderator">
                <Badge variant={getRoleBadgeVariant('moderator')}>Moderator</Badge>
              </SelectItem>
              <SelectItem value="admin">
                <Badge variant={getRoleBadgeVariant('admin')}>Admin</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleAssignRole} className="flex-1">
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
          <Button onClick={handleRemoveRole} variant="destructive" className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Role
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> User IDs can be found in the user profiles or authentication logs.</p>
          <p>Be careful when assigning admin roles as they have full system access.</p>
        </div>
      </CardContent>
    </Card>
  );
}