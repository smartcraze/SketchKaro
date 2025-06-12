
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {   
    const token = req.headers["authorization"];
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string } ;
    if (!decoded) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    req.userId = decoded.userId;
    next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

}