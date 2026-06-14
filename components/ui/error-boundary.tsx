"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Component Boundary caught rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-graphite-900/50 p-6 text-center shadow-panel backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-orange/10 text-signal-orange">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-sm font-bold uppercase tracking-wider text-white">
            Widget signal lost
          </h3>
          <p className="mt-1 text-xs text-white/50 max-w-xs leading-normal">
            Failed to render this panel due to a data error.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4 text-xs"
            onClick={this.handleReset}
          >
            <RotateCcw className="h-3 w-3 mr-1.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
