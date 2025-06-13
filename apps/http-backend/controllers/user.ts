import type { Request, Response } from "express";
import { Router } from "express";
import  jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import db from "@repo/db";
import { createUserSchema, SignInSchema } from "@repo/common/types";
import bcrypt from "bcrypt";


const userRouter = Router();


// signup route
userRouter.post("/signup", async (req: Request, res: Response) => {
    const { email, password, name } = createUserSchema.parse(req.body);

    try {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const user = await db.user.create({ data: { email, password, name } });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: "User already exists" });
    }
});

// login route
userRouter.post("/login", async (req: Request, res: Response) => {
    try {
    const { email, password } = SignInSchema.parse(req.body);
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid password" });
        return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: "Invalid password" });
    }
});




export default userRouter;




