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
  const { name } = createRoomSchema.parse(req.body);
  try {
    const room = await db.room.create({ data: { name, userId: req.userId } });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: "Failed to create room" });
  }
});





app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});


