"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Eraser,
  Palette,
  Undo,
  Redo,
  Trash2,
  Download,
  ChevronDown,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Game } from "@/draw/Games";
import { Tool } from "@/draw/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
export type DrawingColor = string;

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const [selectedColor, setSelectedColor] = useState<DrawingColor>("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isTextInputActive, setIsTextInputActive] = useState<boolean>(false);
  const [textInputPosition, setTextInputPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [userCursors, setUserCursors] = useState<
    Map<string, { x: number; y: number; color: string; name: string }>
  >(new Map());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);

  // Mobile detection effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    game?.setTool(selectedTool);
    game?.setColor(selectedColor);
    game?.setStrokeWidth(strokeWidth);
    game?.setFontSize(fontSize);
  }, [selectedTool, selectedColor, strokeWidth, fontSize, game]);

  // Track history state changes
  useEffect(() => {
    const handleHistoryChange = () => {
      setCanUndo(game?.canUndo() || false);
      setCanRedo(game?.canRedo() || false);
    };

    if (game) {
      // Set up a simple polling mechanism to check history state
      const interval = setInterval(handleHistoryChange, 100);
      return () => clearInterval(interval);
    }
  }, [game]);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    return () => {
      g.destroy();
    };
  }, [roomId, socket]);

  const handleUndo = useCallback(() => {
    game?.undo();
  }, [game]);

  const handleRedo = useCallback(() => {
    game?.redo();
  }, [game]);

  const handleClearCanvas = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to clear the entire canvas? This action cannot be undone."
      )
    ) {
      game?.clearAll();
    }
  }, [game]);

  const handleExport = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      toast.error("Export is only available in the browser");
      return;
    }

    if (canvasRef.current && game) {
      try {
        // Export as PNG - Direct canvas snapshot without white background
        const link = document.createElement("a");
        link.download = `sketch-karo-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL("image/png");

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Canvas exported as PNG successfully!");
      } catch (error) {
        console.error("Export error:", error);
        toast.error(
          `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  }, [game]);

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === "k") {
          e.preventDefault();
          handleClearCanvas();
        } else if (e.key === "s") {
          e.preventDefault();
          handleExport();
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleUndo, handleRedo, handleClearCanvas, handleExport]);

  // Mobile controls functions
  const toggleMobileControls = () => {
    setShowMobileControls(!showMobileControls);
  };

  const handleZoomIn = () => {
    game?.zoom(1.2);
  };

  const handleZoomOut = () => {
    game?.zoom(0.8);
  };

  const handleResetZoom = () => {
    game?.resetZoom();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef}></canvas>

      {/* User Cursors Overlay */}
      {Array.from(userCursors.entries()).map(([userId, cursor]) => {
        if (userId === currentUserId) return null; // Don't show own cursor
        return (
          <div
            key={userId}
            className="absolute pointer-events-none z-10"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            />
            <div
              className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClearCanvas}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Mobile Controls */}
      {isMobile && (
        <>
          {/* Mobile Toggle Button */}
          <Button
            onClick={toggleMobileControls}
            className="fixed bottom-4 right-4 z-20 p-3 rounded-full shadow-lg"
            aria-label="Toggle Mobile Controls"
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${showMobileControls ? "rotate-180" : ""}`}
            />
          </Button>

          {/* Mobile Controls Panel */}
          {showMobileControls && (
            <div className="fixed bottom-16 right-4 z-10 bg-background border rounded-xl p-3 shadow-lg">
              <div className="flex flex-col gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleZoomOut}
                    size="sm"
                    variant="outline"
                    className="p-2"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleResetZoom}
                    size="sm"
                    variant="outline"
                    className="p-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleZoomIn}
                    size="sm"
                    variant="outline"
                    className="p-2"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  strokeWidth,
  setStrokeWidth,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  selectedColor: DrawingColor;
  setSelectedColor: (c: DrawingColor) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const handleShare = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      toast.error("Share is only available in the browser");
      return;
    }

    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success(" Copied to clipboard! Share this with your friend!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const presetColors = [
    "#ffffff", // White
    "#000000", // Black
    "#ef4444", // Red
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#eab308", // Yellow
    "#a855f7", // Purple
    "#f97316", // Orange
    "#ec4899", // Pink
    "#06b6d4", // Cyan
  ];

  return (
    <>
      {/* Centered Tool Toggle Group */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-3 px-2 md:px-0 max-w-[calc(100vw-1rem)] overflow-x-auto">
        <ToggleGroup
          type="single"
          value={selectedTool}
          onValueChange={(value: Tool) => {
            if (value) setSelectedTool(value);
          }}
          className="bg-muted border rounded-xl p-1 flex gap-1 md:gap-2 shadow-md min-w-fit"
        >
          <ToggleGroupItem value="pencil" aria-label="Pencil">
            <Pencil className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="rect" aria-label="Rectangle">
            <RectangleHorizontalIcon className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="circle" aria-label="Circle">
            <Circle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="eraser" aria-label="Eraser">
            <Eraser className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="text" aria-label="Text">
            <Type className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>{" "}
        {/* Color Picker */}
        <div className="bg-muted border rounded-xl p-1.5 md:p-2 shadow-md">
          <div className="flex items-center gap-1 md:gap-2">
            <Palette className="h-4 w-4 text-muted-foreground hidden md:block" />
            <div className="flex gap-0.5 md:gap-1 overflow-x-auto">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 ${
                    selectedColor === color
                      ? "border-foreground ring-1 md:ring-2 ring-offset-1 ring-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-6 h-6 rounded-full border-2 border-border hover:border-foreground cursor-pointer"
                aria-label="Custom color picker"
              />
            </div>
          </div>
        </div>
        {/* Stroke Width Control */}
        <div className="bg-muted border rounded-xl p-1.5 md:p-2 shadow-md">
          <div className="flex items-center gap-1 md:gap-2 min-w-[80px] md:min-w-[120px]">
            <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              {strokeWidth}px
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer slider"
              aria-label="Stroke width"
            />
          </div>
        </div>
      </div>

      {/* Top-Left Undo/Redo and Share Buttons */}
      <div className="fixed top-4 left-4 z-10 flex gap-1 md:gap-2">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition disabled:opacity-50"
          aria-label="Undo (Ctrl+Z)"
          variant="outline"
          size="sm"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition disabled:opacity-50"
          aria-label="Redo (Ctrl+Y)"
          variant="outline"
          size="sm"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          onClick={onClear}
          className="bg-destructive border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-destructive/90 transition text-destructive-foreground"
          aria-label="Clear Canvas (Ctrl+K)"
          variant="outline"
          size="sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Top-Right Export and Share Buttons */}
      <div className="fixed top-4 right-4 z-10 flex gap-1 md:gap-2">
        <Button
          onClick={onExport}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition"
          aria-label="Export as PNG (Ctrl+S)"
          variant="outline"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleShare}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition"
          aria-label="Share"
          variant="outline"
        >
          <Share2 className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </>
  );
}
