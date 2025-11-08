import { Shape, HistoryState } from "./types";

/**
 * Manages drawing shapes and maintains undo/redo history
 * Provides functionality to add, clear, and restore shapes with full history tracking
 */
export class ShapeManager {
  private shapes: Shape[] = [];
  private history: Shape[][] = [];
  private currentHistoryIndex = -1;
  private maxHistorySize = 50;

  constructor() {
    this.saveToHistory();
  }

  /**
   * Add a new shape to the canvas
   * @param shape - The shape object to add
   */
  addShape(shape: Shape): void {
    this.shapes.push(shape);
    this.saveToHistory();
  }

  /**
   * Get all current shapes
   * @returns Copy of the shapes array
   */
  getAllShapes(): Shape[] {
    return [...this.shapes];
  }

  /**
   * Clear all shapes from the canvas
   */
  clearAll(): void {
    this.shapes = [];
    this.saveToHistory();
  }

  /**
   * Save current state to history
   * Handles history size limits and removes future states after new actions
   */
  private saveToHistory(): void {
    this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    this.history.push([...this.shapes]);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentHistoryIndex++;
    }
  }

  /**
   * Check if undo operation is available
   * @returns True if undo is possible
   */
  canUndo(): boolean {
    return this.currentHistoryIndex > 0;
  }

  /**
   * Check if redo operation is available
   * @returns True if redo is possible
   */
  canRedo(): boolean {
    return this.currentHistoryIndex < this.history.length - 1;
  }

  /**
   * Undo the last action
   * @returns True if undo was successful
   */
  undo(): boolean {
    if (this.canUndo()) {
      this.currentHistoryIndex--;
      this.shapes = [...this.history[this.currentHistoryIndex]];
      return true;
    }
    return false;
  }

  /**
   * Redo the previously undone action
   * @returns True if redo was successful
   */
  redo(): boolean {
    if (this.canRedo()) {
      this.currentHistoryIndex++;
      this.shapes = [...this.history[this.currentHistoryIndex]];
      return true;
    }
    return false;
  }

  /**
   * Get the current history state
   * @returns Object containing shapes, current index, and max history size
   */
  getHistoryState(): HistoryState {
    return {
      shapes: [...this.shapes],
      currentIndex: this.currentHistoryIndex,
      maxSize: this.maxHistorySize,
    };
  }

  /**
   * Restore shapes from an external source
   * @param shapes - Array of shapes to restore
   */
  restoreFromShapes(shapes: Shape[]): void {
    this.shapes = [...shapes];
    this.saveToHistory();
  }
}
