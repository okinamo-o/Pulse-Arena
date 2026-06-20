"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radio, Search, Star, Trophy, SlidersHorizontal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/system/search-command";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal }
];

export function TopNavigation() {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-graphite-950/72 backdrop-blur-2xl">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="Pulse Arena home">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-signal-lime text-graphite-950 shadow-glow">
            <Activity className="h-5 w-5" aria-hidden="true" />
            <span className="absolute inset-0 bg-gradient-to-br from-white/35 to-transparent" />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-sm font-black uppercase tracking-[0.18em] text-white">Pulse</span>
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.34em] text-signal-lime">Arena</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/62 transition hover:bg-white/[0.07] hover:text-white",
                  active && "bg-white/[0.09] text-white shadow-inner-line"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-signal-lime")} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchCommand>
            <span className="flex items-center">
              <Button variant="secondary" className="hidden min-w-[220px] justify-start text-white/54 lg:inline-flex" tabIndex={-1}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Search matches
                <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[0.64rem] text-white/38">/</span>
              </Button>
              <Button size="icon" variant="secondary" className="lg:hidden" aria-label="Search matches" tabIndex={-1}>
                <Search className="h-4 w-4" aria-hidden="true" />
              </Button>
            </span>
          </SearchCommand>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/live">
              <Radio className="h-4 w-4" aria-hidden="true" />
              Watch live
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
