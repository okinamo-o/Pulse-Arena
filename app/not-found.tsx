import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-screen items-center justify-center pt-24">
      <GlassPanel className="max-w-2xl p-8 text-center" glow="lime">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-signal-lime">Signal lost</p>
        <h1 className="text-balance font-display text-4xl font-black uppercase text-white md:text-6xl">
          This match feed is off air
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-white/62">
          The route could not be matched to an active event, sport, or stream source.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to live hub
          </Link>
        </Button>
      </GlassPanel>
    </main>
  );
}
