"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon, Eraser } from "lucide-react";
import { Game } from "@/draw/Games";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

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
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            };
        }
    }, [canvasRef]);

    

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <canvas ref={canvasRef}></canvas>
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
    const handleShare = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(() => {
            toast.success(" Copied to clipboard! Share this with your friend!");
             
        });
    };

    return (
        <>
            {/* Centered Tool Toggle Group */}
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

            {/* Top-Left Share Button */}
            <div className="fixed top-4 right-4 z-10 ">
                <Button
                    onClick={handleShare}
                    className="bg-muted border shadow-md p-2 rounded-xl hover:bg-accent transition"
                    aria-label="Share"
                    variant="outline"
                >
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>
        </>
    );
}
