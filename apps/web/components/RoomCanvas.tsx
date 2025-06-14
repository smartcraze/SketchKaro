"use client";

import { WS_URL } from "@/Config";
import { initDraw } from "@/draw/index";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYThmNjQ2NC00YThhLTRmZDYtOTQ0MS1hOGJjZDgyOGMzMTgiLCJpYXQiOjE3NDk4OTU5ODF9.b5mowhDPyeO75LpdFaXjy4Hm-Fxw6fNlhsI0uZwbWAY`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}