"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { HTTP_BACKEND } from "@/Config";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${HTTP_BACKEND}/user/login`, formData);
      document.cookie = `token=${response.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
      toast.success("Signed in successfully");
      router.push("/");
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-border rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-semibold text-foreground">Welcome Back 👋</h1>
              <p className="text-sm text-muted-foreground">Sign in to continue to Sketch Karo</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            <p className="text-sm text-center text-muted-foreground">
              Don’t have an account?{" "}
              <span className="text-primary underline cursor-pointer" onClick={() => router.push("/signup")}>
                Sign up
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
