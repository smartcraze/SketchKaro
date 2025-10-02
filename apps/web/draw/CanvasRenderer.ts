import { Shape } from "./types";

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

  renderAll(shapes: Shape[]) {
    this.clear();
    shapes.forEach((shape) => this.renderShape(shape));
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
