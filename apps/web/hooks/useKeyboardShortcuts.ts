import { useEffect } from "react";
import { Tool } from "@/draw/types";

interface UseKeyboardShortcutsProps {
  handleUndo: () => void;
  handleRedo: () => void;
  handleClearCanvas: () => void;
  handleExport: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  setSelectedTool: (tool: Tool) => void;
}

export function useKeyboardShortcuts({
  handleUndo,
  handleRedo,
  handleClearCanvas,
  handleExport,
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
  setSelectedTool,
}: UseKeyboardShortcutsProps) {
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
        } else if (e.key === "=") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleResetZoom();
        }
      } else {
        // Tool shortcuts
        if (e.key === "p") {
          e.preventDefault();
          setSelectedTool("pan");
        } else if (e.key === "d") {
          e.preventDefault();
          setSelectedTool("pencil");
        } else if (e.key === "r") {
          e.preventDefault();
          setSelectedTool("rect");
        } else if (e.key === "c") {
          e.preventDefault();
          setSelectedTool("circle");
        } else if (e.key === "e") {
          e.preventDefault();
          setSelectedTool("eraser");
        } else if (e.key === "t") {
          e.preventDefault();
          setSelectedTool("text");
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleExport,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    setSelectedTool,
  ]);
}
