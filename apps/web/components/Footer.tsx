import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background text-foreground px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-bold">Sketch Karo</h2>
          <p className="text-lg text-muted-foreground mt-1">
            Real-time whiteboard for creative teams.
          </p>
        </div>

        {/* Links */}
        <div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
            <li><Link href="#how-it-works" className="hover:text-foreground">How it Works</Link></li>
            <li><Link href="#get-started" className="hover:text-foreground">Get Started</Link></li>
          </ul>
        </div>

        {/* Newsletter + Socials */}
        <div>
          <form className="flex flex-col space-y-2">
            <Input type="email" placeholder="Your email" className="bg-muted border-border" />
            <Button variant="secondary" className="w-fit">Subscribe</Button>
          </form>
          <div className="flex gap-3 mt-4">
            <a href="https://github.com/smartcraze" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5 hover:text-primary" />
            </a>
            <a href="https://twitter.com/surajv354" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-accent" />
            </a>
            <a href="mailto:surajv354@gmail.com">
              <Mail className="w-5 h-5 hover:text-secondary" />
            </a>
          </div>
        </div>
      </div>

      <Separator className="my-8 bg-border" />

      <div className="text-center text-lg text-muted-foreground">
        &copy; {new Date().getFullYear()} Sketch Karo. Built with ❤️ by Suraj Vishwakarma (@surajv354).
      </div>
    </footer>
  );
}
