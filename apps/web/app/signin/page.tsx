"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HTTP_BACKEND } from "@/Config";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  LockKeyhole,
  Mail,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const highlights = [
  { icon: MousePointer2, label: "Join saved rooms" },
  { icon: Users, label: "Collaborate live" },
  { icon: Brush, label: "Keep drawing fast" },
];

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

      // Check if we're in the browser environment before setting cookie
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        document.cookie = `token=${response.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
      }

      toast.success("Signed in successfully");
      router.push("/");
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-[#F3F3F3] selection:bg-[#E3FE00] selection:text-black">
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>
      <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 border-[48px] border-[#E3FE00]/10 rounded-full" />

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/70 hover:text-[#E3FE00]">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <div className="text-sm font-black uppercase tracking-tighter">[ SketchKaro ]</div>
      </header>

      <main className="relative z-10 grid min-h-[calc(100vh-73px)] lg:grid-cols-12">
        <section className="hidden border-r border-white/10 px-8 py-12 lg:col-span-7 lg:flex lg:flex-col lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 border border-[#E3FE00]/40 bg-[#E3FE00]/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#E3FE00]">
              <ShieldCheck className="h-4 w-4" />
              Secure return
            </div>
            <h1 className="mt-8 text-6xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.88]">
              Re-enter the room where your ideas are still moving.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/55 font-sans">
              Sign in to create rooms, join active sessions, and keep your collaborative canvas connected to your account.
            </p>
          </motion.div>

          <div className="grid max-w-3xl grid-cols-3 border border-white/10">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border-r border-white/10 p-5 last:border-r-0">
                  <Icon className="h-6 w-6 text-[#E3FE00]" />
                  <div className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/55">{item.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md border border-white/15 bg-black/50 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center bg-[#E3FE00] text-black">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-4xl font-black uppercase tracking-tighter">Sign in</h2>
              <p className="mt-3 text-sm leading-6 text-white/50 font-sans">
                Continue to your rooms and start drawing with the team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-white/45">Email</label>
                <div className="flex items-center gap-3 border border-white/15 bg-white/[0.04] px-4 focus-within:border-[#E3FE00]">
                  <Mail className="h-4 w-4 text-white/35" />
                  <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                    className="h-13 w-full bg-transparent text-white outline-none placeholder:text-white/25"
                />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-white/45">Password</label>
                <div className="flex items-center gap-3 border border-white/15 bg-white/[0.04] px-4 focus-within:border-[#E3FE00]">
                  <LockKeyhole className="h-4 w-4 text-white/35" />
                  <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                    className="h-13 w-full bg-transparent text-white outline-none placeholder:text-white/25"
                />
                </div>
              </div>
              <button
                type="submit"
                className="flex h-13 w-full items-center justify-center gap-2 bg-[#E3FE00] font-black uppercase tracking-tight text-black transition-colors hover:bg-white"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
                <Sparkles className="h-4 w-4 text-[#E3FE00]" />
                New workspace?
              </div>
              <button
                onClick={() => router.push("/signup")}
                className="mt-3 text-left text-sm font-bold text-white/70 underline underline-offset-4 hover:text-[#E3FE00]"
              >
                Create an account
              </button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
