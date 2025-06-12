import type { Request as ExpressRequest } from "express";

declare module "express" {
    interface Request {
        userId: string;
    }
}

export default ExpressRequest;

