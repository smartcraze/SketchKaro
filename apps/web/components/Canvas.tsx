"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Game } from "@/draw/Games";
import { Tool } from "@/draw/types";
import toast from "react-hot-toast";

// Import custom components
import { Toolbar } from "./Toolbar/Toolbar";
import { ColorPanel } from "./Toolbar/ColorPanel";
import { ActionButtons } from "./Toolbar/ActionButtons";
import { ExportButtons } from "./Toolbar/ExportButtons";
import { ZoomControls } from "./Toolbar/ZoomControls";
import { MobileControls } from "./Toolbar/MobileControls";
import { WelcomeOverlay } from "./WelcomeOverlay";
import { CursorOverlay } from "./CursorOverlay";

// Import custom hooks
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Custom CSS styles for the slider
const sliderStyles = `
  .stroke-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }
  
  .stroke-slider::-webkit-slider-track {
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
  }
  
  .stroke-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    margin-top: -6px;
  }
  
  .stroke-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .stroke-slider::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    border: none;
  }
  
  .stroke-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: none;
  }
`;

export type DrawingColor = string;

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  // Canvas and game state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();

  // Drawing state
  const [selectedTool, setSelectedTool] = useState<Tool>("pan");
  const [selectedColor, setSelectedColor] = useState<DrawingColor>("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(16);

  // History state
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Text input state
  const [isTextInputActive, setIsTextInputActive] = useState<boolean>(false);
  const [textInputPosition, setTextInputPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Cursor tracking
  const [userCursors, setUserCursors] = useState<
    Map<string, { x: number; y: number; color: string; name: string }>
  >(new Map());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Mobile detection
  const isMobile = useMobileDetection();

  // Game initialization
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

  // Sync tool state with game
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
      const interval = setInterval(handleHistoryChange, 100);
      return () => clearInterval(interval);
    }
  }, [game]);

  // Event handlers
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
        const link = document.createElement("a");
        link.download = `sketch-karo-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL("image/png");

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

  const handleZoomIn = () => {
    game?.zoom(1.2);
  };

  const handleZoomOut = () => {
    game?.zoom(0.8);
  };

  const handleResetZoom = () => {
    game?.resetZoom();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleExport,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    setSelectedTool,
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Inject custom slider styles */}
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

      <canvas ref={canvasRef}></canvas>

      {/* Welcome Overlay */}
      <WelcomeOverlay />

      {/* Cursor Overlay */}
      <CursorOverlay userCursors={userCursors} currentUserId={currentUserId} />

      {/* Color Panel - Left Side */}
      <ColorPanel
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      {/* Main Toolbar - Center Top */}
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        selectedColor={selectedColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />

      {/* Action Buttons (Undo/Redo/Clear) - Top Left */}
      <div className="fixed top-6 left-6 z-10">
        <ActionButtons
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClearCanvas}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Export Buttons (Download/Share) - Top Right */}
      <div className="fixed top-6 right-6 z-10">
        <ExportButtons onExport={handleExport} />
      </div>

      {/* Zoom Controls - Bottom Left (Horizontal) */}
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      {/* Mobile Controls */}
      {isMobile && (
        <MobileControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      )}
    </div>
  );
}
