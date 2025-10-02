import { useState } from "react";
import { Palette, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Predefined colors similar to Excalidraw
  const predefinedColors = [
    "#000000", // Black
    "#ffffff", // White
    "#e03131", // Red
    "#2f9e44", // Green
    "#1971c2", // Blue
    "#f08c00", // Orange
    "#e64980", // Pink
    "#7c4dff", // Purple
    "#ffd43b", // Yellow
    "#495057", // Gray
    "#74c0fc", // Light Blue
    "#51cf66", // Light Green
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-10">
      <div className="flex items-center">
        {/* Color Panel */}
        <div
          className={`bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg transition-all duration-300 ${
            isExpanded
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-3 pointer-events-none"
          }`}
        >
          <div className="p-4 w-16">
            <div className="grid grid-cols-2 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color
                      ? "border-blue-500 shadow-md scale-110"
                      : color === "#ffffff"
                        ? "border-gray-300"
                        : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-full h-7 rounded-lg border-2 border-transparent cursor-pointer bg-transparent"
                  title="Custom color"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-3 p-0 h-12 w-12 rounded-2xl bg-background/95 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex flex-col items-center gap-1.5">
            {/* Current Color Indicator */}
            <div
              className="w-5 h-4 rounded border border-border/50"
              style={{ backgroundColor: selectedColor }}
            />
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </Button>
      </div>
    </div>
  );
}
