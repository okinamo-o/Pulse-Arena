import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";
import { ShieldCheck, Bug, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface FeedbackReport {
  id: string;
  message: string;
  timestamp: string;
  userAgent: string;
}

async function getFeedback(): Promise<FeedbackReport[]> {
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/feedback`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch feedback", err);
    return [];
  }
}

export default async function AdminDashboard() {
  const reports = await getFeedback();

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="cyan">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Admin Portal
        </Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Feedback Center
        </h1>
        <p className="mt-2 text-sm text-white/52">
          Secure access area. Viewing {reports.length} user reports.
        </p>
      </section>

      <div className="mt-8">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
            <Server className="mb-4 h-12 w-12 text-white/20" />
            <h3 className="font-bold text-white/60">No reports found</h3>
            <p className="text-sm text-white/40">The feedback database is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-signal-lime" />
                    <span className="font-mono text-xs text-white/40">ID: {report.id}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                    {report.timestamp ? formatDistanceToNow(new Date(report.timestamp), { addSuffix: true }) : "Unknown"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/90">
                  {report.message}
                </p>
                <div className="mt-2 border-t border-white/10 pt-3">
                  <span className="text-[10px] uppercase text-white/40">User Agent: </span>
                  <span className="font-mono text-[10px] text-white/60">{report.userAgent}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
