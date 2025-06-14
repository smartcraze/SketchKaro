import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "@/draw/http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private eraserRadius = 10; // Size of the eraser

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedMessage = JSON.parse(message.message);
                
                if (parsedMessage.type === "erase") {
                    // Remove the erased shape
                    this.existingShapes = this.existingShapes.filter(shape => 
                        !(shape.type === parsedMessage.shape.type &&
                        JSON.stringify(shape) === JSON.stringify(parsedMessage.shape))
                    );
                } else {
                    // Add new shape
                    this.existingShapes.push(parsedMessage.shape);
                }
                
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    };

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;

        if (selectedTool === "eraser") {
            // Find and remove shapes that intersect with the eraser path
            const shapesToRemove = this.existingShapes.filter(shape => {
                if (shape.type === "rect") {
                    return this.rectIntersectsEraser(shape, this.startX, this.startY, e.clientX, e.clientY);
                } else if (shape.type === "circle") {
                    return this.circleIntersectsEraser(shape, this.startX, this.startY, e.clientX, e.clientY);
                } else if (shape.type === "pencil") {
                    return this.lineIntersectsEraser(shape, this.startX, this.startY, e.clientX, e.clientY);
                }
                return false;
            });

            // Remove the shapes
            this.existingShapes = this.existingShapes.filter(shape => !shapesToRemove.includes(shape));

            // Notify other users about the erased shapes
            shapesToRemove.forEach(shape => {
                this.socket.send(
                    JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ 
                            type: "erase",
                            shape 
                        }),
                        roomId: this.roomId,
                    })
                );
            });
        } else {
            if (selectedTool === "rect") {
                shape = {
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    width,
                    height,
                };
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                shape = {
                    type: "circle",
                    radius,
                    centerX: this.startX + radius,
                    centerY: this.startY + radius,
                };
            } else if (selectedTool === "pencil") {
                shape = {
                    type: "pencil",
                    startX: this.startX,
                    startY: this.startY,
                    endX: e.clientX,
                    endY: e.clientY,
                };
            }

            if (!shape) return;

            this.existingShapes.push(shape);

            this.socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId,
                })
            );
        }

        this.clearCanvas();
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)";

            const selectedTool = this.selectedTool;

            if (selectedTool === "eraser") {
                // Draw eraser preview
                this.ctx.beginPath();
                this.ctx.arc(e.clientX, e.clientY, this.eraserRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (selectedTool === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    // Helper methods for eraser intersection detection
    private rectIntersectsEraser(rect: Shape & { type: "rect" }, startX: number, startY: number, endX: number, endY: number): boolean {
        const eraserPath = {
            x1: Math.min(startX, endX),
            y1: Math.min(startY, endY),
            x2: Math.max(startX, endX),
            y2: Math.max(startY, endY)
        };

        return !(
            eraserPath.x2 + this.eraserRadius < rect.x ||
            eraserPath.x1 - this.eraserRadius > rect.x + rect.width ||
            eraserPath.y2 + this.eraserRadius < rect.y ||
            eraserPath.y1 - this.eraserRadius > rect.y + rect.height
        );
    }

    private circleIntersectsEraser(circle: Shape & { type: "circle" }, startX: number, startY: number, endX: number, endY: number): boolean {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate distance from circle center to line segment
        const t = Math.max(0, Math.min(1, ((circle.centerX - startX) * dx + (circle.centerY - startY) * dy) / (length * length)));
        const closestX = startX + t * dx;
        const closestY = startY + t * dy;
        
        const distance = Math.sqrt(
            Math.pow(circle.centerX - closestX, 2) + 
            Math.pow(circle.centerY - closestY, 2)
        );
        
        return distance <= circle.radius + this.eraserRadius;
    }

    private lineIntersectsEraser(line: Shape & { type: "pencil" }, startX: number, startY: number, endX: number, endY: number): boolean {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate distance from line segment to eraser path
        const t1 = Math.max(0, Math.min(1, ((line.startX - startX) * dx + (line.startY - startY) * dy) / (length * length)));
        const t2 = Math.max(0, Math.min(1, ((line.endX - startX) * dx + (line.endY - startY) * dy) / (length * length)));
        
        const closest1X = startX + t1 * dx;
        const closest1Y = startY + t1 * dy;
        const closest2X = startX + t2 * dx;
        const closest2Y = startY + t2 * dy;
        
        const distance1 = Math.sqrt(
            Math.pow(line.startX - closest1X, 2) + 
            Math.pow(line.startY - closest1Y, 2)
        );
        
        const distance2 = Math.sqrt(
            Math.pow(line.endX - closest2X, 2) + 
            Math.pow(line.endY - closest2Y, 2)
        );
        
        return distance1 <= this.eraserRadius || distance2 <= this.eraserRadius;
    }
}
