import { Shape } from "./types";

export class SVGExporter {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  export(shapes: Shape[]): string {
    // Check if we're in the browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn(
        "SVGExporter: document is not available. Cannot export SVG on server side."
      );
      return "";
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", this.canvas.width.toString());
    svg.setAttribute("height", this.canvas.height.toString());
    svg.setAttribute(
      "viewBox",
      `0 0 ${this.canvas.width} ${this.canvas.height}`
    );

    // Add white background
    const background = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "white");
    svg.appendChild(background);

    // Convert shapes to SVG elements
    shapes.forEach((shape) => {
      const svgElement = this.shapeToSVG(shape);
      if (svgElement) {
        svg.appendChild(svgElement);
      }
    });

    // Serialize to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }

  private shapeToSVG(shape: Shape): SVGElement | null {
    // Check if we're in the browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn(
        "SVGExporter: document is not available. Cannot create SVG elements on server side."
      );
      return null;
    }

    const color = ('color' in shape && shape.color) ? shape.color : "#000000";

    switch (shape.type) {
      case "rect":
        const strokeWidth = (shape.strokeWidth || 2).toString();
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", shape.x.toString());
        rect.setAttribute("y", shape.y.toString());
        rect.setAttribute("width", shape.width.toString());
        rect.setAttribute("height", shape.height.toString());
        rect.setAttribute("stroke", color);
        rect.setAttribute("stroke-width", strokeWidth);
        rect.setAttribute("fill", "none");
        return rect;

      case "circle":
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", shape.centerX.toString());
        circle.setAttribute("cy", shape.centerY.toString());
        circle.setAttribute("r", Math.abs(shape.radius).toString());
        circle.setAttribute("stroke", color);
        circle.setAttribute(
          "stroke-width",
          (shape.strokeWidth || 2).toString()
        );
        circle.setAttribute("fill", "none");
        return circle;

      case "pencil":
        if (shape.path && shape.path.length > 1) {
          // Create smooth path
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          let pathData = `M ${shape.path[0].x} ${shape.path[0].y}`;

          for (let i = 1; i < shape.path.length - 2; i++) {
            const controlX = (shape.path[i].x + shape.path[i + 1].x) / 2;
            const controlY = (shape.path[i].y + shape.path[i + 1].y) / 2;
            pathData += ` Q ${shape.path[i].x} ${shape.path[i].y} ${controlX} ${controlY}`;
          }

          if (shape.path.length > 2) {
            const lastIndex = shape.path.length - 1;
            pathData += ` Q ${shape.path[lastIndex - 1].x} ${shape.path[lastIndex - 1].y} ${shape.path[lastIndex].x} ${shape.path[lastIndex].y}`;
          }

          path.setAttribute("d", pathData);
          path.setAttribute("stroke", color);
          path.setAttribute(
            "stroke-width",
            (shape.strokeWidth || 2).toString()
          );
          path.setAttribute("fill", "none");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          return path;
        } else {
          // Fallback to line
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", shape.startX.toString());
          line.setAttribute("y1", shape.startY.toString());
          line.setAttribute("x2", shape.endX.toString());
          line.setAttribute("y2", shape.endY.toString());
          line.setAttribute("stroke", color);
          line.setAttribute(
            "stroke-width",
            (shape.strokeWidth || 2).toString()
          );
          return line;
        }

      case "text":
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", shape.x.toString());
        text.setAttribute("y", shape.y.toString());
        text.setAttribute("fill", color);
        text.setAttribute("font-size", (shape.fontSize || 16).toString());
        text.setAttribute("font-family", "Arial");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.textContent = shape.text;
        return text;

      default:
        return null;
    }
  }
}
