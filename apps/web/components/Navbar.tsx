"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggler";
import { useEffect, useState } from "react";
import { HTTP_BACKEND } from "@/Config";
import axios from "axios";
import { 
  User, 
  LogOut, 
  Plus, 
  History, 
  Settings, 
  Palette,
  Users,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      setToken(cookieToken ?? null);
      
      // Fetch user info from backend if token exists
      if (cookieToken) {
        fetchUserInfo(cookieToken);
      }
    }
  }, []);

  const fetchUserInfo = async (authToken: string) => {
    setIsLoadingUser(true);
    try {
      const response = await axios.get(`${HTTP_BACKEND}/me`, {
        headers: {
          Authorization: authToken,
        },
        timeout: 5000,
      });
      
      if (response.data) {
        setUserName(response.data.name || "User");
        setUserEmail(response.data.email || "");
      }
    } catch (error: any) {
      console.error("Failed to fetch user info:", error);
      
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        // Fallback to generic name if request fails
        setUserName("User");
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      setToken(null);
      setUserName("User");
      setUserEmail("");
      toast.success("Logged out successfully");
      setShowUserMenu(false);
      window.location.reload();
    }
  };

  const handleCreateRoom = () => {
    if (!token) {
      toast.error("Please sign in to create a room");
      router.push("/signin");
      return;
    }
    setShowUserMenu(false);
    // For now, redirect to home with create tab active
    // In the future, this could be a dedicated create room page
    router.push("/?tab=create");
  };

  const handleDemoMode = () => {
    const demoRoomId = `demo-${Math.random().toString(36).substr(2, 9)}`;
    toast.success("Starting demo session!");
    setShowUserMenu(false);
    router.push(`/canvas/${demoRoomId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm transition-colors">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary">SketchKaro</h2>
        </Link>

        {/* Center Navigation (only show when logged in) */}
        {token && (
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateRoom}
              className="text-sm hover:bg-muted"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Room
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemoMode}
              className="text-sm hover:bg-muted"
            >
              <Palette className="w-4 h-4 mr-2" />
              Demo
            </Button>
          </nav>
        )}

        {/* Right Navigation */}
        <nav className="flex items-center gap-3">
          <ModeToggle />

          {token ? (
            <div className="relative user-menu-container">
              <Button 
                variant="ghost" 
                className="relative h-10 flex items-center gap-2 hover:bg-muted"
                onClick={() => setShowUserMenu(!showUserMenu)}
                disabled={isLoadingUser}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {isLoadingUser ? "..." : userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm">
                  {isLoadingUser ? "Loading..." : userName}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {userEmail || "Manage your account"}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={handleCreateRoom}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Room
                    </button>
                    <button
                      onClick={handleDemoMode}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      Demo Mode
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      Recent Rooms
                    </button>
                  </div>
                  
                  <div className="border-t border-border py-1">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDemoMode}
                className="text-sm"
              >
                <Palette className="w-4 h-4 mr-2" />
                Demo
              </Button>
              <Link href="/signin">
                <Button variant="default" size="sm" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="sm" className="text-sm hidden sm:inline-flex">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
