import type { Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";
import db from "@repo/db";
import { createUserSchema, SignInSchema } from "@repo/common/types";
import bcrypt from "bcrypt";

const userRouter = Router();
const SALT_ROUNDS = 10;

/**
 * User signup endpoint
 * Creates a new user account with hashed password
 * 
 * @param email - User's email address (must be unique)
 * @param password - User's password (min 8 chars)
 * @param name - User's display name
 * @returns Created user object (excluding password)
 */
userRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, password, name } = createUserSchema.parse(req.body);

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: "User already exists with this email" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await db.user.create({ 
            data: { 
                email, 
                password: hashedPassword, 
                name 
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error("Signup error:", error);
        if (error instanceof Error && error.name === "ZodError") {
            res.status(400).json({ message: "Invalid input data" });
        } else {
            res.status(500).json({ message: "Failed to create user account" });
        }
    }
});

/**
 * User login endpoint
 * Authenticates user and returns JWT token
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns JWT authentication token
 */
userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = SignInSchema.parse(req.body);
        
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        
        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error && error.name === "ZodError") {
            res.status(400).json({ message: "Invalid input data" });
        } else {
            res.status(500).json({ message: "Authentication failed" });
        }
    }
});

export default userRouter;


