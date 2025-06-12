import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

const server = Bun.serve({
    port: 8080,
    fetch(req, server) {
        if (server.upgrade(req, { data: { url: req.url } })) {
            return; // WebSocket upgrade accepted
          }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      open(ws) {
        // Access the upgrade request URL from ws.data
        const url = new URL(ws.data as string); // we’ll set this in `fetch()`
        const token = url.searchParams.get("token");
        const decoded = jwt.verify(token as string, JWT_SECRET) as { userId: string };
  
        if (!decoded.userId) {
          ws.close(1008, "Missing token"); // 1008 = policy violation
          return;
        }
  
        console.log("WebSocket opened with token:", token);
      },
  
      message(ws, message) {
        const data = JSON.parse(message as string);
  
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", data: data.data }));
        } else if (data.type === "pong") {
          console.log("pong", data.data);
        }
      },
  
      close(ws) {
        console.log("client disconnected", ws.remoteAddress);
      },
    },
  });
  

  
  console.log(`Listening on ${server.hostname}:${server.port}`);
  