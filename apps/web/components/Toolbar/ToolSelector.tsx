import { Tool } from "@/draw/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Hand,
  Pencil,
  RectangleHorizontalIcon,
  Circle,
  Eraser,
  Type,
} from "lucide-react";

interface ToolSelectorProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

export function ToolSelector({
  selectedTool,
  setSelectedTool,
}: ToolSelectorProps) {
  return (
    <div className="flex items-center flex-shrink-0">
      <ToggleGroup
        type="single"
        value={selectedTool}
        onValueChange={(value: Tool) => {
          if (value) setSelectedTool(value);
        }}
        className="bg-muted/50 rounded-xl p-1 flex gap-1 shadow-sm"
      >
        <ToggleGroupItem
          value="pan"
          aria-label="Pan"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <Hand className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="pencil"
          aria-label="Pencil"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <Pencil className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="rect"
          aria-label="Rectangle"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <RectangleHorizontalIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="circle"
          aria-label="Circle"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <Circle className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="eraser"
          aria-label="Eraser"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <Eraser className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="text"
          aria-label="Text"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent rounded-lg transition-all duration-200"
        >
          <Type className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
