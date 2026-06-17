"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReminderEngine } from "@/components/app/reminder-engine";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
            gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes during navigation
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReminderEngine />
    </QueryClientProvider>
  );
}
