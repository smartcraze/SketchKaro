"use client";

import { WS_URL } from "@/Config";
import { useEffect,  useState } from "react";
import { Canvas } from "./Canvas";
import Chat from "./chat/chat";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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

    const connectWebSocket = () => {
      console.log("🔗 Connecting to WebSocket for room:", roomId, isDemo ? "(demo mode)" : "(authenticated)");
      setConnectionStatus('connecting');
      
      // Create WebSocket URL - include token if available
      const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected, joining room:", roomId);
        setSocket(ws);
        setConnectionStatus('connected');
        setRetryCount(0); // Reset retry count on successful connection
        const data = JSON.stringify({
          type: "join_room",
          roomId,
        });
        ws.send(data);
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setSocket(null);
        setConnectionStatus('disconnected');
        
        // Auto-retry connection if it wasn't intentional and we haven't exceeded max retries
        if (event.code !== 1000 && retryCount < maxRetries) {
          console.log(`🔄 Retrying connection (${retryCount + 1}/${maxRetries}) in 2 seconds...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connectWebSocket();
          }, 2000);
        }
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [token, roomId, retryCount]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const manualRetry = () => {
    setRetryCount(0);
    setConnectionStatus('connecting');
  };

  if (!socket) {
    const isDemo = roomId.startsWith('demo-');
    const needsAuth = !isDemo && !token;
    
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          {needsAuth ? (
            <>
              <div className="text-lg text-muted-foreground">Please sign in to join this room</div>
              <button 
                onClick={() => window.location.href = '/signin'}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            </>
          ) : connectionStatus === 'error' ? (
            <>
              <div className="text-lg font-medium">Connection Failed</div>
              <div className="text-sm text-muted-foreground">
                WebSocket server is not running on port 8080
              </div>
              <button 
                onClick={manualRetry}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Retry Connection
              </button>
            </>
          ) : connectionStatus === 'disconnected' && retryCount >= maxRetries ? (
            <>
              <div className="text-lg font-medium">Connection Lost</div>
              <div className="text-sm text-muted-foreground">
                Unable to connect after {maxRetries} attempts
              </div>
              <button 
                onClick={manualRetry}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
              <div className="text-sm text-muted-foreground">
                {connectionStatus === 'connecting' ? 
                  (isDemo ? "Connecting to demo..." : "Connecting to room...") :
                  "Reconnecting..."
                }
              </div>
              {retryCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  Attempt {retryCount}/{maxRetries}
                </div>
              )}
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
