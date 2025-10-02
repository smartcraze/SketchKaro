import { Shape, HistoryState } from "./types";

export class ShapeManager {
  private shapes: Shape[] = [];
  private history: Shape[][] = [];
  private currentHistoryIndex = -1;
  private maxHistorySize = 50;

  constructor() {
    this.saveToHistory();
  }

  addShape(shape: Shape) {
    this.shapes.push(shape);
    this.saveToHistory();
  }

  getAllShapes(): Shape[] {
    return [...this.shapes];
  }

  clearAll() {
    this.shapes = [];
    this.saveToHistory();
  }

  private saveToHistory() {
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.currentHistoryIndex + 1);

    // Add current state to history
    this.history.push([...this.shapes]);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentHistoryIndex++;
    }
  }

  canUndo(): boolean {
    return this.currentHistoryIndex > 0;
  }

  canRedo(): boolean {
    return this.currentHistoryIndex < this.history.length - 1;
  }

  undo() {
    if (this.canUndo()) {
      this.currentHistoryIndex--;
      this.shapes = [...this.history[this.currentHistoryIndex]];
      return true;
    }
    return false;
  }

  redo() {
    if (this.canRedo()) {
      this.currentHistoryIndex++;
      this.shapes = [...this.history[this.currentHistoryIndex]];
      return true;
    }
    return false;
  }

  getHistoryState(): HistoryState {
    return {
      shapes: [...this.shapes],
      currentIndex: this.currentHistoryIndex,
      maxSize: this.maxHistorySize,
    };
  }

  restoreFromShapes(shapes: Shape[]) {
    this.shapes = [...shapes];
    this.saveToHistory();
  }
}
