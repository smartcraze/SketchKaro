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
      toast.error("Please enter a room code");
      return;
    }

    try {

      // First, try to find the existing room
      const response = await axios.get(
        `${HTTP_BACKEND}/room/find/${slug.trim()}`,
        {
          headers: {
            Authorization: token,
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.id) {
        const roomId = response.data.id;
        toast.success(`Joining room: ${slug.trim()}`);
        router.push(`/canvas/${roomId}`);
      } else {
        toast.error("Room not found. Please check the room code.");
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
            "Room not found. Please check the room code or ask the room creator for the correct name."
          );
        } else {
          toast.error(`Error finding room: ${message}`);
        }
      } else {
        toast.error(
          "Room not found or error joining. Please check the room code."
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => router.push("/signup")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-border border hover:scale-105 transition-all duration-200"
            onClick={() => router.push("/signin")}
          >
            <Play className="w-5 h-5 mr-2" />
            Sign In
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200"
            onClick={handleDemoMode}
          >
            <Palette className="w-5 h-5 mr-2" />
            Try Demo
          </Button>
        </div>
      );
    }

    return (
      <div className="mb-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-1 rounded-lg flex gap-1">
            <button
              onClick={() => {
                setActiveTab("create");
                setSlug(""); // Clear input when switching tabs
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "create"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Create Room
            </button>
            <button
              onClick={() => {
                setActiveTab("join");
                setSlug(""); // Clear input when switching tabs
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "join"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Join Room
            </button>
            <button
              onClick={() => {
                setActiveTab("demo");
                setSlug(""); // Clear input when switching tabs
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "demo"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="w-4 h-4 mr-2 inline" />
              Demo Mode
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-md mx-auto">
          {activeTab === "create" && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Create a new collaboration room that others can join
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter room name (e.g., design-meeting)"
                  className="flex-1 border-border"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomSlug}
                  title="Generate random name"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Room
              </Button>
            </div>
          )}

          {activeTab === "join" && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Enter the exact room name to join an existing collaboration
                session
              </div>
              <Input
                type="text"
                placeholder="Enter exact room name (e.g., design-meeting-123)"
                className="w-full border-border"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Join Existing Room
              </Button>
            </div>
          )}

          {activeTab === "demo" && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground text-sm">
                Try SketchKaro without signing up. Perfect for quick sketches
                and testing features.
              </p>
              <Button
                onClick={handleDemoMode}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                <Palette className="w-5 h-5 mr-2" />
                Start Demo Session
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background mb-8">
      {/* Blurred Background Lights */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10 text-foreground">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 px-4 py-2 bg-muted text-primary border border-border hover:scale-105 transition-transform duration-200">
            <Zap className="w-4 h-4 mr-2" />
            Real-time Collaboration Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Create, Collaborate,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
              Innovate Together
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The most intuitive canvas for visual collaboration. Draw, sketch,
            brainstorm, and chat with your team in real-time, anywhere in the
            world.
          </p>

          {renderActionSection()}

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Multi-user</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Live Chat</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="w-4 h-4 text-green-500" />
              <span>Export</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Real-time</span>
            </div>
          </div>
        </div>

        {/* Enhanced Canvas Preview Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative bg-muted rounded-2xl shadow-2xl border border-border overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-secondary px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  Interactive Demo Canvas
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    A
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    B
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    C
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    3 online
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={1000}
                height={400}
                className="w-full h-96 bg-background cursor-crosshair"
              />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs">
                Try drawing on this canvas! 🎨
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
