import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { z } from "zod";

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Password must contain at least one letter and one number"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters long")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user, loading, signUp, signIn } = useAuth();

  // Redirect if already authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (type: 'login' | 'signup', event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        ...(type === 'signup' && {
          confirmPassword: formData.get('confirmPassword') as string,
          name: formData.get('name') as string
        })
      };

      // Validate form data
      const schema = type === 'signup' ? signUpSchema : signInSchema;
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFormErrors(errors);
        return;
      }

      if (type === 'signup') {
        const { error } = await signUp(data.email, data.password, data.name);
        if (error) throw error;
        toast({
          title: "Account created",
          description: "Please check your email to verify your account"
        });
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) throw error;
      }
    } catch (error: any) {
      console.error(`${type} error:`, error);
      
      // Handle specific error codes
      let errorMessage = error.message || "An error occurred";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the verification link.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Try signing in instead.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to Kolab
          </CardTitle>
          <CardDescription>
            Join the collaborative community and start creating amazing experiences together.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    name="name" 
                    id="signup-name" 
                    placeholder="Enter your full name" 
                    required 
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    name="email" 
                    id="signup-email" 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input 
                      name="password" 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password" 
                      required 
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with letters and numbers
                  </p>
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input 
                    name="confirmPassword" 
                    id="signup-confirm-password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password" 
                    required 
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                  )}
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleAuth('login', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    name="email" 
                    id="login-email" 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input 
                      name="password" 
                      id="login-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    asChild 
                    className="text-sm text-muted-foreground"
                  >
                    <Link to="/auth/forgot-password">
                      Forgot your password?
                    </Link>
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}