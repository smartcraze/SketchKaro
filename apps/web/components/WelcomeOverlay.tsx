import { useState, useEffect } from "react";
import { X, Palette, Mouse, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome before
    const hasSeenWelcome = localStorage.getItem("sketchkaro-welcome-seen");
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("sketchkaro-welcome-seen", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to SketchKaro!</h1>
          <p className="text-muted-foreground">
            An infinite canvas for collaborative drawing, just like Excalidraw
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mouse className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Infinite Canvas</h3>
              <p className="text-xs text-muted-foreground">
                Pan with middle-click or right-click drag. Zoom with mouse
                wheel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Drawing Tools</h3>
              <p className="text-xs text-muted-foreground">
                Tools in center. Colors on left. Actions top-left. Export
                top-right.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
              <p className="text-xs text-muted-foreground">
                P-Pan, D-Draw, R-Rectangle, C-Circle, E-Eraser, T-Text
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={handleDismiss} className="w-full">
          Start Drawing
        </Button>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          This welcome screen won't show again
        </p>
      </div>
    </div>
  );
}
