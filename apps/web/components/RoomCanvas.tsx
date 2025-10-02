"use client";

import { WS_URL } from "@/Config";
import { useEffect,  useState } from "react";
import { Canvas } from "./Canvas";
import Chat from "./chat/chat";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    // Get token from cookies on client side
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      setToken(cookieToken || null);
    }
  }, []);

  useEffect(() => {
    if (!token) return; // Wait for token to be available

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("✅ WebSocket connected, joining room:", roomId);
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      ws.send(data);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed:", event.code, event.reason);
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [token, roomId]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (!socket) {
    return <div>Connecting to server....</div>;
  }

  return (
    <div className="relative w-full h-full">
      <Canvas roomId={roomId} socket={socket} />
      <Chat 
        socket={socket} 
        roomId={roomId} 
        isOpen={isChatOpen} 
        onToggle={toggleChat} 
      />
    </div>
  );
}
