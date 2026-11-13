"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface CountryFlagProps {
  code?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const flagSizes = {
  xs: { box: "h-3 w-4 rounded-[3px]", imgSizes: "16px" },
  sm: { box: "h-3.5 w-5 rounded-[3px]", imgSizes: "20px" },
  md: { box: "h-4 w-6 rounded-[4px]", imgSizes: "24px" },
  lg: { box: "h-5 w-7 rounded-[4px]", imgSizes: "28px" },
};

export function CountryFlag({ code, name, size = "sm", className }: CountryFlagProps) {
  const [failedSrc, setFailedSrc] = React.useState<string>("");
  const cleanCode = code?.trim().toLowerCase() ?? "";
  if (!/^[a-z]{2}(?:-[a-z]{3})?$/.test(cleanCode)) return null;

  const src = `https://flagcdn.com/w80/${cleanCode}.png`;
  if (failedSrc === src) return null;

  const dims = flagSizes[size];

  return (
    <span
      title={name || cleanCode.toUpperCase()}
      aria-label={name ? `${name} flag` : `${cleanCode.toUpperCase()} flag`}
      className={cn(
        "relative inline-block shrink-0 overflow-hidden border border-white/20 bg-graphite-900 shadow-sm",
        dims.box,
        className
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes={dims.imgSizes}
        className="object-cover"
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}

