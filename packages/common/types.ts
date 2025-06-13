import { z } from "zod";


export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
    name: z.string().min(3).max(20),
});

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
});

export const createRoomSchema = z.object({
    slug: z.string().min(3).max(20),
    
});


