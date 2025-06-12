import type { Request, Response } from "express";
import { Router } from "express";
import  jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

const userRouter = Router();
// signup route
userRouter.post("/signup", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    res.status(201).json(user);
});

// login route
userRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const user = await User.findOne({ email });
    res.status(200).json({token});
});




export default userRouter;




