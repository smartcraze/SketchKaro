import { Shape, Viewport } from "./types";

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Don't fill with black - leave transparent for proper export functionality
  }

  // Draw an infinite grid background to show the infinite nature of the canvas
  drawGrid(viewport: Viewport) {
    const { scale, x: offsetX, y: offsetY } = viewport;
    const gridSize = 50; // Base grid size
    const scaledGridSize = gridSize * scale;

    // Only draw grid if it's visible and not too small/large
    if (scaledGridSize < 10 || scaledGridSize > 100) return;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for grid
    this.ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
    this.ctx.lineWidth = 0.5;

    // Calculate grid offset - fix the modulo calculation
    const startX =
      Math.floor(-offsetX / scaledGridSize) * scaledGridSize + offsetX;
    const startY =
      Math.floor(-offsetY / scaledGridSize) * scaledGridSize + offsetY;

    // Draw vertical lines - limit the number of lines
    for (
      let x = startX;
      x < this.canvas.width + scaledGridSize;
      x += scaledGridSize
    ) {
      if (x >= -scaledGridSize && x <= this.canvas.width + scaledGridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.round(x), 0);
        this.ctx.lineTo(Math.round(x), this.canvas.height);
        this.ctx.stroke();
      }
    }

    // Draw horizontal lines - limit the number of lines
    for (
      let y = startY;
      y < this.canvas.height + scaledGridSize;
      y += scaledGridSize
    ) {
      if (y >= -scaledGridSize && y <= this.canvas.height + scaledGridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, Math.round(y));
        this.ctx.lineTo(this.canvas.width, Math.round(y));
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  renderShape(shape: Shape) {
    if (shape.type === "text") {
      this.renderText(shape);
    } else {
      this.renderDrawnShape(shape);
    }
  }

  private renderText(shape: Shape & { type: "text" }) {
    this.ctx.fillStyle = shape.color || "rgba(255, 255, 255)";
    this.ctx.font = `${shape.fontSize || 16}px Arial`;
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(shape.text, shape.x, shape.y);
  }

  private renderDrawnShape(shape: Shape) {
    // Type guard for shapes with strokeWidth
    if (shape.type === "text") return;

    // Handle eraser differently
    if (shape.type === "eraser") {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = shape.strokeWidth || 2; // Use actual stroke width
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (shape.path && shape.path.length > 1) {
        this.renderSmoothPath(shape.path);
      } else {
        // Fallback for legacy straight lines
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
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
        break;

      case "pencil":
        if (shape.path && shape.path.length > 1) {
          this.renderSmoothPath(shape.path);
        } else {
          // Fallback for legacy straight lines
          this.ctx.beginPath();
          this.ctx.moveTo(shape.startX, shape.startY);
          this.ctx.lineTo(shape.endX, shape.endY);
          this.ctx.stroke();
          this.ctx.closePath();
        }
        break;
    }
  }

  private renderSmoothPath(path: { x: number; y: number }[]) {
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

    // Draw the last segment
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

  renderAll(shapes: Shape[], viewport?: Viewport) {
    // Clear the entire canvas first
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Temporarily disable grid to fix visual issues
    // if (viewport) {
    //   this.drawGrid(viewport);
    // }

    // Apply viewport transform for rendering shapes
    if (viewport) {
      this.ctx.setTransform(
        viewport.scale,
        0,
        0,
        viewport.scale,
        viewport.x,
        viewport.y
      );
    }

    // Render all shapes with the transform applied
    shapes.forEach((shape) => this.renderShape(shape));

    this.ctx.restore();
  }

  // Special render method for export that ignores any transforms
  renderAllForExport(shapes: Shape[]) {
    // Save current transform
    this.ctx.save();
    // Reset to identity transform for export
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    shapes.forEach((shape) => this.renderShape(shape));
    // Restore transform
    this.ctx.restore();
  }
}
