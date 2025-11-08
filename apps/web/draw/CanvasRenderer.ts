import { Shape, Viewport } from "./types";

/**
 * Renders shapes on HTML canvas with viewport transformations
 * Handles rendering of different shape types: rectangles, circles, pencil strokes, text, and eraser marks
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw an infinite grid background
   * Shows the infinite nature of the canvas with scaling support
   * @param viewport - Current viewport state including scale and offset
   */
  drawGrid(viewport: Viewport): void {
    const { scale, x: offsetX, y: offsetY } = viewport;
    const gridSize = 50;
    const scaledGridSize = gridSize * scale;

    if (scaledGridSize < 10 || scaledGridSize > 100) return;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
    this.ctx.lineWidth = 0.5;

    const startX = Math.floor(-offsetX / scaledGridSize) * scaledGridSize + offsetX;
    const startY = Math.floor(-offsetY / scaledGridSize) * scaledGridSize + offsetY;

    for (let x = startX; x < this.canvas.width + scaledGridSize; x += scaledGridSize) {
      if (x >= -scaledGridSize && x <= this.canvas.width + scaledGridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.round(x), 0);
        this.ctx.lineTo(Math.round(x), this.canvas.height);
        this.ctx.stroke();
      }
    }

    for (let y = startY; y < this.canvas.height + scaledGridSize; y += scaledGridSize) {
      if (y >= -scaledGridSize && y <= this.canvas.height + scaledGridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, Math.round(y));
        this.ctx.lineTo(this.canvas.width, Math.round(y));
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  /**
   * Render a single shape
   * @param shape - The shape to render
   */
  renderShape(shape: Shape): void {
    if (shape.type === "text") {
      this.renderText(shape);
    } else {
      this.renderDrawnShape(shape);
    }
  }

  /**
   * Render text shape
   * @param shape - Text shape to render
   */
  private renderText(shape: Shape & { type: "text" }): void {
    this.ctx.fillStyle = shape.color || "rgba(255, 255, 255)";
    this.ctx.font = `${shape.fontSize || 16}px Arial`;
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(shape.text, shape.x, shape.y);
  }

  /**
   * Render drawn shapes (rectangles, circles, pencil strokes, eraser)
   * @param shape - The shape to render
   */
  private renderDrawnShape(shape: Shape): void {
    if (shape.type === "text") return;

    if (shape.type === "eraser") {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = shape.strokeWidth || 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (shape.path && shape.path.length > 1) {
        this.renderSmoothPath(shape.path);
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      }
      this.ctx.restore();
      return;
    }

    this.ctx.strokeStyle = shape.color || "rgba(255, 255, 255)";
    this.ctx.lineWidth = shape.strokeWidth || 2;

    switch (shape.type) {
      case "rect":
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;

      case "circle":
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
        break;

      case "pencil":
        if (shape.path && shape.path.length > 1) {
          this.renderSmoothPath(shape.path);
        } else {
          this.ctx.beginPath();
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          this.ctx.stroke();
          this.ctx.closePath();
        }
        break;
    }
  }

  /**
   * Render a smooth path using quadratic curves
   * @param path - Array of points defining the path
   */
  private renderSmoothPath(path: { x: number; y: number }[]): void {
    if (path.length < 2) return;

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length - 2; i++) {
      const controlX = (path[i].x + path[i + 1].x) / 2;
      const controlY = (path[i].y + path[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(path[i].x, path[i].y, controlX, controlY);
    }

    if (path.length > 2) {
      this.ctx.quadraticCurveTo(
        path[path.length - 2].x,
        path[path.length - 2].y,
        path[path.length - 1].x,
        path[path.length - 1].y
      );
    }

    this.ctx.stroke();
  }

  /**
   * Render all shapes with viewport transformation
   * @param shapes - Array of shapes to render
   * @param viewport - Optional viewport for transformation
   */
  renderAll(shapes: Shape[], viewport?: Viewport): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (viewport) {
      this.ctx.setTransform(viewport.scale, 0, 0, viewport.scale, viewport.x, viewport.y);
    }

    shapes.forEach((shape) => this.renderShape(shape));
    this.ctx.restore();
  }

  /**
   * Render all shapes for export without transformations
   * Used when exporting canvas to PNG
   * @param shapes - Array of shapes to render
   */
  renderAllForExport(shapes: Shape[]): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    shapes.forEach((shape) => this.renderShape(shape));
    this.ctx.restore();
  }
}
