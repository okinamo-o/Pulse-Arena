import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
  title?: string;
}

export function ErrorState({ 
  message = "Failed to establish a secure connection with the sports signal provider.", 
  retry,
  title = "Signal Connection Lost" 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-md">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-red-500/20 blur-xl animate-pulse" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-display font-black uppercase tracking-wide text-white mb-2">
        {title}
      </h3>
      <p className="max-w-md text-sm font-medium leading-relaxed text-white/60 mb-6">
        {message}
      </p>
      {retry && (
        <Button onClick={retry} variant="secondary" className="gap-2 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <RefreshCcw className="h-4 w-4" />
          Reconnect Signal
        </Button>
      )}
    </div>
  );
}
