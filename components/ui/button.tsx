import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "group relative inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-950 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-signal-lime text-graphite-950 shadow-glow hover:-translate-y-0.5 hover:bg-[#d6ff76] active:translate-y-0",
        secondary:
          "border border-white/10 bg-white/[0.08] text-white shadow-inner-line backdrop-blur-xl hover:border-signal-cyan/50 hover:bg-white/[0.12]",
        ghost: "text-white/78 hover:bg-white/[0.08] hover:text-white",
        orange:
          "bg-signal-orange text-white shadow-glow-orange hover:-translate-y-0.5 hover:bg-[#ff813d] active:translate-y-0",
        destructive: "bg-signal-red text-white hover:bg-[#ff5a76]"
      },
      size: {
        sm: "h-9 rounded-md px-3 text-xs",
        default: "h-11 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {asChild ? (
          children
        ) : (
          <>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition group-hover:animate-scan group-hover:opacity-100" />
            <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
