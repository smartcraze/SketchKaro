import express from "express";
import type { Request, Response } from "express";
import userRouter from "./controllers/user";
import db from "@repo/db";
import { authMiddleware } from "./middleware";
import { createRoomSchema } from "@repo/common/types";




const app = express();
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
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


app.get("/room/:roomId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await db.chat.findMany({
      where: { roomId: Number(roomId) },
      take: 50,
      orderBy: { createdAt: "desc" },

    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: "Failed to get room" });
  }
});






app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});


