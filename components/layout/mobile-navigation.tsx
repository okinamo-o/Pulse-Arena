"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radio, Search, Star, Trophy, SlidersHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/favorites", label: "Saved", icon: Star },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal }
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-graphite-950/86 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden"
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar snap-x">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[4rem] flex-1 shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-lg min-h-12 text-[0.66rem] font-bold text-white/50 transition",
                active && "bg-white/[0.08] text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-signal-lime")} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
