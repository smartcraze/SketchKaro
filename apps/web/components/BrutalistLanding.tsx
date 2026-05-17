"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  Clock3,
  Download,
  ExternalLink,
  Github,
  Grid3X3,
  LockKeyhole,
  Mail,
  MessageSquare,
  MousePointer2,
  Palette,
  PenTool,
  Play,
  Plus,
  Radar,
  Share2,
  Sparkles,
  Twitter,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/Config";

const stats = [
  { value: "0s", label: "demo start" },
  { value: "live", label: "room sync" },
  { value: "SVG", label: "export ready" },
];

const features = [
  {
    icon: Users,
    title: "Real-time collaboration",
    copy: "Create a shared room, invite the team, and watch every stroke, shape, and idea appear instantly.",
  },
  {
    icon: PenTool,
    title: "Natural drawing tools",
    copy: "Sketch freely with pencil, lines, rectangles, circles, arrows, and fast edits built for messy thinking.",
  },
  {
    icon: MessageSquare,
    title: "Built-in team context",
    copy: "Keep the conversation close to the canvas so decisions stay attached to the work.",
  },
  {
    icon: Palette,
    title: "Color and stroke control",
    copy: "Tune colors, stroke width, and visual emphasis without breaking your creative flow.",
  },
  {
    icon: Share2,
    title: "Rooms for every session",
    copy: "Create memorable room names or join by ID when someone sends you a quick working link.",
  },
  {
    icon: Download,
    title: "Export when it matters",
    copy: "Turn a whiteboard into a portable artifact for notes, handoff, planning, or presentation.",
  },
];

const steps = [
  {
    icon: Plus,
    title: "Create a room",
    copy: "Name the canvas or let SketchKaro generate a fresh space for the session.",
  },
  {
    icon: MousePointer2,
    title: "Draw together",
    copy: "Use simple tools, live sync, and quick visual markers to shape the idea in public.",
  },
  {
    icon: BadgeCheck,
    title: "Leave with clarity",
    copy: "Export, share, or keep iterating from the same room when the idea needs another pass.",
  },
];

const DecorativeGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]" />
    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20" />
    <div className="absolute inset-y-0 left-0 w-[1px] bg-white/20" />
    <div className="absolute inset-y-0 right-0 w-[1px] bg-white/20" />
    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/20" />
  </div>
);

