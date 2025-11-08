"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HTTP_BACKEND, WS_URL } from "@/Config";
import axios from "axios";
import {
  Play,
  ArrowRight,
  Users,
  Zap,
  Plus,
  Search,
  Clock,
  Palette,
  MessageSquare,
  Download,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

export function Hero() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [slug, setSlug] = useState("");
  const [activeTab, setActiveTab] = useState<"join" | "create" | "demo">(
    "create"
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      setToken(cookieToken ?? null);
      setIsLoggedIn(!!cookieToken);
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to create a room");
      router.push("/signin");
      return;
    }

    if (!slug.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    try {

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { slug: slug.trim() },
        {
          headers: {
            Authorization: token,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const roomId = response.data.id;
      toast.success("Room created successfully!");
      router.push(`/canvas/${roomId}`);
    } catch (error: any) {

      // More specific error handling
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        toast.error(
          "Backend server is not running. Please start the backend service."
        );
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        if (status === 401) {
          toast.error("Authentication failed. Please sign in again.");
          router.push("/signin");
        } else if (status === 400) {
          toast.error(`Room creation failed: ${message}`);
        } else if (status === 409) {
          toast.error(
            "Room name already exists. Please choose a different name."
          );
        } else {
          toast.error(`Server error (${status}): ${message}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error(
          "No response from server. Please check if the backend is running."
        );
      } else {
        // Something else happened
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to join a room");
      router.push("/signin");
      return;
    }

    if (!slug.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    const trimmedInput = slug.trim();

    try {
      // Check if user pasted a full room ID (number) or a slug (string)
      // If it's a number, go directly to that room
      if (!isNaN(Number(trimmedInput))) {
        toast.success(`Joining room...`);
        router.push(`/canvas/${trimmedInput}`);
        return;
      }

      // Otherwise, try to find the room by slug
      const response = await axios.get(
        `${HTTP_BACKEND}/room/find/${trimmedInput}`,
        {
          headers: {
            Authorization: token,
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.id) {
        const roomId = response.data.id;
        toast.success(`Joining room...`);
        router.push(`/canvas/${roomId}`);
      } else {
        toast.error("Room not found. Please check the room ID.");
      }
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        toast.error(
          "Backend server is not running. Please start the backend service."
        );
      } else if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        if (status === 401) {
          toast.error("Authentication failed. Please sign in again.");
          router.push("/signin");
        } else if (status === 404) {
          toast.error(
            "Room not found. Please check the room ID."
          );
        } else {
          toast.error(`Error finding room: ${message}`);
        }
      } else {
        toast.error(
          "Room not found. Please check the room ID."
        );
      }
    }
  };

  const handleDemoMode = () => {
    // Generate a random demo room ID
    const demoRoomId = `demo-${Math.random().toString(36).substr(2, 9)}`;
    toast.success("Entering demo mode!");
    router.push(`/canvas/${demoRoomId}`);
  };

  const generateRandomSlug = () => {
    const adjectives = [
      "creative",
      "innovative",
      "brilliant",
      "amazing",
      "fantastic",
      "awesome",
    ];
    const nouns = ["canvas", "space", "room", "studio", "workshop", "lab"];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    setSlug(`${randomAdjective}-${randomNoun}-${randomNum}`);
  };

  // Enhanced Canvas Draw Logic with multiple colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#4b5563", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
    let currentColorIndex = 0;

    const startDraw = (e: MouseEvent) => {
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      currentColorIndex = Math.floor(Math.random() * colors.length);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = colors[currentColorIndex];
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    const stopDraw = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
    };
  }, []);

  const renderActionSection = () => {
    if (!isLoggedIn) {
      return (
        <div className="space-y-8">
          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 px-8 h-12 font-medium"
              onClick={() => router.push("/signup")}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 h-12 font-medium"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </Button>
          </div>

          {/* Demo CTA */}
          <div className="text-center">
            <button
              onClick={handleDemoMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Try demo without signing up →
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto">
        {/* Clean Tab Switcher */}
        <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-full mb-8">
          <button
            onClick={() => {
              setActiveTab("create");
              setSlug("");
            }}
            className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "create"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create
          </button>
          <button
            onClick={() => {
              setActiveTab("join");
              setSlug("");
            }}
            className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "join"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Join
          </button>
          <button
            onClick={() => {
              setActiveTab("demo");
              setSlug("");
            }}
            className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "demo"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Demo
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "create" && (
            <>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="my-awesome-room"
                  className="flex-1 h-11"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={generateRandomSlug}
                  title="Random name"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleCreateRoom}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
              >
                Create Room
              </Button>
            </>
          )}

          {activeTab === "join" && (
            <>
              <Input
                type="text"
                placeholder="Paste room ID or name"
                className="w-full h-11"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                className="w-full h-11"
                variant="outline"
              >
                Join Room
              </Button>
            </>
          )}

          {activeTab === "demo" && (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Start drawing instantly with no account required
              </p>
              <Button
                onClick={handleDemoMode}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
              >
                Start Demo
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-20">
      {/* Minimal Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-background to-background" />

      <div className="max-w-4xl mx-auto w-full space-y-16">
        {/* Hero Content */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Sketch<span className="text-muted-foreground">Karo</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time collaborative whiteboard for teams.
            <br className="hidden sm:block" />
            Draw, brainstorm, and create together.
          </p>
        </div>

        {/* Action Section */}
        {renderActionSection()}

        {/* Minimal Features - Only for non-logged in users */}
        {!isLoggedIn && (
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Instant setup</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Real-time sync</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Full-featured</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
