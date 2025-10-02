import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  return (
    <div className="fixed bottom-4 left-4 z-10">
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg">
        <Button
          onClick={onZoomOut}
          className="h-10 w-10 p-0 rounded-xl cursor-pointer
                     hover:bg-accent transition-colors
                     hover:scale-105 transition-transform duration-150"
          aria-label="Zoom Out"
          variant="ghost"
          size="sm"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>

        <Button
          onClick={onResetZoom}
          className="h-10 w-10 p-0 rounded-xl cursor-pointer
                     hover:bg-accent transition-colors
                     hover:scale-105 transition-transform duration-150"
          aria-label="Reset Zoom"
          variant="ghost"
          size="sm"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={onZoomIn}
          className="h-10 w-10 p-0 rounded-xl cursor-pointer
                     hover:bg-accent transition-colors
                     hover:scale-105 transition-transform duration-150"
          aria-label="Zoom In"
          variant="ghost"
          size="sm"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
