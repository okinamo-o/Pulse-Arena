import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-white/[0.08] before:absolute before:inset-0 before:animate-scan before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent", className)}
      {...props}
    />
  );
}

export { Skeleton };
