"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HTTP_BACKEND } from "@/Config";
import axios from "axios";
import { Play, ArrowRight, Users, Zap } from "lucide-react";
import toast from "react-hot-toast";

export function Hero() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [slug, setSlug] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    setToken(cookieToken ?? null);
    setIsLoggedIn(!!cookieToken);
  }, []);

  const handleJoinRoom = async () => {
    if (!slug || !token) {
      toast.error("Please enter a valid slug and ensure you're logged in.");
      return;
    }

    try {
      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { slug },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const roomId = response.data.id;
      router.push(`/canvas/${roomId}`);
    } catch (error) {
      console.error("Failed to create/join room:", error);
      toast.error("Error joining room. Check console for details.");
    }
  };

  // Basic Canvas Draw Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDraw = (e: MouseEvent) => {
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 2;
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
            and brainstorm with your team in real-time, anywhere in the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {!isLoggedIn ? (
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-border border hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/signin")}
              >
                <Play className="w-5 h-5 mr-2" />
                Sign in to Join Room
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-96">
                <Input
                  type="text"
                  placeholder="Enter Room Slug"
                  className="w-96 border-border border"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-border border hover:scale-105 transition-all duration-200"
                  onClick={handleJoinRoom}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
              </div>
            )}
          </div>

          {/* Metrics Section */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-muted-foreground">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
              <div className="text-sm">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">50M+</div>
              <div className="text-sm">Drawings Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">99.9%</div>
              <div className="text-sm">Uptime</div>
            </div>
          </div>
        </div>

        {/* Canvas Preview Section with Live Drawing */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative bg-muted rounded-2xl shadow-2xl border border-border overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-secondary px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-muted-foreground">Untitled Canvas</span>
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
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <canvas
              ref={canvasRef}
              width={1000}
              height={400}
              className="w-full h-96 bg-background cursor-crosshair"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
