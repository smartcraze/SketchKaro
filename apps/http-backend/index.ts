import express from "express";
import type { Request, Response } from "express";
import userRouter from "./controllers/user";
import db from "@repo/db";
import { authMiddleware } from "./middleware";
import { createRoomSchema } from "@repo/common/types";
import cors from "cors";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

/**
 * Root endpoint
 * Returns a simple welcome message
 */
app.get("/", (req, res) => {
  res.send("Hello World");
});

/**
 * Health check endpoint
 * Returns the current health status and timestamp of the server
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

/**
 * Create a new room
 * Authenticated endpoint that creates a new collaborative drawing room
 * @param slug - Unique identifier for the room
 * @returns Created room object with id, slug, and adminId
 */
app.post("/room", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug } = createRoomSchema.parse(req.body);
    const adminId = req.userId;
    
    if (!adminId) {
      res.status(401).json({ message: "User authentication required" });
      return;
    }
    
    const existingRoom = await db.room.findUnique({ where: { slug } });
    if (existingRoom) {
      res.status(409).json({ message: "Room with this slug already exists" });
      return;
    }
    
    const room = await db.room.create({ data: { slug, adminId: adminId.toString() } });
    res.status(201).json(room);
  } catch (error) {
    console.error("Failed to create room:", error);
    res.status(400).json({ message: "Failed to create room" });
  }
});

/**
 * Get current user information
 * Authenticated endpoint that returns the logged-in user's profile
 * @returns User object with id, name, and email (password excluded)
 */
app.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ message: "User authentication required" });
      return;
    }
    
    const user = await db.user.findUnique({ 
      where: { id: userId.toString() },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Failed to get user info:", error);
    res.status(500).json({ message: "Failed to get user info" });
  }
});

/**
 * Get chat messages for a room
 * Authenticated endpoint that retrieves paginated chat history
 * @param roomId - The room ID to fetch messages from
 * @param limit - Maximum number of messages to return (default: 50)
 * @param offset - Number of messages to skip for pagination (default: 0)
 * @returns Array of formatted chat messages with user information
 */
app.get("/room/:roomId/chat", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (isNaN(Number(roomId))) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }
    
    const chatMessages = await db.chatMessage.findMany({
      where: { roomId: Number(roomId) },
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });
    
    const formattedMessages = chatMessages.map(msg => ({
      id: msg.id.toString(),
      message: msg.message,
      from: msg.userId,
      name: msg.user.name,
      timestamp: msg.createdAt,
      roomId: msg.roomId.toString(),
    }));
    
    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error("Failed to get chat messages:", error);
    res.status(500).json({ message: "Failed to get chat messages" });
  }
});

/**
 * Get drawing messages for a room
 * Retrieves recent drawing/shape data for a specific room
 * @param roomId - The room ID to fetch drawings from
 * @returns Array of the most recent drawing messages (limited to 50)
 */
app.get("/room/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    if (isNaN(Number(roomId))) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }
    
    const messages = await db.drawing.findMany({
      where: { roomId: Number(roomId) },
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to get drawing messages:", error);
    res.status(500).json({ message: "Failed to get drawing messages" });
  }
});

/**
 * Find a room by slug
 * Authenticated endpoint to search for a room using its unique slug identifier
 * @param slug - The unique slug identifier of the room
 * @returns Room object if found, 404 if not found
 */
app.get("/room/find/:slug", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    if (!slug || slug.trim().length === 0) {
      res.status(400).json({ message: "Slug parameter is required" });
      return;
    }
    
    const room = await db.room.findUnique({ where: { slug } });
    
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    
    res.status(200).json(room);
  } catch (error) {
    console.error("Failed to get room:", error);
    res.status(500).json({ message: "Failed to get room" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
