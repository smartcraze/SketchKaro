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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolSelectorProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

export function ToolSelector({
  selectedTool,
  setSelectedTool,
}: ToolSelectorProps) {
  const tools = [
    { value: "pan", label: "Pan", icon: Hand },
    { value: "pencil", label: "Pencil", icon: Pencil },
    { value: "rect", label: "Rectangle", icon: RectangleHorizontalIcon },
    { value: "circle", label: "Circle", icon: Circle },
    { value: "eraser", label: "Eraser", icon: Eraser },
    { value: "text", label: "Text", icon: Type },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center flex-shrink-0">
        <ToggleGroup
          type="single"
          value={selectedTool}
          onValueChange={(value: Tool) => {
            if (value) setSelectedTool(value);
          }}
          className="bg-muted/50 rounded-xl p-1 flex gap-1 shadow-sm"
        >
          {tools.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className="
                cursor-pointer flex items-center justify-center p-2 rounded-lg
                transition-all duration-200 hover:bg-accent/70
                data-[state=on]:bg-slate-500
                data-[state=on]:text-primary-foreground 
                data-[state=on]:shadow-md
              "
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-full h-full">
                    <Icon className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </TooltipProvider>
  );
}
