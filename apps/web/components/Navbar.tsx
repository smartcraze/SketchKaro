"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggler";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
        setToken(token ?? null);
    }, []);

    return (
        <header className="w-full  shadow-sm sticky top-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 ">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black ">SketchKaro</h2>
                <nav className="flex gap-4">
                    <ModeToggle />
                    {token ? (
                        
                        <Button variant="default" onClick={() => {
                            document.cookie = "token=; path=/; max-age=0";
                            window.location.reload();
                        }} className="text-sm" >
                            Logout
                        </Button>
                    
                    ): (
                        <>
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
                    </>
                    )}

                    
                </nav>
            </div>
        </header>
    );
}