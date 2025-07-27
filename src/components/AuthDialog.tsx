import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signUp, signIn } from "@/lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (type: 'login' | 'signup', event: React.FormEvent) => {
    setIsLoading(true);
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;

      if (type === 'signup') {
        const { data, error } = await signUp(email, password, { full_name: name });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Check your email to verify your account.",
        });
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Kolab</DialogTitle>
          <DialogDescription>
            Join the collaborative community and start creating amazing experiences together.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); handleAuth('signup', e); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input name="name" id="signup-name" placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input name="email" id="signup-email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input name="password" id="signup-password" type="password" placeholder="Create a password" required />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); handleAuth('login', e); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input name="email" id="login-email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input name="password" id="login-password" type="password" placeholder="Enter your password" required />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}