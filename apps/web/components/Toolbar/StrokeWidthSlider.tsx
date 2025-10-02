interface StrokeWidthSliderProps {
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  selectedColor: string;
}

export function StrokeWidthSlider({
  strokeWidth,
  setStrokeWidth,
  selectedColor,
}: StrokeWidthSliderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <div className="flex items-center gap-1 hidden md:flex">
        <div className="text-xs text-muted-foreground font-medium">Size</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 bg-muted/30 rounded-lg p-2 min-w-[100px] sm:min-w-[140px]">
        {/* Visual stroke preview */}
        <div className="flex items-center justify-center w-6 sm:w-8 h-6">
          <div
            className="rounded-full bg-current"
            style={{
              width: `${Math.max(2, Math.min(strokeWidth, 12))}px`,
              height: `${Math.max(2, Math.min(strokeWidth, 12))}px`,
              backgroundColor: selectedColor,
            }}
          ></div>
        </div>

        {/* Custom styled slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full h-2 bg-background rounded-full appearance-none cursor-pointer stroke-slider"
            aria-label="Stroke width"
            style={{
              background: `linear-gradient(to right, ${selectedColor} 0%, ${selectedColor} ${((strokeWidth - 1) / 19) * 100}%, #e2e8f0 ${((strokeWidth - 1) / 19) * 100}%, #e2e8f0 100%)`,
            }}
          />
        </div>

        {/* Numeric value */}
        <div className="text-xs font-medium text-foreground min-w-[16px] sm:min-w-[24px] text-center">
          {strokeWidth}
        </div>
      </div>
    </div>
  );
}
