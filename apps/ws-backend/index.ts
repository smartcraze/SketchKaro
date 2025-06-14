import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import db from "@repo/db"; 
import type { WebSocket } from "bun";


interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users = new Map<WebSocket, User>();

function checkToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId || null;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

const server = Bun.serve({
  port: 8080,  
  fetch(req, server) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 401 });
    }

    const upgraded = server.upgrade(req, {
      data: { token },
    });

    if (!upgraded) {
      return new Response("WebSocket upgrade failed", { status: 500 });
    }
  },

  websocket: {
    open(ws) {
      const { token } = ws.data as { token: string };

      const userId = checkToken(token);
      if (!userId) {
        ws.close(1008, "Invalid or missing token");
        return;
      }
      users.set(ws as unknown as WebSocket, {
        ws: ws as unknown as WebSocket,
        rooms: [],
        userId,
      });

      // Attach userId to data for message handling
      (ws.data as any).userId = userId;

      console.log(`✅ WebSocket connected: ${userId}`);
    },

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
      console.log("parsedData", parsedData);

      switch (parsedData.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong", data: parsedData.data }));
          break;

        case "join_room":
          if (parsedData.roomId && !user.rooms.includes(parsedData.roomId)) {
            user.rooms.push(parsedData.roomId);
            console.log(`${user.userId} joined room ${parsedData.roomId}`);
          }
          break;

        case "leave_room":
          user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
          console.log(`${user.userId} left room ${parsedData.roomId}`);
          break;

        case "chat":
          if (!parsedData.roomId || !parsedData.message) return;
          if (!user.rooms.includes(parsedData.roomId)) return;

          await db.chat.create({
            data: {
              roomId: Number(parsedData.roomId),
              message: parsedData.message,
              userId: user.userId,
            },
          });

          for (const [client, u] of users.entries()) {
            if (u.rooms.includes(parsedData.roomId)) {
              client.send(JSON.stringify({
                type: "chat",
                roomId: parsedData.roomId,
                message: parsedData.message,
                from: user.userId,
              }));
            }
          }
          break;

        default:
          console.warn("Unknown message type:", parsedData.type);
      }
    },

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
