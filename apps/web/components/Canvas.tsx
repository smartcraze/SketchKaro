"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon, Eraser } from "lucide-react";
import { Game } from "@/draw/Games";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; 

export type Tool = "circle" | "rect" | "pencil" | "eraser";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
      <ToggleGroup
        type="single"
        value={selectedTool}
        onValueChange={(value: Tool) => {
          if (value) setSelectedTool(value);
        }}
        className="bg-muted border rounded-xl p-1 flex gap-2 shadow-md"
      >
        <ToggleGroupItem value="pencil" aria-label="Pencil">
          <Pencil className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="rect" aria-label="Rectangle">
          <RectangleHorizontalIcon className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="circle" aria-label="Circle">
          <Circle className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="eraser" aria-label="Eraser">
          <Eraser className="h-5 w-5" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
