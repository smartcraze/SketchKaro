import { Tool, Shape, DrawingState, CursorPosition } from "./types";
import { CanvasRenderer } from "./CanvasRenderer";
import { ShapeManager } from "./ShapeManager";
import { getExistingShapes } from "@/draw/http";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: CanvasRenderer;
  private shapeManager: ShapeManager;
  private roomId: string;
  private socket: WebSocket;

  // Drawing state
  private selectedTool: Tool = "circle";
  private selectedColor: string = "#ffffff";
  private strokeWidth: number = 2;
  private fontSize: number = 16;

  // Current drawing state
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private isDrawing = false;
  private currentPath: { x: number; y: number }[] = [];
  private lastPoint: { x: number; y: number } | null = null;

  // Cursor tracking
  private userCursors = new Map<string, CursorPosition>();
  private currentUserId: string | null = null;
  public onCursorUpdate?: (
    cursors: Map<string, CursorPosition>,
    userId: string | null
  ) => void;
  private lastCursorSend = 0;
  private cursorSendThrottle = 50; // ms

  // Touch and zoom support
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private lastTouchDistance = 0;
  private touchStartPoints: { x: number; y: number }[] = [];
  private isPanning = false;
  private lastPanPoint = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;

    // Initialize modular components
    this.renderer = new CanvasRenderer(canvas, this.ctx);
    this.shapeManager = new ShapeManager();

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("touchstart", this.touchStartHandler);
    this.canvas.removeEventListener("touchend", this.touchEndHandler);
    this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
  }

  // Public API methods
  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  setColor(color: string) {
    this.selectedColor = color;
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }

  setFontSize(size: number) {
    this.fontSize = size;
  }

  addText(text: string, x: number, y: number) {
    const textShape: Shape = {
      type: "text",
      x,
      y,
      text,
      color: this.selectedColor,
      fontSize: this.fontSize,
    };

    this.shapeManager.addShape(textShape);
    this.sendShapeToServer(textShape);
    this.clearCanvas();
  }

  clearCanvas() {
    this.renderer.renderAll(this.shapeManager.getAllShapes());
    // Reapply current transform after rendering
    this.applyTransform();
  }

  clearAll() {
    this.shapeManager.clearAll();
    this.sendClearToServer();
    this.clearCanvas();
  }

  undo() {
    if (this.shapeManager.undo()) {
      this.clearCanvas();
      return true;
    }
    return false;
  }

  redo() {
    if (this.shapeManager.redo()) {
      this.clearCanvas();
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.shapeManager.canUndo();
  }

  canRedo(): boolean {
    return this.shapeManager.canRedo();
  }

  // Method to render canvas content for PNG export
  renderForExport() {
    this.renderer.renderAllForExport(this.shapeManager.getAllShapes());
    // Reapply current transform after export rendering
    this.applyTransform();
  }

  // Get all shapes for export
  getAllShapes() {
    return this.shapeManager.getAllShapes();
  }

  zoom(factor: number) {
    const newScale = Math.max(0.5, Math.min(3, this.scale * factor));
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    this.offsetX += centerX * (1 - factor);
    this.offsetY += centerY * (1 - factor);
    this.scale = newScale;

    this.applyTransform();
    this.clearCanvas();
  }

  resetZoom() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.applyTransform();
    this.clearCanvas();
  }

  // Private helper methods
  private applyTransform() {
    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.offsetX,
      this.offsetY
    );
  }

  private sendShapeToServer(shape: Shape) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  }

  private sendClearToServer() {
    this.socket.send(
      JSON.stringify({
        type: "clear_all",
        roomId: this.roomId,
      })
    );
  }

  private async init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    try {
      const existingShapes = await getExistingShapes(this.roomId);
      if (existingShapes && existingShapes.length > 0) {
        this.shapeManager.restoreFromShapes(existingShapes);
      }
    } catch (error) {
      console.log("No existing shapes found or error loading:", error);
    }

    this.clearCanvas();
  }

  private initHandlers() {
    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // Handle direct clear_all message from server
      if (data.type === "clear_all") {
        console.log("Received clear_all command from server");
        this.shapeManager.clearAll();
        this.clearCanvas();
        return;
      }

      if (data.type === "chat") {
        const parsedMessage = JSON.parse(data.message);

        if (parsedMessage.type === "cursor") {
          const { userId, x, y, color, name } = parsedMessage;
          if (userId && userId !== this.currentUserId) {
            this.userCursors.set(userId, {
              x,
              y,
              color: color || "#ffffff",
              name: name || `User ${userId.slice(-4)}`,
            });
            if (this.onCursorUpdate) {
              this.onCursorUpdate(this.userCursors, this.currentUserId);
            }
          }
          return;
        }

        if (parsedMessage.type === "user_joined") {
          this.currentUserId = parsedMessage.userId;
          return;
        }

        if (parsedMessage.type === "clear_all") {
          this.shapeManager.clearAll();
        } else if (parsedMessage.shape) {
          this.shapeManager.addShape(parsedMessage.shape);
        }

        this.clearCanvas();
      }
    });
  }

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("touchstart", this.touchStartHandler, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this.touchEndHandler, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.touchMoveHandler, {
      passive: false,
    });
  }

  // Simplified drawing methods - focusing on core functionality
  private drawSmoothPath(path: { x: number; y: number }[]) {
    if (path.length < 2) return;

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

  // Event handlers
  private mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    // Convert to canvas coordinates and account for current transform
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Convert screen coordinates to canvas coordinates considering current transform
    this.startX = (rawX - this.offsetX) / this.scale;
    this.startY = (rawY - this.offsetY) / this.scale;

    if (this.selectedTool === "pencil") {
      this.isDrawing = true;
      this.currentPath = [{ x: this.startX, y: this.startY }];
      this.lastPoint = { x: this.startX, y: this.startY };
    } else if (this.selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        this.addText(text, this.startX, this.startY);
      }
      this.clicked = false;
    } else if (this.selectedTool === "eraser") {
      // For eraser, we'll treat it similar to pencil but will remove shapes
      this.isDrawing = true;
      this.currentPath = [{ x: this.startX, y: this.startY }];
      this.lastPoint = { x: this.startX, y: this.startY };
    }
    // For rect and circle, we just set clicked = true and handle preview in mouseMoveHandler
  };

  private mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Convert screen coordinates to canvas coordinates considering current transform
    const currentX = (rawX - this.offsetX) / this.scale;
    const currentY = (rawY - this.offsetY) / this.scale;

    if (this.selectedTool === "pencil" && this.isDrawing) {
      this.isDrawing = false;
      if (this.currentPath.length > 1) {
        const shape: Shape = {
          type: "pencil",
          startX: this.currentPath[0].x,
          startY: this.currentPath[0].y,
          endX: this.currentPath[this.currentPath.length - 1].x,
          endY: this.currentPath[this.currentPath.length - 1].y,
          color: this.selectedColor,
          strokeWidth: this.strokeWidth,
          path: this.currentPath,
        };
        this.shapeManager.addShape(shape);
        this.sendShapeToServer(shape);
      }
      this.currentPath = [];
      this.lastPoint = null;
      this.clearCanvas();
      return;
    }

    if (this.selectedTool === "eraser" && this.isDrawing) {
      this.isDrawing = false;
      // For now, eraser will clear everything in the path area
      // This is a simple implementation - could be enhanced to only erase overlapping shapes
      this.currentPath = [];
      this.lastPoint = null;
      this.clearCanvas();
      return;
    }

    // Handle other shapes
    if (
      this.selectedTool !== "pencil" &&
      this.selectedTool !== "text" &&
      this.selectedTool !== "eraser"
    ) {
      let shape: Shape | null = null;

      if (this.selectedTool === "rect") {
        const width = currentX - this.startX;
        const height = currentY - this.startY;
        shape = {
          type: "rect",
          x: Math.min(this.startX, currentX),
          y: Math.min(this.startY, currentY),
          width: Math.abs(width),
          height: Math.abs(height),
          color: this.selectedColor,
          strokeWidth: this.strokeWidth,
        };
      } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(currentX - this.startX, 2) +
            Math.pow(currentY - this.startY, 2)
        );
        shape = {
          type: "circle",
          centerX: this.startX,
          centerY: this.startY,
          radius,
          color: this.selectedColor,
          strokeWidth: this.strokeWidth,
        };
      }

      if (shape) {
        this.shapeManager.addShape(shape);
        this.sendShapeToServer(shape);
        this.clearCanvas();
      }
    }
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // For cursor tracking, use screen coordinates
    const cursorX = rawX;
    const cursorY = rawY;

    // For drawing, use canvas coordinates
    const currentX = (rawX - this.offsetX) / this.scale;
    const currentY = (rawY - this.offsetY) / this.scale;

    // Handle cursor tracking
    const now = Date.now();
    if (now - this.lastCursorSend > this.cursorSendThrottle) {
      this.lastCursorSend = now;
      this.socket.send(
        JSON.stringify({
          type: "cursor",
          roomId: this.roomId,
          x: cursorX,
          y: cursorY,
          userId: this.currentUserId,
          color: this.selectedColor,
          name: `User ${this.currentUserId?.slice(-4) || "Unknown"}`,
        })
      );
    }

    if (this.clicked) {
      if (
        (this.selectedTool === "pencil" || this.selectedTool === "eraser") &&
        this.isDrawing
      ) {
        const currentPoint = { x: currentX, y: currentY };
        if (this.lastPoint) {
          const distance = Math.sqrt(
            Math.pow(currentPoint.x - this.lastPoint.x, 2) +
              Math.pow(currentPoint.y - this.lastPoint.y, 2)
          );

          if (distance > 2) {
            this.currentPath.push(currentPoint);
            this.lastPoint = currentPoint;

            this.clearCanvas();
            if (this.currentPath.length > 1) {
              this.ctx.strokeStyle = this.selectedColor;
              this.ctx.lineWidth = this.strokeWidth;
              this.drawSmoothPath(this.currentPath);
            }
          }
        }
      } else if (
        this.selectedTool === "rect" ||
        this.selectedTool === "circle"
      ) {
        // Show preview while dragging
        this.clearCanvas();

        // Draw preview shape
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.strokeWidth;

        if (this.selectedTool === "rect") {
          const width = currentX - this.startX;
          const height = currentY - this.startY;
          this.ctx.strokeRect(
            Math.min(this.startX, currentX),
            Math.min(this.startY, currentY),
            Math.abs(width),
            Math.abs(height)
          );
        } else if (this.selectedTool === "circle") {
          const radius = Math.sqrt(
            Math.pow(currentX - this.startX, 2) +
              Math.pow(currentY - this.startY, 2)
          );
          this.ctx.beginPath();
          this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    }
  };

  // Touch handlers (simplified)
  private touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseDownHandler({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    }
  };

  private touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    this.isPanning = false;
    this.lastTouchDistance = 0;
    this.touchStartPoints = [];
    this.lastPanPoint = { x: 0, y: 0 };
  };

  private touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.mouseMoveHandler({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    }
  };

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }
}
