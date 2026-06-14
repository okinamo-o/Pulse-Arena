import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white shadow-inner-line outline-none backdrop-blur-xl transition placeholder:text-white/35 focus:border-signal-lime/55 focus:ring-2 focus:ring-signal-lime/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
