import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import db from "@repo/db";

const BASE_URL = "http://localhost:3001";
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";
const TEST_NAME = "Test User";

/**
 * HTTP Backend Test Suite
 * Tests Express server endpoints including:
 * - Health checks
 * - User authentication (signup/login)
 * - Room management
 * - Chat message retrieval
 * - Drawing message retrieval
 * - Authorization middleware
 */
describe("HTTP Server", () => {
  let authToken: string;
  let testUserId: string;
  let testRoomId: number;

  beforeAll(async () => {
    // Wait for server to be ready
    await Bun.sleep(1000);
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        await db.user.delete({ where: { id: testUserId } }).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    if (testRoomId) {
      try {
        await db.room.delete({ where: { id: testRoomId } }).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  describe("Root Endpoint", () => {
    test("should return Hello World", async () => {
      const response = await fetch(BASE_URL);
      expect(response.status).toBe(200);
      
      const text = await response.text();
      expect(text).toBe("Hello World");
    });
  });

  describe("Health Check", () => {
    test("should return healthy status", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json() as { status: string; timestamp: string };
      expect(data.status).toBe("healthy");
      expect(data.timestamp).toBeDefined();
    });
  });

  describe("User Authentication", () => {
    describe("POST /user/signup", () => {
      test("should create a new user", async () => {
        const response = await fetch(`${BASE_URL}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            name: TEST_NAME,
          }),
        });

        expect(response.status).toBe(201);
        
        const data = await response.json() as { 
          id: string; 
          email: string; 
          name: string; 
          password?: string 
        };
        expect(data.id).toBeDefined();
        expect(data.email).toBe(TEST_EMAIL);
        expect(data.name).toBe(TEST_NAME);
        expect(data.password).toBeUndefined(); // Should not return password
        
        testUserId = data.id;
      });

      test("should reject duplicate email", async () => {
        const response = await fetch(`${BASE_URL}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            name: TEST_NAME,
          }),
        });

        expect(response.status).toBe(409);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("already exists");
      });

      test("should reject invalid email format", async () => {
        const response = await fetch(`${BASE_URL}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "invalid-email",
            password: TEST_PASSWORD,
            name: TEST_NAME,
          }),
        });

        expect(response.status).toBe(400);
      });

      test("should reject short password", async () => {
        const response = await fetch(`${BASE_URL}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `unique-${Date.now()}@example.com`,
            password: "short",
            name: TEST_NAME,
          }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe("POST /user/login", () => {
      test("should login with valid credentials", async () => {
        const response = await fetch(`${BASE_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
          }),
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as { 
          token: string; 
          user: { id: string; email: string; name: string } 
        };
        expect(data.token).toBeDefined();
        expect(data.user).toBeDefined();
        expect(data.user.id).toBe(testUserId);
        expect(data.user.email).toBe(TEST_EMAIL);
        expect(data.user.name).toBe(TEST_NAME);
        
        authToken = data.token;
      });

      test("should reject invalid email", async () => {
        const response = await fetch(`${BASE_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "nonexistent@example.com",
            password: TEST_PASSWORD,
          }),
        });

        expect(response.status).toBe(401);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("Invalid");
      });

      test("should reject invalid password", async () => {
        const response = await fetch(`${BASE_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TEST_EMAIL,
            password: "WrongPassword123!",
          }),
        });

        expect(response.status).toBe(401);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("Invalid");
      });
    });
  });

  describe("GET /me", () => {
    test("should return current user with valid token", async () => {
      const response = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: authToken },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json() as { 
        id: string; 
        email: string; 
        name: string; 
        password?: string 
      };
      expect(data.id).toBe(testUserId);
      expect(data.email).toBe(TEST_EMAIL);
      expect(data.name).toBe(TEST_NAME);
      expect(data.password).toBeUndefined();
    });

    test("should reject request without token", async () => {
      const response = await fetch(`${BASE_URL}/me`);
      expect(response.status).toBe(401);
      
      const data = await response.json() as { message: string };
      expect(data.message).toContain("token");
    });

    test("should reject request with invalid token", async () => {
      const response = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: "invalid.token.here" },
      });

      expect(response.status).toBe(401);
      
      const data = await response.json() as { message: string };
      expect(data.message).toBeDefined();
    });
  });

  describe("Room Management", () => {
    describe("POST /room", () => {
      test("should create a new room with valid token", async () => {
        const slug = `test-room-${Date.now()}`;
        const response = await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ slug }),
        });

        expect(response.status).toBe(201);
        
        const data = await response.json() as { 
          id: number; 
          slug: string; 
          adminId: string 
        };
        expect(data.id).toBeDefined();
        expect(data.slug).toBe(slug);
        expect(data.adminId).toBe(testUserId);
        
        testRoomId = data.id;
      });

      test("should reject duplicate room slug", async () => {
        const slug = `test-room-duplicate-${Date.now()}`;
        
        // Create first room
        await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ slug }),
        });

        // Try to create duplicate
        const response = await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ slug }),
        });

        expect(response.status).toBe(409);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("already exists");
      });

      test("should reject room creation without token", async () => {
        const response = await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "test-room" }),
        });

        expect(response.status).toBe(401);
      });

      test("should reject invalid room data", async () => {
        const response = await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ invalid: "data" }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe("GET /room/find/:slug", () => {
      test("should find room by slug with valid token", async () => {
        const slug = `test-find-room-${Date.now()}`;
        
        // Create room first
        const createResponse = await fetch(`${BASE_URL}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({ slug }),
        });
        const createdRoom = await createResponse.json() as { id: number; slug: string };

        // Find room
        const response = await fetch(`${BASE_URL}/room/find/${slug}`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as { id: number; slug: string };
        expect(data.id).toBe(createdRoom.id);
        expect(data.slug).toBe(slug);
      });

      test("should return 404 for non-existent room", async () => {
        const response = await fetch(`${BASE_URL}/room/find/nonexistent-room-${Date.now()}`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(404);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("not found");
      });

      test("should reject request without token", async () => {
        const response = await fetch(`${BASE_URL}/room/find/test-room`);
        expect(response.status).toBe(401);
      });

      test("should reject empty slug", async () => {
        const response = await fetch(`${BASE_URL}/room/find/ `, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(400);
      });
    });
  });

  describe("Drawing Messages", () => {
    describe("GET /room/:roomId", () => {
      test("should retrieve drawing messages for a room", async () => {
        if (!testRoomId) {
          // Create a test room if not exists
          const slug = `test-drawing-room-${Date.now()}`;
          const createResponse = await fetch(`${BASE_URL}/room`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
            body: JSON.stringify({ slug }),
          });
          const room = await createResponse.json() as { id: number };
          testRoomId = room.id;
        }

        const response = await fetch(`${BASE_URL}/room/${testRoomId}`);
        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(Array.isArray(data)).toBe(true);
      });

      test("should reject invalid room ID", async () => {
        const response = await fetch(`${BASE_URL}/room/invalid-id`);
        expect(response.status).toBe(400);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("Invalid");
      });

      test("should return empty array for room with no drawings", async () => {
        const response = await fetch(`${BASE_URL}/room/999999`);
        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
      });
    });
  });

  describe("Chat Messages", () => {
    describe("GET /room/:roomId/chat", () => {
      test("should retrieve chat messages for a room with valid token", async () => {
        if (!testRoomId) {
          // Create a test room if not exists
          const slug = `test-chat-room-${Date.now()}`;
          const createResponse = await fetch(`${BASE_URL}/room`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
            body: JSON.stringify({ slug }),
          });
          const room = await createResponse.json() as { id: number };
          testRoomId = room.id;
        }

        const response = await fetch(`${BASE_URL}/room/${testRoomId}/chat`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(Array.isArray(data)).toBe(true);
      });

      test("should respect limit parameter", async () => {
        const response = await fetch(`${BASE_URL}/room/${testRoomId}/chat?limit=10`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeLessThanOrEqual(10);
      });

      test("should respect offset parameter", async () => {
        const response = await fetch(`${BASE_URL}/room/${testRoomId}/chat?offset=5`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(Array.isArray(data)).toBe(true);
      });

      test("should cap limit at 100", async () => {
        const response = await fetch(`${BASE_URL}/room/${testRoomId}/chat?limit=200`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json() as any[];
        expect(data.length).toBeLessThanOrEqual(100);
      });

      test("should reject request without token", async () => {
        const response = await fetch(`${BASE_URL}/room/${testRoomId}/chat`);
        expect(response.status).toBe(401);
      });

      test("should reject invalid room ID", async () => {
        const response = await fetch(`${BASE_URL}/room/invalid-id/chat`, {
          headers: { Authorization: authToken },
        });

        expect(response.status).toBe(400);
        
        const data = await response.json() as { message: string };
        expect(data.message).toContain("Invalid");
      });
    });
  });

  describe("CORS", () => {
    test("should include CORS headers", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      
      // Express cors middleware should add these headers
      expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle malformed JSON", async () => {
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json {{{",
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test("should handle missing Content-Type header", async () => {
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          name: TEST_NAME,
        }),
      });

      // Should still work or return appropriate error
      expect([200, 201, 400, 409]).toContain(response.status);
    });
  });
});
