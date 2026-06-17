"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { LiveTicker } from "@/components/layout/live-ticker";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      <LiveTicker />
      <div className="flex-1 flex flex-col">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </div>
      <Footer />
      <MobileNavigation />
    </div>
  );
}
