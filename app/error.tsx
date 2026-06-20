"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an analytics or error tracking service if needed
    console.error("Pulse Arena stream/telemetry error:", error);
  }, [error]);

  return (
    <main className="container-page flex min-h-screen items-center justify-center pt-24">
      <GlassPanel className="max-w-2xl p-8 text-center" glow="orange">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-orange/10 text-signal-orange">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-signal-orange">Telemetry Interrupted</p>
        <h1 className="mt-2 text-balance font-display text-4xl font-black uppercase text-white md:text-6xl">
          Live feed crash
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-white/62">
          The dashboard signal has been interrupted. This is usually caused by network issues or API stream timeouts.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs font-mono text-white/40">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Re-scan feed
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Back to live hub</Link>
          </Button>
        </div>
      </GlassPanel>
    </main>
  );
}
