import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import db from "@repo/db";
import type { WebSocket } from "bun";
import { getNameFromUserId } from "./chatmessage";

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  color?: string;
  name: string;
}

const users = new Map<WebSocket, User>();

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT authentication token
 * @returns User ID if token is valid, null otherwise
 */
function checkToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId || null;
  } catch (err) {
    console.error("JWT verification error:", err);
    return null;
  }
}

/**
 * WebSocket server for real-time collaborative drawing
 * Handles connections, authentication, room management, and message broadcasting
 */
const server = Bun.serve({
  port: 8080,
  fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const token = url.searchParams.get("token");

    const upgraded = server.upgrade(req, {
      data: { token: token || null },
    });

    if (!upgraded) {
      return new Response("WebSocket upgrade failed", { status: 500 });
    }
  },

  websocket: {
    /**
     * Handle new WebSocket connection
     * Authenticates user and initializes connection state
     */
    async open(ws) {
      const { token } = ws.data as { token: string | null };

      let userId: string | null = null;
      let name: string = "Anonymous";

      if (token) {
        userId = checkToken(token);
        if (!userId) {
          ws.close(1008, "Invalid token");
          return;
        }
        name = await getNameFromUserId(userId);
      } else {
        userId = `demo-user-${Math.random().toString(36).substr(2, 9)}`;
        name = `Demo User ${userId.slice(-4)}`;
        console.log(`🎭 Demo user connected: ${userId}`);
      }

      users.set(ws as unknown as WebSocket, {
        ws: ws as unknown as WebSocket,
        rooms: [],
        userId,
        name
      });

      (ws.data as any).userId = userId;
      (ws.data as any).name = name;

      console.log(`✅ WebSocket connected: ${userId}`);
    },

    /**
     * Handle incoming WebSocket messages
     * Routes messages based on type: ping, join_room, leave_room, chat, chat_message, clear_all
     */
    async message(ws, message) {
      const user = users.get(ws as unknown as WebSocket);
      if (!user) {
        console.warn("User not found for message");
        return;
      }

      let parsedData: any;
      try {
        parsedData = JSON.parse(message as string);
      } catch (err) {
        console.error("Invalid JSON from client:", message);
        return;
      }

      switch (parsedData.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong", data: parsedData.data }));
          break;

        case "join_room":
          if (parsedData.roomId && !user.rooms.includes(parsedData.roomId)) {
            user.rooms.push(parsedData.roomId);
            console.log(`${user.userId} joined room ${parsedData.roomId}`);
          }
          ws.subscribe(parsedData.roomId);
          break;

        case "leave_room":
          user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
          console.log(`${user.userId} left room ${parsedData.roomId}`);
          break;

        case "chat":
          if (!parsedData.roomId || !parsedData.message) {
            console.warn("Chat message missing roomId or message");
            return;
          }
          if (!user.rooms.includes(parsedData.roomId)) {
            console.warn(`User ${user.userId} not in room ${parsedData.roomId}`);
            return;
          }

          try {
            await db.drawing.create({
              data: {
                roomId: Number(parsedData.roomId),
                message: parsedData.message,
                userId: user.userId,
              },
            });

            for (const [client, u] of users.entries()) {
              if (u.rooms.includes(parsedData.roomId)) {
                client.send(
                  JSON.stringify({
                    type: "chat",
                    roomId: parsedData.roomId,
                    message: parsedData.message,
                    from: user.userId,
                  })
                );
              }
            }
          } catch (error) {
            console.error("Error saving drawing message:", error);
          }
          break;
        
        case "chat_message":
          if (!parsedData.roomId || !parsedData.message) {
            console.warn("Chat message missing roomId or message");
            return;
          }
          if (!user.rooms.includes(parsedData.roomId)) {
            console.warn(`User ${user.userId} not in room ${parsedData.roomId}`);
            return;
          }

          const isDemo = parsedData.roomId.startsWith('demo-');
          
          if (!isDemo && !user.userId.startsWith('demo-user-')) {
            try {
              await db.chatMessage.create({
                data: {
                  roomId: Number(parsedData.roomId),
                  message: parsedData.message,
                  userId: user.userId,
                },
              });
            } catch (error) {
              console.error("Error saving chat message to database:", error);
            }
          }

          server.publish(
            parsedData.roomId,
            JSON.stringify({
              type: "chat_message",
              roomId: parsedData.roomId,
              message: parsedData.message,
              from: user.userId,
              name: user.name,
            })
          );
          break;

        case "clear_all":
          if (!parsedData.roomId) {
            console.warn("Clear all missing roomId");
            return;
          }
          if (!user.rooms.includes(parsedData.roomId)) {
            console.warn(`User ${user.userId} not in room ${parsedData.roomId}`);
            return;
          }

          try {
            await db.drawing.deleteMany({
              where: {
                roomId: Number(parsedData.roomId),
              },
            });

            console.log(`🧹 Cleared all drawings for room ${parsedData.roomId} by user ${user.userId}`);

            for (const [client, u] of users.entries()) {
              if (u.rooms.includes(parsedData.roomId)) {
                client.send(
                  JSON.stringify({
                    type: "clear_all",
                    roomId: parsedData.roomId,
                    from: user.userId,
                  })
                );
              }
            }
          } catch (error) {
            console.error("Error clearing room data:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Failed to clear canvas",
              })
            );
          }
          break;

        default:
          console.warn("Unknown message type:", parsedData.type);
      }
    },

    /**
     * Handle WebSocket disconnection
     * Cleanup user data and notify other users
     */
    close(ws) {
      const user = users.get(ws as unknown as WebSocket);
      if (user) {
        console.log(`❌ Disconnected: ${user.userId}`);
        users.delete(ws as unknown as WebSocket);
      }
    },
  },
});

console.log(`🔥 WebSocket server running at ws://${server.hostname}:${server.port}`);
