import * as React from "react";
import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeedbackList } from "@/components/admin/feedback-list";
import { FeedbackReport } from "@/app/api/feedback/route";

export const dynamic = "force-dynamic";

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
        <FeedbackList initialReports={reports} />
      </div>
    </main>
  );
}
