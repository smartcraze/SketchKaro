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
      <div
        className="
        flex items-center gap-2 sm:gap-4
        bg-background/95 backdrop-blur-md
        border border-border/60
        rounded-2xl px-3 sm:px-4 py-2
        shadow-xl overflow-x-auto scrollbar-none
      "
      >
        <ToolSelector
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />

        <div className="hidden sm:block h-6 border-l border-border/60 mx-2" />

        <StrokeWidthSlider
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          selectedColor={selectedColor}
        />
      </div>
    </div>
  );
}
