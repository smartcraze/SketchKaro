"use client";
import Image from "next/image";
import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";

export function WobbleCardDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4 py-12">
      {/* Hero card */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-purple-700 min-h-[500px] lg:min-h-[300px] relative overflow-hidden"
      >
        <div className="max-w-md">
          <h2 className="text-left text-balance text-lg md:text-2xl lg:text-4xl font-bold tracking-tight text-white">
            Sketch together. Anytime, anywhere.
          </h2>
          <p className="mt-4 text-left text-base text-neutral-200">
            Sketch Karo is your real-time collaborative whiteboard to ideate,
            brainstorm, and bring creative chaos to life — all in one canvas.
          </p>
        </div>
        <Image
          src="/sketch.svg"
          width={480}
          height={480}
          alt="Sketch Karo whiteboard preview"
          className="absolute -right-4 md:-right-[25%] -bottom-10 object-contain opacity-80 rounded-2xl grayscale"
        />
      </WobbleCard>

      {/* Feature card */}
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <h2 className="text-left text-balance text-lg md:text-2xl font-semibold tracking-tight">
          Real-time Collaboration
        </h2>
        <p className="mt-4 text-left text-base text-neutral-200">
          Work with your team on a shared canvas. Instant updates, no lag, no fuss.
        </p>
      </WobbleCard>

      {/* CTA or highlight card */}
      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-zinc-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[320px] relative overflow-hidden">
        <div className="max-w-md">
          <h2 className="text-left text-balance text-lg md:text-2xl lg:text-4xl font-bold tracking-tight text-white">
            Doodle. Diagram. Dream. It&apos;s all here.
          </h2>
          <p className="mt-4 text-left text-base text-neutral-300">
            Whether it's product planning, creative sketches, or brainstorming, Sketch Karo gives you the tools to think visually — together.
          </p>
        </div>
        
        <Image
          src="/heythere.svg"
          width={480}
          height={480}
          alt="Sketch Karo whiteboard preview"
          className="absolute -right-16 md:-right-[10%] -bottom-50 object-contain opacity-80 rounded-2xl"
        />
      
      </WobbleCard>
      
    </div>
  );
}

