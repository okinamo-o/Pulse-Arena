import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, actionHref, actionLabel, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-signal-lime">{eyebrow}</p> : null}
        <h2 className="text-balance font-display text-2xl font-black uppercase text-white md:text-4xl">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/72 transition hover:border-signal-lime/50 hover:text-white md:inline-flex"
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
