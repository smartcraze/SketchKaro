import express from "express";
import type { Request, Response } from "express";
import userRouter from "./controllers/user";



const app = express();
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});



app.post("/room", async (req: Request, res: Response) => {
  const { name } = req.body;
  const room = await Room.create({ name });
  res.status(201).json(room);
});





app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});


