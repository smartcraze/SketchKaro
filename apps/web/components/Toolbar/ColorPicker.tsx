import { Palette } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

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

export function ColorPicker({
  selectedColor,
  setSelectedColor,
}: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="flex items-center gap-1 hidden md:flex">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Color</span>
      </div>
      <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg p-1.5">
        {presetColors.slice(0, 6).map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 transition-all hover:scale-110 flex-shrink-0 ${
              selectedColor === color
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : "border-border/50 hover:border-border"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
        {/* Show more colors on larger screens */}
        <div className="hidden sm:flex gap-1.5">
          {presetColors.slice(6).map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 flex-shrink-0 ${
                selectedColor === color
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border/50 hover:border-border"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 border-border/50 hover:border-border cursor-pointer bg-transparent"
          aria-label="Custom color picker"
        />
      </div>
    </div>
  );
}
