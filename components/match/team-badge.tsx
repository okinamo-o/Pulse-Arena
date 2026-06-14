import Image from "next/image";
import { badgeImageUrl } from "@/lib/streamed/client";
import { getTeamInitials } from "@/lib/streamed/selectors";
import { cn } from "@/lib/utils/cn";

interface TeamBadgeProps {
  name?: string;
  badge?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl"
};

export function TeamBadge({ name, badge, size = "md", className }: TeamBadgeProps) {
  const src = badgeImageUrl(badge);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.08] font-black text-white shadow-inner-line",
        sizes[size],
        className
      )}
      aria-label={name ? `${name} badge` : "Team badge"}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={size === "xl" ? "112px" : size === "lg" ? "80px" : "56px"}
          className="object-contain p-2"
        />
      ) : (
        <span>{getTeamInitials(name)}</span>
      )}
    </div>
  );
}
