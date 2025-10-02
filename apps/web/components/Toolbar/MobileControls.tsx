import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MobileControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

function MobileControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: MobileControlsProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-[1rem] right-[1rem] z-20 p-3 rounded-full shadow-lg"
        aria-label="Toggle Mobile Controls"
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          transform: "none",
        }}
      >
        <ChevronDown
          className={`h-5 w-5 transition-transform ${showControls ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Mobile Controls Panel */}
      {showControls && (
        <div
          className="fixed bg-background border rounded-xl p-3 shadow-lg z-10"
          style={{
            position: "fixed",
            bottom: "4.5rem",
            right: "1rem",
            transform: "none",
          }}
        >
          <div className="flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onZoomOut}
                size="sm"
                variant="outline"
                className="p-2"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                onClick={onResetZoom}
                size="sm"
                variant="outline"
                className="p-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={onZoomIn}
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
  );
}

export { MobileControls };
