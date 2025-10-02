import { Slider } from "@/components/ui/slider";

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
      <div className="hidden md:flex items-center gap-1">
        <span className="text-xs text-muted-foreground font-medium">Size</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 bg-muted/30 rounded-lg p-2 min-w-[120px] sm:min-w-[160px]">
        <div className="flex items-center justify-center w-6 sm:w-8 h-6">
          <div
            className="rounded-full"
            style={{
              width: `${Math.max(2, Math.min(strokeWidth, 14))}px`,
              height: `${Math.max(2, Math.min(strokeWidth, 14))}px`,
              backgroundColor: selectedColor,
            }}
          />
        </div>

        <Slider
          value={[strokeWidth]}
          onValueChange={([val]) => setStrokeWidth(val)}
          min={1}
          max={20}
          step={1}
          className="flex-1"
          style={
            {
              "--track-active": selectedColor,
            } as React.CSSProperties
          }
        />

        <div className="text-xs font-medium text-foreground min-w-[20px] sm:min-w-[28px] text-center">
          {strokeWidth}
        </div>
      </div>
    </div>
  );
}
