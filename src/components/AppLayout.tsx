import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
}

export function AppLayout({ 
  children, 
  onOpenNotifications,
  onOpenSearch,
  onOpenAuth 
}: AppLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - hidden on mobile by default */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 md:h-16 items-center justify-between px-4">
              {/* Left side */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                {isMobile && (
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    KOLAB
                  </h1>
                )}
                {!isMobile && <SidebarTrigger />}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Search button for mobile */}
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onOpenSearch}
                    className="h-9 w-9"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}

                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onOpenNotifications}
                  className="h-9 w-9 relative"
                >
                  <Bell className="h-4 w-4" />
                  <div className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>

                {/* User Avatar */}
                {user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onOpenAuth}
                    className="h-8 px-3 text-xs"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}