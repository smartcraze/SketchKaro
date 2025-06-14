"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggler";

export default function Navbar() {
    return (
        <header className="w-full  shadow-sm sticky top-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 ">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black ">SketchKaro</h2>
                <nav className="flex gap-4">
                    <ModeToggle  />
                    <Link href="/signin">
                        <Button variant="default" className="text-sm" >
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant="secondary" className="text-sm" >
                            Sign Up
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}