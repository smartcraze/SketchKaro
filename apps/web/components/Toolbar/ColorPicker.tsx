import { Palette } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  colors?: string[]; // ✅ Allow override
}

const DEFAULT_COLORS = [
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
  colors = DEFAULT_COLORS,
}: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Label (desktop only) */}
      <div className="hidden md:flex items-center gap-1">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Color</span>
      </div>

      {/* Color panel */}
      <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg p-1.5">
        <div className="flex flex-wrap gap-1.5">
          {colors.map((color, i) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`rounded-md border-2 flex-shrink-0 transition-transform duration-150 hover:scale-105 cursor-pointer
                ${
                  selectedColor === color
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border/50 hover:border-border"
                }
                ${i < 6 ? "w-5 h-5 sm:w-6 sm:h-6" : "hidden sm:inline-block w-6 h-6"}
              `}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              title={color} // ✅ Hover tooltip
            />
          ))}
        </div>

        {/* Custom color input */}
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 border-border/50 hover:border-border 
                     cursor-pointer bg-transparent transition-transform duration-150 hover:scale-105"
          aria-label="Custom color picker"
          title="Custom color"
        />
      </div>
    </div>
  );
}
