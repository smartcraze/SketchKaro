export type Tool = "circle" | "rect" | "pencil" | "eraser" | "text" | "pan";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
      strokeWidth?: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color?: string;
      strokeWidth?: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color?: string;
      strokeWidth?: number;
      path?: { x: number; y: number }[]; // For smooth drawing
    }
  | {
      type: "eraser";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      strokeWidth?: number;
      path?: { x: number; y: number }[]; // For smooth erasing
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
      color?: string;
      fontSize?: number;
    };

export interface DrawingState {
  selectedTool: Tool;
  selectedColor: string;
  strokeWidth: number;
  fontSize: number;
}

// CursorPosition interface removed - cursor tracking disabled

export interface HistoryState {
  shapes: Shape[];
  currentIndex: number;
  maxSize: number;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
}
