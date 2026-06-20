"use client";

import * as React from "react";
import { MessageSquarePlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const [category, setCategory] = React.useState("bug");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, category }),
      });

      if (!res.ok) {
        throw new Error("Failed to send feedback");
      }

      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          setCategory("bug");
        }, 300);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-signal-lime text-graphite-950 shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Report a bug or send feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-graphite-900 p-6 shadow-panel">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-2 text-xl font-bold text-white">Report an Issue</h2>
            <p className="mb-6 text-sm text-white/60">
              What went wrong or what feature would you like to see?
            </p>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-signal-lime" />
                <p className="font-bold text-white">Thanks!</p>
                <p className="text-sm text-white/60">We&apos;ve received your report.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-signal-lime focus:outline-none focus:ring-1 focus:ring-signal-lime"
                  disabled={status === "submitting"}
                >
                  <option value="bug" className="bg-graphite-900 text-white">Bug Report</option>
                  <option value="feature" className="bg-graphite-900 text-white">Feature Request</option>
                  <option value="stream" className="bg-graphite-900 text-white">Stream Issue</option>
                  <option value="other" className="bg-graphite-900 text-white">Other</option>
                </select>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or feedback..."
                  className="min-h-[120px] w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-signal-lime focus:outline-none focus:ring-1 focus:ring-signal-lime"
                  required
                  disabled={status === "submitting"}
                />
                
                {status === "error" && (
                  <p className="text-sm text-signal-red">{errorMsg}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={status === "submitting" || !message.trim()}
                  className="w-full"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Report"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
