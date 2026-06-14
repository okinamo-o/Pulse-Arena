import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "lime" | "orange" | "cyan" | "none";
}

export function GlassPanel({ className, glow = "none", ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.065] shadow-panel shadow-black/30 backdrop-blur-2xl",
        glow === "lime" && "shadow-glow",
        glow === "orange" && "shadow-glow-orange",
        glow === "cyan" && "shadow-[0_0_40px_rgb(49_215_255_/_0.18)]",
        className
      )}
      {...props}
    />
  );
}
