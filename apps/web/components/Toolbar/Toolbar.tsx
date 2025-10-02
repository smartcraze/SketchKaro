import { Tool } from "@/draw/types";
import { ToolSelector } from "./ToolSelector";
import { StrokeWidthSlider } from "./StrokeWidthSlider";

interface ToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  selectedColor: string;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

export function Toolbar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  strokeWidth,
  setStrokeWidth,
}: ToolbarProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-10 max-w-[95vw]">
      <div className="flex items-center gap-2 sm:gap-3 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg overflow-x-auto">
        {/* Tool Selection Group */}
        <ToolSelector
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />

        {/* Separator */}
        <div className="w-px h-6 bg-border hidden sm:block"></div>

        {/* Stroke Width Control */}
        <StrokeWidthSlider
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          selectedColor={selectedColor}
        />
      </div>
    </div>
  );
}