export default function BrutalistLanding() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [roomInput, setRoomInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      setToken(cookieToken ?? null);
      if (cookieToken) {
        setIsLoggedIn(true);
        fetchUserInfo(cookieToken);
      }
    }
  }, []);

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await axios.get(`${HTTP_BACKEND}/me`, {
        headers: { Authorization: authToken },
        timeout: 5000,
      });
      if (response.data?.name) {
        setUserName(response.data.name);
      }
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0";
      toast.success("Logged out systematically.");
      window.location.reload();
    }
  };

  const handleCreateRoom = async () => {
    if (!isLoggedIn) {
      toast.error("Authentication required.");
      router.push("/signin");
      return;
    }
    const slug = roomInput.trim() || `room-${Math.random().toString(36).substr(2, 6)}`;
    try {
      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { slug },
        { headers: { Authorization: token }, timeout: 10000 }
      );
      toast.success("Session initiated.");
      router.push(`/canvas/${response.data.id}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Namespace collision: Room exists.");
      } else {
        toast.error("Subsystem failure. Cannot create room.");
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!isLoggedIn) {
      toast.error("Authentication required.");
      router.push("/signin");
      return;
    }
    const slug = roomInput.trim();
    if (!slug) {
      toast.error("Provide a namespace or distinct ID.");
      return;
    }
    try {
      if (!isNaN(Number(slug))) {
        router.push(`/canvas/${slug}`);
        return;
      }
      const response = await axios.get(`${HTTP_BACKEND}/room/find/${slug}`, {
        headers: { Authorization: token },
        timeout: 10000,
      });
      if (response.data?.id) {
        router.push(`/canvas/${response.data.id}`);
      }
    } catch {
      toast.error("404: Coordinate not found.");
    }
  };

  const handleDemoMode = () => {
    const demoRoomId = `demo-${Math.random().toString(36).substr(2, 9)}`;
    toast.success("Sandbox mode active.");
    router.push(`/canvas/${demoRoomId}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3] selection:bg-[#E3FE00] selection:text-black font-mono overflow-hidden relative">
      <DecorativeGrid />

      {/* Top Navbar */}

      <header className="relative z-20 flex justify-between items-center p-5 sm:p-6 lg:p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <img
            src="/sketchkaro.png"
            alt="SketchKaro"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </motion.div>

        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.24em] text-white/50">
          <a
            href="#features"
            className="hover:text-[#E3FE00] transition-colors"
          >
            Features
          </a>

          <a
            href="#workflow"
            className="hover:text-[#E3FE00] transition-colors"
          >
            Workflow
          </a>

          <a
            href="#footer"
            className="hover:text-[#E3FE00] transition-colors"
          >
            Contact
          </a>
        </nav>

        <div className="flex gap-3 sm:gap-4 items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-sm uppercase text-white/50 hidden sm:block">
                ID: {userName}
              </span>

              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-widest hover:text-[#E3FE00] transition-colors"
              >
                Terminate
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/signin")}
              className="px-4 sm:px-6 py-2 bg-white text-black font-bold uppercase tracking-tight hover:bg-[#E3FE00] transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 lg:px-8 pt-16 sm:pt-20 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Left Column: Huge Type & Context */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-4 py-1 w-max"
              >
                <div className="w-2 h-2 rounded-full bg-[#E3FE00] animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#E3FE00]">System Online V2.0</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] leading-[0.86] font-extrabold tracking-tighter uppercase"
              >
                Architect
                <br />
                <span className="text-transparent" style={{ WebkitTextStroke: "2px #F3F3F3" }}>Your Ideas</span>
                <br />
                Instantly.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-lg lg:text-xl text-white/50 max-w-xl font-sans font-light"
              >
                SketchKaro is a brutal, high-fidelity collaborative canvas. Drop in, draw, coordinate, and leave no trace unless you want to. No friction. No delays.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-10 grid grid-cols-3 max-w-xl border border-white/10"
              >
                {stats.map((item) => (
                  <div key={item.label} className="p-4 border-r border-white/10 last:border-r-0">
                    <div className="text-2xl md:text-3xl font-black text-[#E3FE00]">{item.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Interaction Panel */}
            <div className="col-span-1 lg:col-span-4 lg:col-start-9 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="border border-white/20 bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative group"
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                <h2 className="text-xl tracking-tight uppercase mb-6 flex items-center gap-2">
                  <MousePointer2 className="w-5 h-5 text-[#E3FE00]" />
                  Command Module
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/50 block">Namespace / Room ID</label>
                    <input
                      type="text"
                      placeholder="E.g. alpha-sector-9"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleJoinRoom();
                        }
                      }}
                      className="w-full bg-white/5 border border-white/20 p-4 focus:outline-none focus:border-[#E3FE00] transition-colors text-white placeholder:text-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleCreateRoom}
                      className="flex-1 bg-[#E3FE00] text-black font-bold uppercase tracking-tight py-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Initialize
                    </button>
                    <button
                      onClick={handleJoinRoom}
                      className="flex-1 bg-white/10 text-white font-bold uppercase tracking-tight py-4 flex items-center justify-center gap-2 hover:bg-white/20 border border-white/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Connect
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={handleDemoMode}
                      className="w-full py-4 text-white/50 hover:text-[#E3FE00] hover:bg-white/5 transition-colors uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Enter Sandbox Demo
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/10 bg-[#101010]/80">
          <div className="container mx-auto px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 border border-[#E3FE00]/40 bg-[#E3FE00]/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#E3FE00]">
                  <Sparkles className="h-4 w-4" />
                  Feature deck
                </div>
                <h2 className="mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                  Everything you need to move from rough idea to shared plan.
                </h2>
              </div>
              <p className="lg:col-span-5 text-base sm:text-lg text-white/55 font-sans leading-8">
                SketchKaro keeps the canvas fast and focused: rooms, live drawing, tool controls, chat context, export, and demo mode are all one or two clicks away.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border border-white/10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.04 }}
                    className="group min-h-64 border-b border-white/10 p-7 md:border-r xl:[&:nth-child(3n)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0"
                  >
                    <div className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white/5 text-[#E3FE00] transition-colors group-hover:bg-[#E3FE00] group-hover:text-black">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-7 text-xl font-black uppercase tracking-tight">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/55 font-sans">{feature.copy}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="container mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-10">
                <div className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/55">
                  <Radar className="h-4 w-4 text-[#E3FE00]" />
                  How it works
                </div>
                <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
                  Start clean. Draw loud. Finish useful.
                </h2>
                <p className="mt-6 max-w-md text-white/55 font-sans leading-8">
                  The page is built around the shortest path to action. Make a room, join a room, or use sandbox mode when you only want to test the board.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ delay: index * 0.08 }}
                      className="grid gap-5 border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-[88px_1fr] sm:p-8"
                    >
                      <div className="flex h-16 w-16 items-center justify-center bg-[#E3FE00] text-black">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Step 0{index + 1}</div>
                        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">{step.title}</h3>
                        <p className="mt-3 text-white/55 font-sans leading-7">{step.copy}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#E3FE00] text-black">
          <div className="container mx-auto px-6 lg:px-8 py-16">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                  Made for brainstorms, lessons, planning rooms, and quick visual decisions.
                </h2>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                {[
                  { icon: Brush, label: "Sketch" },
                  { icon: Clock3, label: "Sync" },
                  { icon: LockKeyhole, label: "Sign in" },
                  { icon: Grid3X3, label: "Organize" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="border border-black/20 bg-black/5 p-5">
                      <Icon className="h-7 w-7" />
                      <div className="mt-4 text-sm font-black uppercase tracking-[0.18em]">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="border border-white/10 p-8 lg:col-span-2">
              <WandSparkles className="h-10 w-10 text-[#E3FE00]" />
              <h2 className="mt-8 max-w-3xl text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
                A canvas that feels instant because the tools stay out of your way.
              </h2>
              <p className="mt-6 max-w-2xl text-white/55 font-sans leading-8">
                The interface keeps the important controls close: tool selection, color, stroke width, zoom, undo, redo, chat, and export. It is built for people who want to think visually without managing a heavy design suite.
              </p>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-8">
              <Zap className="h-10 w-10 text-[#E3FE00]" />
              <h3 className="mt-8 text-2xl font-black uppercase tracking-tight">Try it without pressure</h3>
              <p className="mt-4 text-white/55 font-sans leading-7">
                Sandbox mode launches a disposable room instantly, so visitors can experience the board before signing in.
              </p>
              <button
                onClick={handleDemoMode}
                className="mt-8 inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-black uppercase tracking-tight text-black hover:bg-[#E3FE00] transition-colors"
              >
                Demo mode <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="relative z-10 border-t border-white/10 bg-black">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-2xl font-black uppercase tracking-tighter">

                <img
                  src="/sketchkaro.png"
                  alt="SketchKaro"
                  className="h-8 sm:h-10 w-auto object-contain"
                />

              </div>
              <p className="mt-4 max-w-md text-white/50 font-sans leading-7">
                A real-time collaborative whiteboard for sketching ideas, planning with teams, and turning rough thinking into clear visual direction.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="https://github.com/smartcraze"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SketchKaro GitHub"
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 hover:border-[#E3FE00] hover:text-[#E3FE00] transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/surajv354"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SketchKaro Twitter"
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 hover:border-[#E3FE00] hover:text-[#E3FE00] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:surajv354@gmail.com"
                  aria-label="Email SketchKaro"
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 hover:border-[#E3FE00] hover:text-[#E3FE00] transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white/35">Explore</h3>
              <div className="mt-5 grid gap-3 text-sm uppercase tracking-[0.16em] text-white/60">
                <a href="#features" className="hover:text-[#E3FE00] transition-colors">Features</a>
                <a href="#workflow" className="hover:text-[#E3FE00] transition-colors">How it works</a>
                <button onClick={handleDemoMode} className="w-fit text-left uppercase tracking-[0.16em] hover:text-[#E3FE00] transition-colors">
                  Sandbox demo
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white/35">Ready panel</h3>
              <div className="mt-5 border border-white/10 p-5">
                <div className="flex items-center gap-3 text-white/70">
                  <Sparkles className="h-5 w-5 text-[#E3FE00]" />
                  <span className="text-sm uppercase tracking-[0.14em]">Open a canvas in seconds</span>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => router.push(isLoggedIn ? "/" : "/signup")}
                    className="inline-flex items-center justify-center gap-2 bg-[#E3FE00] px-5 py-3 text-sm font-black uppercase tracking-tight text-black hover:bg-white transition-colors"
                  >
                    Get started <ArrowRight className="h-4 w-4" />
                  </button>
                  {!isLoggedIn && (
                    <Link
                      href="/signin"
                      className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-tight text-white hover:border-white/40 transition-colors"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>


        </div>
      </footer>

      {/* Decorative large element */}
      <motion.div
        initial={{ opacity: 0, rotate: -45 }}
        animate={{ opacity: 0.03, rotate: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed -bottom-[30%] -left-[10%] w-[100vw] h-[100vw] rounded-full border-[100px] border-white pointer-events-none z-0"
      />
    </div>
  );
}
