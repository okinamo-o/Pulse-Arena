"use client";

import * as React from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { TIME_BLOCKS, type TimeBlock } from "@/lib/streamed/schedule";
import { cn } from "@/lib/utils/cn";

interface QuickJumpProps {
  activeBlocks: TimeBlock[];
}

const icons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon
};

export function QuickJump({ activeBlocks }: QuickJumpProps) {
  const handleJump = (blockId: TimeBlock) => {
    const el = document.getElementById(`timeblock-${blockId}`);
    if (el) {
      const headerOffset = 132; // Accommodate sticky top-nav + date-nav
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (activeBlocks.length <= 1) return null; // No need for quick jump if only 0 or 1 block exists

  return (
    <div className="sticky top-[118px] z-20 flex items-center justify-center bg-graphite-950/70 py-2 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-graphite-950/90 p-1 shadow-2xl">
        <span className="pl-3 pr-1 text-[0.62rem] font-black uppercase tracking-wider text-white/40">
          Jump to:
        </span>
        
        {TIME_BLOCKS.map((block) => {
          const isAvailable = activeBlocks.includes(block.id);
          const Icon = icons[block.id];

          return (
            <button
              key={block.id}
              disabled={!isAvailable}
              onClick={() => handleJump(block.id)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-mono text-[0.65rem] font-bold uppercase transition",
                isAvailable
                  ? "bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  : "opacity-25 cursor-not-allowed text-white/40"
              )}
            >
              <Icon className="h-3 w-3" />
              {block.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
