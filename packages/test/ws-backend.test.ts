import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

const WS_URL = "ws://localhost:8080";
const TEST_USER_ID = "test-user-123";
const TEST_ROOM_ID = "demo-test-room";

/**
 * WebSocket Backend Test Suite
 * Tests WebSocket server functionality including:
 * - Authentication
 * - Room management
 * - Message broadcasting
 * - Chat functionality
 * - Canvas clearing
 */
describe("WebSocket Server", () => {
  let validToken: string;

  beforeAll(async () => {
    // Generate a valid JWT token for testing
    validToken = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET);

    // Wait a bit to ensure server is ready
    await Bun.sleep(1000);
  });

  describe("Health Check", () => {
    test("should return healthy status", async () => {
      const response = await fetch("http://localhost:8080/health");
      expect(response.status).toBe(200);
      
      const data = await response.json() as { status: string; timestamp: string };
      expect(data.status).toBe("healthy");
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("Authentication", () => {
    test("should connect with valid token", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          ws.close();
          resolve();
        };
        ws.onerror = (error) => reject(error);
      });
    });

    test("should connect without token (demo mode)", async () => {
      const ws = new WebSocket(WS_URL);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          ws.close();
          resolve();
        };
        ws.onerror = (error) => reject(error);
      });
    });

    test("should reject invalid token", async () => {
      const invalidToken = "invalid.token.here";
      const ws = new WebSocket(`${WS_URL}?token=${invalidToken}`);
      
      await new Promise<void>((resolve) => {
        ws.onclose = (event) => {
          expect(event.code).toBe(1008); // Policy violation
          expect(event.reason).toBe("Invalid token");
          resolve();
        };
      });
    });
  });

  describe("Ping/Pong", () => {
    test("should respond to ping messages", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "ping", data: { timestamp: Date.now() } }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as { type: string; data: any };
          expect(data.type).toBe("pong");
          expect(data.data).toBeDefined();
          ws.close();
          resolve();
        };

        ws.onerror = (error) => reject(error);
      });
    });
  });

  describe("Room Management", () => {
    test("should join a room", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ 
            type: "join_room", 
            roomId: TEST_ROOM_ID 
          }));
          
          // Wait a bit then close
          setTimeout(() => {
            ws.close();
            resolve();
          }, 500);
        };

        ws.onerror = (error) => reject(error);
      });
    });

    test("should leave a room", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          // First join
          ws.send(JSON.stringify({ 
            type: "join_room", 
            roomId: TEST_ROOM_ID 
          }));
          
          // Then leave
          setTimeout(() => {
            ws.send(JSON.stringify({ 
              type: "leave_room", 
              roomId: TEST_ROOM_ID 
            }));
          }, 200);
          
          setTimeout(() => {
            ws.close();
            resolve();
          }, 500);
        };

        ws.onerror = (error) => reject(error);
      });
    });
  });

  describe("Message Broadcasting", () => {
    test("should broadcast drawing messages to room members", async () => {
      const ws1 = new WebSocket(`${WS_URL}?token=${validToken}`);
      const ws2 = new WebSocket(WS_URL); // Demo user
      
      const roomId = `demo-broadcast-test-${Date.now()}`;
      const testMessage = { type: "draw", action: "line", x: 10, y: 20 };

      await new Promise<void>((resolve, reject) => {
        let ws1Ready = false;
        let ws2Ready = false;
        
        const checkReady = () => {
          if (ws1Ready && ws2Ready) {
            // Both connected, join room
            ws1.send(JSON.stringify({ type: "join_room", roomId }));
            ws2.send(JSON.stringify({ type: "join_room", roomId }));
            
            // Send drawing message from ws1
            setTimeout(() => {
              ws1.send(JSON.stringify({ 
                type: "chat", 
                roomId, 
                message: testMessage 
              }));
            }, 300);
          }
        };

        ws1.onopen = () => {
          ws1Ready = true;
          checkReady();
        };

        ws2.onopen = () => {
          ws2Ready = true;
          checkReady();
        };

        let messageReceived = false;
        ws2.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as { 
            type: string; 
            roomId: string; 
            message: any; 
            from: string 
          };
          if (data.type === "chat" && data.roomId === roomId && !messageReceived) {
            messageReceived = true;
            expect(data.message).toEqual(testMessage);
            expect(data.from).toBe(TEST_USER_ID);
            ws1.close();
            ws2.close();
            resolve();
          }
        };

        ws1.onerror = ws2.onerror = (error) => reject(error);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!messageReceived) {
            ws1.close();
            ws2.close();
            reject(new Error("Test timeout: message not received"));
          }
        }, 5000);
      });
    });

    test("should broadcast chat messages to room members", async () => {
      const ws1 = new WebSocket(`${WS_URL}?token=${validToken}`);
      const ws2 = new WebSocket(WS_URL);
      
      const roomId = `demo-chat-test-${Date.now()}`;
      const chatMessage = "Hello, World!";

      await new Promise<void>((resolve, reject) => {
        let ws1Ready = false;
        let ws2Ready = false;
        
        const checkReady = () => {
          if (ws1Ready && ws2Ready) {
            ws1.send(JSON.stringify({ type: "join_room", roomId }));
            ws2.send(JSON.stringify({ type: "join_room", roomId }));
            
            setTimeout(() => {
              ws1.send(JSON.stringify({ 
                type: "chat_message", 
                roomId, 
                message: chatMessage 
              }));
            }, 300);
          }
        };

        ws1.onopen = () => {
          ws1Ready = true;
          checkReady();
        };

        ws2.onopen = () => {
          ws2Ready = true;
          checkReady();
        };

        let messageReceived = false;
        ws2.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as { 
            type: string; 
            roomId: string; 
            message: string; 
            from: string;
            name: string;
          };
          if (data.type === "chat_message" && data.roomId === roomId && !messageReceived) {
            messageReceived = true;
            expect(data.message).toBe(chatMessage);
            expect(data.from).toBe(TEST_USER_ID);
            expect(data.name).toBeDefined();
            ws1.close();
            ws2.close();
            resolve();
          }
        };

        ws1.onerror = ws2.onerror = (error) => reject(error);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!messageReceived) {
            ws1.close();
            ws2.close();
            reject(new Error("Test timeout: message not received"));
          }
        }, 5000);
      });
    });
  });

  describe("Clear Canvas", () => {
    test("should broadcast clear_all to room members", async () => {
      const ws1 = new WebSocket(`${WS_URL}?token=${validToken}`);
      const ws2 = new WebSocket(WS_URL);
      
      const roomId = `demo-clear-test-${Date.now()}`;

      await new Promise<void>((resolve, reject) => {
        let ws1Ready = false;
        let ws2Ready = false;
        
        const checkReady = () => {
          if (ws1Ready && ws2Ready) {
            ws1.send(JSON.stringify({ type: "join_room", roomId }));
            ws2.send(JSON.stringify({ type: "join_room", roomId }));
            
            setTimeout(() => {
              ws1.send(JSON.stringify({ 
                type: "clear_all", 
                roomId 
              }));
            }, 300);
          }
        };

        ws1.onopen = () => {
          ws1Ready = true;
          checkReady();
        };

        ws2.onopen = () => {
          ws2Ready = true;
          checkReady();
        };

        let messageReceived = false;
        ws2.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as { 
            type: string; 
            roomId: string; 
            from: string 
          };
          if (data.type === "clear_all" && data.roomId === roomId && !messageReceived) {
            messageReceived = true;
            expect(data.from).toBe(TEST_USER_ID);
            ws1.close();
            ws2.close();
            resolve();
          }
        };

        ws1.onerror = ws2.onerror = (error) => reject(error);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!messageReceived) {
            ws1.close();
            ws2.close();
            reject(new Error("Test timeout: message not received"));
          }
        }, 5000);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid JSON", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send("invalid json {{{");
          
          // Should not crash, just log error
          setTimeout(() => {
            expect(ws.readyState).toBe(WebSocket.OPEN);
            ws.close();
            resolve();
          }, 500);
        };

        ws.onerror = (error) => reject(error);
      });
    });

    test("should handle unknown message type", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "unknown_type", data: {} }));
          
          setTimeout(() => {
            expect(ws.readyState).toBe(WebSocket.OPEN);
            ws.close();
            resolve();
          }, 500);
        };

        ws.onerror = (error) => reject(error);
      });
    });

    test("should not send chat without joining room", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        let receivedMessage = false;
        
        ws.onopen = () => {
          ws.send(JSON.stringify({ 
            type: "chat", 
            roomId: "not-joined-room", 
            message: { test: true } 
          }));
          
          setTimeout(() => {
            expect(receivedMessage).toBe(false);
            ws.close();
            resolve();
          }, 500);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as { type: string };
          if (data.type === "chat") {
            receivedMessage = true;
          }
        };

        ws.onerror = (error) => reject(error);
      });
    });
  });

  describe("Connection Cleanup", () => {
    test("should handle disconnection gracefully", async () => {
      const ws = new WebSocket(`${WS_URL}?token=${validToken}`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join_room", roomId: TEST_ROOM_ID }));
          
          setTimeout(() => {
            ws.close();
          }, 200);
        };

        ws.onclose = () => {
          expect(ws.readyState).toBe(WebSocket.CLOSED);
          resolve();
        };

        ws.onerror = (error) => reject(error);
      });
    });
  });
});
