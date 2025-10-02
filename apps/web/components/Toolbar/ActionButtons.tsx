import { Button } from "@/components/ui/button";
import { Undo, Redo, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ActionButtons({
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-1 md:gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg">
      <Button
        onClick={onUndo}
        disabled={!canUndo}
        className="h-10 w-10 p-0 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
        aria-label="Undo (Ctrl+Z)"
        variant="ghost"
        size="sm"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        onClick={onRedo}
        disabled={!canRedo}
        className="h-10 w-10 p-0 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
        aria-label="Redo (Ctrl+Y)"
        variant="ghost"
        size="sm"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Button
        onClick={onClear}
        className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 transition-colors text-destructive"
        aria-label="Clear Canvas (Ctrl+K)"
        variant="ghost"
        size="sm"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
