import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Search, 
  Menu, 
  Plus,
  Settings,
  User,
  MapPin,
  Users,
  Briefcase,
  BookOpen,
  LogOut
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthDialog } from "@/components/AuthDialog";

interface KolabHeaderProps {
  onCreateEvent: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
}

export function KolabHeader({ onCreateEvent, onOpenMessages, onOpenNotifications }: KolabHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, isAuthenticated } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Calendar },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Venues", path: "/venues", icon: MapPin },
    { name: "City Guide", path: "/city-guide", icon: BookOpen },
    { name: "About", path: "/about", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Branding */}
        <div className="flex items-center space-x-8">
          <div onClick={() => window.location.href = "/"} className="flex items-center space-x-2 cursor-pointer">
            <div className="h-8 w-8 rounded-sm bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="kolab-heading-medium font-accent tracking-wide text-foreground">Kolab</span>
          </div>
          
          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.name}
                  onClick={() => window.location.href = item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, collaborators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background-secondary border-0 focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Create Event Button */}
              <Button
                onClick={onCreateEvent}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                size="sm"
                aria-label="Create a new event"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Create</span>
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="relative"
                aria-label="View messages (3 unread)"
              >
                <div onClick={() => window.location.href = "/messages"} className="cursor-pointer">
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary"
                    aria-label="3 unread messages"
                  >
                    3
                  </Badge>
                </div>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenNotifications}
                className="relative"
                aria-label="View notifications (2 unread)"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent"
                  aria-label="2 unread notifications"
                >
                  2
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
                        alt={profile?.full_name || "User profile picture"} 
                      />
                      <AvatarFallback>{profile?.full_name?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || user?.email || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || "user@kolab.com"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/bookings"}>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/analytics"}>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Analytics
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={async () => {
                      await signOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="bg-gradient-primary hover:opacity-90"
              size="sm"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  aria-label="Open mobile navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} onClick={() => window.location.href = item.path}>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = "/search"}>
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </header>
  );
}