export function InfoPanel() {
  return (
    <div className="fixed bottom-4 left-4 z-10 bg-background/90 border rounded-xl p-3 shadow-md max-w-xs">
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="font-medium text-foreground mb-1">
          Infinite Canvas Controls:
        </div>
        <div>
          • Pan: Middle click & drag, right-click & drag, or use Pan tool
        </div>
        <div>• Zoom: Mouse wheel</div>
        <div>• Mobile: Two-finger pinch to zoom, two-finger drag to pan</div>
        <div className="pt-1 border-t border-border">
          <div className="font-medium text-foreground">Shortcuts:</div>
          <div>
            P - Pan, D - Draw, R - Rectangle, C - Circle, E - Eraser, T - Text
          </div>
          <div>Ctrl+= Zoom In, Ctrl+- Zoom Out, Ctrl+0 Reset Zoom</div>
        </div>
      </div>
    </div>
  );
}
