import express from "express";
import type { Request, Response } from "express";
import userRouter from "./controllers/user";
import db from "@repo/db";
import { authMiddleware } from "./middleware";
import { createRoomSchema } from "@repo/common/types";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/room", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug } = createRoomSchema.parse(req.body);
    const adminId = req.userId;
    const room = await db.room.create({ data: { slug, adminId } });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: "Failed to create room" });
  }
});

app.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await db.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        // Don't return password for security
      }
    });
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Failed to get user info:", error);
    res.status(400).json({ message: "Failed to get user info" });
  }
});

app.get("/room/:roomId/chat", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
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
    res.status(400).json({ message: "Failed to get chat messages" });
  }
});

app.get("/room/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await db.drawing.findMany({
      where: { roomId: Number(roomId) },
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: "Failed to failed to get the messages" });
  }
});

app.get("/room/find/:slug", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const room = await db.room.findUnique({ where: { slug } });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: "Failed to get the room" });
  }
});

app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});
