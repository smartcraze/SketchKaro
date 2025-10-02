"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggler";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      setToken(token ?? null);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md shadow-sm transition-colors">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <h2 className="text-2xl font-bold text-primary">SketchKaro</h2>

        {/* Nav Right */}
        <nav className="flex items-center gap-4">
          <ModeToggle />

          {token ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm border-border"
            >
              Logout
            </Button>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="default" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="text-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
