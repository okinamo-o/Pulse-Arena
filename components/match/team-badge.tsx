"use client";

import { useState } from "react";
import Image from "next/image";
import { CountryFlag } from "@/components/match/country-flag";
import { badgeImageUrl } from "@/lib/ppv/client";
import { getTeamInitials } from "@/lib/ppv/selectors";
import { cn } from "@/lib/utils/cn";

interface TeamBadgeProps {
  name?: string;
  badge?: string;
  countryCode?: string;
  countryName?: string;
  isNational?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl",
};

const cornerFlagSize: Record<NonNullable<TeamBadgeProps["size"]>, "xs" | "sm" | "md"> = {
  sm: "xs",
  md: "xs",
  lg: "sm",
  xl: "md",
};

export function TeamBadge({
  name,
  badge,
  countryCode,
  countryName,
  isNational = false,
  size = "md",
  className,
}: TeamBadgeProps) {
  const [failedSrc, setFailedSrc] = useState<string>("");
  const src = badgeImageUrl(badge);
  const showImage = Boolean(src) && failedSrc !== src;
  const showCornerFlag = Boolean(countryCode) && !(isNational && showImage);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] font-black text-white shadow-inner-line",
        sizes[size],
        className
      )}
      aria-label={name ? `${name} badge` : "Team badge"}
      title={countryName && name ? `${name} (${countryName})` : name}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]">
        {showImage ? (
          isNational ? (
            <div className={cn("relative overflow-hidden rounded-lg border border-white/15 shadow-sm", size === "sm" ? "h-6 w-8" : "h-[68%] w-[82%]")}>
              <Image
                src={src}
                alt=""
                fill
                unoptimized
                sizes={size === "xl" ? "112px" : size === "lg" ? "80px" : "56px"}
                className="object-cover"
                onError={() => setFailedSrc(src)}
              />
            </div>
          ) : (
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              sizes={size === "xl" ? "112px" : size === "lg" ? "80px" : "56px"}
              className="object-contain p-1.5"
              onError={() => setFailedSrc(src)}
            />
          )
        ) : (
          <span>{getTeamInitials(name)}</span>
        )}
      </div>

      {showCornerFlag ? (
        <CountryFlag
          code={countryCode}
          name={countryName}
          size={cornerFlagSize[size]}
          className="absolute -bottom-1 -right-1 z-10 ring-2 ring-graphite-950"
        />
      ) : null}
    </div>
  );
}
