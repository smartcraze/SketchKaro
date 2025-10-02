import { Button } from "@/components/ui/button";
import { Download, Share2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExport: () => void;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExport,
}: ZoomControlsProps) {
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

  return (
    <div className="fixed top-4 right-4 z-10 flex gap-1 md:gap-2">
      {/* Desktop Zoom Controls */}
      <div className="hidden md:flex gap-1">
        <Button
          onClick={onZoomOut}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition"
          aria-label="Zoom Out"
          variant="outline"
          size="sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          onClick={onResetZoom}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition"
          aria-label="Reset Zoom"
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={onZoomIn}
          className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition"
          aria-label="Zoom In"
          variant="outline"
          size="sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
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
  );
}
