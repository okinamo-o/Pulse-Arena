"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bug, CheckCircle2, Server, Trash2, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveFeedback, deleteFeedback } from "@/app/admin/actions";
import { FeedbackReport } from "@/app/api/feedback/route";

export function FeedbackList({ initialReports }: { initialReports: FeedbackReport[] }) {
  const [isPending, startTransition] = useTransition();

  const handleResolve = (report: FeedbackReport) => {
    startTransition(async () => {
      await resolveFeedback(report.id, report);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteFeedback(id);
    });
  };

  const newReports = initialReports.filter((r) => r.status !== "resolved");
  const resolvedReports = initialReports.filter((r) => r.status === "resolved");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug": return <Bug className="h-4 w-4" />;
      case "feature": return <Zap className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bug": return "bg-signal-red/20 text-signal-red border-signal-red/30";
      case "feature": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "stream": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const renderCard = (report: FeedbackReport) => (
    <div 
      key={report.id} 
      className={`flex flex-col gap-3 rounded-xl border border-white/10 p-5 transition-colors ${
        report.status === "resolved" ? "bg-white/[0.02] opacity-60" : "bg-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(report.category)}`}>
            {getCategoryIcon(report.category)}
            {report.category}
          </div>
          <span className="font-mono text-xs text-white/40">ID: {report.id.slice(0, 8)}...</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
          {report.timestamp ? formatDistanceToNow(new Date(report.timestamp), { addSuffix: true }) : "Unknown"}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm text-white/90">
        {report.message}
      </p>

      <div className="mt-2 border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase text-white/40">User Agent: </span>
          <span className="font-mono text-[10px] text-white/60">{report.userAgent}</span>
        </div>
        <div className="flex items-center gap-2">
          {report.status !== "resolved" && (
            <Button 
              variant="secondary"
              size="sm" 
              onClick={() => handleResolve(report)}
              disabled={isPending}
              className="h-8 gap-2 border-signal-lime/50 text-signal-lime hover:bg-signal-lime hover:text-graphite-950"
            >
              <CheckCircle2 className="h-4 w-4" />
              Resolve
            </Button>
          )}
          <Button 
            variant="destructive"
            size="sm" 
            onClick={() => handleDelete(report.id)}
            disabled={isPending}
            className="h-8 gap-2 border-signal-red/50 text-signal-red hover:bg-signal-red hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  if (initialReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
        <Server className="mb-4 h-12 w-12 text-white/20" />
        <h3 className="font-bold text-white/60">No reports found</h3>
        <p className="text-sm text-white/40">The feedback database is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {newReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Action Required ({newReports.length})</h2>
          <div className="grid gap-4">
            {newReports.map(renderCard)}
          </div>
        </div>
      )}

      {resolvedReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white/60">Resolved ({resolvedReports.length})</h2>
          <div className="grid gap-4">
            {resolvedReports.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
