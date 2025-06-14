"use client";

import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 text-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary dark:text-white">
          How <span className="text-primary dark:text-blue-500 font-bold ">Sketch Karo</span> Works
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-secondary dark:text-white text-lg">
          From scribble to share — here's how you bring your ideas to life with Sketch Karo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <HowCard
          title="1. Start Sketching"
          description="Use pencil, shapes, text, and arrows to create mind maps, diagrams, or pure chaos."
          steps={[
            "Select your tool",
            "Draw freely with precision",
            "Undo/redo as needed",
          ]}
        />

        <HowCard
          title="2. Share the Link"
          description="Copy-paste the board URL and invite anyone. Real-time collab happens instantly."
          steps={[
            "Click 'Share'",
            "Invite your team or friends",
            "Edit together live",
          ]}
        />

        <HowCard
          title="3. Export & Save"
          description="Download your sketch as PNG or SVG. Perfect for docs, slides, or portfolios."
          steps={[
            "Click 'Export'",
            "Choose format",
            "Boom — file downloaded",
          ]}
        />
      </div>
    </section>
  );
}

function HowCard({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps?: string[];
}) {
  return (
    <CardSpotlight className="h-auto min-h-[280px] w-full bg-zinc-900 px-6 py-5 rounded-xl shadow-lg dark:bg-zinc-800">
      <p className="text-xl font-semibold relative z-20 mt-2 text-white">
        {title}
      </p>
      <p className="text-neutral-300 mt-3 relative z-20 text-sm">
        {description}
      </p>

      {steps && (
        <ul className="mt-4 space-y-2 relative z-20">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckIcon />
              <p className="text-sm text-neutral-200">{step}</p>
            </li>
          ))}
        </ul>
      )}
    </CardSpotlight>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-blue-500 mt-1 shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.293 6.293a1 1 0 0 1 1.32 1.497l-4 4a1 1 0 0 1-1.497 0l-2-2a1 1 0 1 1 1.497-1.32l1.293 1.292 3.387-3.469z"
      />
    </svg>
  );
}
