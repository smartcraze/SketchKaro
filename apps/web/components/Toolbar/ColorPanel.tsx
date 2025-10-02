import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

// ✅ Extract outside to avoid re-creating on each render
const PREDEFINED_COLORS = [
  "#000000",
  "#ffffff",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#e64980",
  "#7c4dff",
  "#ffd43b",
  "#495057",
  "#74c0fc",
  "#51cf66",
];

interface ColorPanelProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export function ColorPanel({
  selectedColor,
  setSelectedColor,
}: ColorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  const handleColorSelect = (color: string) => setSelectedColor(color);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="flex items-center gap-2">
        {/* Palette container */}
        <div
          className={clsx(
            "bg-background/95 backdrop-blur-md border border-border/40 rounded-2xl shadow-xl transition-all duration-300 ease-in-out origin-left transform-gpu",
            isExpanded
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-95 -translate-x-3 pointer-events-none"
          )}
        >
          <div className="p-4">
            {/* Predefined colors */}
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  aria-label={`Select ${color}`}
                  className={clsx(
                    "w-7 h-7 rounded-lg border-2 transition-transform duration-200 hover:scale-110 focus:outline-none",
                    selectedColor === color
                      ? "border-blue-500 shadow-md scale-110"
                      : color === "#ffffff"
                        ? "border-gray-300"
                        : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="mt-4 pt-3 border-t border-border/20">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-full h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent"
                aria-label="Custom color"
              />
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="h-12 w-12 rounded-2xl bg-background/95 backdrop-blur-sm border-border/40 shadow-lg hover:shadow-xl hover:bg-accent/60 transition-all duration-300 flex flex-col items-center justify-center gap-1"
        >
          {/* Current Color Indicator */}
          <div
            className="w-5 h-4 rounded border border-border/40"
            style={{ backgroundColor: selectedColor }}
          />
          <ChevronRight
            className={clsx(
              "w-3 h-3 transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  );
}
