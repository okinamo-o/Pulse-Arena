import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[0.72rem] font-bold uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/[0.08] text-white/82",
        live: "border-signal-lime/40 bg-signal-lime/12 text-signal-lime shadow-glow",
        hot: "border-signal-orange/40 bg-signal-orange/12 text-signal-orange",
        cyan: "border-signal-cyan/35 bg-signal-cyan/12 text-signal-cyan",
        muted: "border-white/8 bg-white/[0.05] text-white/55"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
