

const server = Bun.serve({
    port: 8080,
    fetch(req, server) {
      if (server.upgrade(req)) {
        return; 
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {
            const data = JSON.parse(message as string);
            if (data.type == "ping") {
                ws.send(JSON.stringify({ type: "pong", data: data.data }));
            } else if (data.type == "pong") {
                console.log("pong", data.data);
            }
        },
        open(ws) {
            console.log("client connected",ws.remoteAddress);
        },
        close(ws) {
            console.log("client disconnected",ws.remoteAddress);
        }
    },
  });

  console.log(`Listening on ${server.hostname}:${server.port}`);