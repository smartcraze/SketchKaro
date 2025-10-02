export type Tool = "circle" | "rect" | "pencil" | "eraser" | "text";

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

export interface CursorPosition {
  x: number;
  y: number;
  color: string;
  name: string;
}

export interface HistoryState {
  shapes: Shape[];
  currentIndex: number;
  maxSize: number;
}
