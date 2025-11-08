import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and attaches userId to request
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 Unauthorized if token is invalid or missing
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"];
        
        if (!token) {
            res.status(401).json({ message: "Authorization token is required" });
            return;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: "Invalid token payload" });
            return;
        }
        // @ts-ignore
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid or expired token" });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Token has expired" });
        } else {
            console.error("Authentication error:", error);
            res.status(401).json({ message: "Authentication failed" });
        }
        return;
    }
};