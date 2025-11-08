"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggler";
import { useEffect, useState } from "react";
import { HTTP_BACKEND } from "@/Config";
import axios from "axios";
import { LogOut, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      setToken(cookieToken ?? null);

      if (cookieToken) {
        fetchUserInfo(cookieToken);
      }
    }
  }, []);

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await axios.get(`${HTTP_BACKEND}/me`, {
        headers: { Authorization: authToken },
        timeout: 5000,
      });

      if (response.data?.name) {
        setUserName(response.data.name);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      toast.success("Logged out successfully");
      window.location.reload();
    }
  };

  const handleDemoMode = () => {
    const demoRoomId = `demo-${Math.random().toString(36).substr(2, 9)}`;
    toast.success("Starting demo session!");
    router.push(`/canvas/${demoRoomId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold hover:opacity-70 transition-opacity">
          SketchKaro
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDemoMode}
            className="hidden sm:flex"
          >
            <Palette className="w-4 h-4 mr-2" />
            Demo
          </Button>

          <ModeToggle />

          {token ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {userName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
