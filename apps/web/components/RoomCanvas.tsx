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
    // For demo rooms, we can proceed without a token
    // For regular rooms, we need a token
    const isDemo = roomId.startsWith('demo-');
    
    if (!isDemo && !token) {
      console.log("⏳ Waiting for token for regular room:", roomId);
      return; // Wait for token to be available for regular rooms
    }

    console.log("🔗 Connecting to WebSocket for room:", roomId, isDemo ? "(demo mode)" : "(authenticated)");
    
    // Create WebSocket URL - include token if available
    const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
    const ws = new WebSocket(wsUrl);

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
    const isDemo = roomId.startsWith('demo-');
    const needsAuth = !isDemo && !token;
    
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          {needsAuth ? (
            <>
              <div className="text-lg text-muted-foreground">Please sign in to join this room</div>
              <button 
                onClick={() => window.location.href = '/signin'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-lg text-muted-foreground">
                {isDemo ? "Connecting to demo session..." : "Connecting to room..."}
              </div>
            </>
          )}
        </div>
      </div>
    );
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
