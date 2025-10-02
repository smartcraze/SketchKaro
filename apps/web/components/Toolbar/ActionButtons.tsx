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
    <div className="fixed top-4 left-4 z-10 flex gap-1 md:gap-2">
      <Button
        onClick={onUndo}
        disabled={!canUndo}
        className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition disabled:opacity-50"
        aria-label="Undo (Ctrl+Z)"
        variant="outline"
        size="sm"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        onClick={onRedo}
        disabled={!canRedo}
        className="bg-muted border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-accent transition disabled:opacity-50"
        aria-label="Redo (Ctrl+Y)"
        variant="outline"
        size="sm"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Button
        onClick={onClear}
        className="bg-destructive border shadow-md p-1.5 md:p-2 rounded-xl hover:bg-destructive/90 transition text-destructive-foreground"
        aria-label="Clear Canvas (Ctrl+K)"
        variant="outline"
        size="sm"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
