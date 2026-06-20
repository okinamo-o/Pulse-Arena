"use client";

import * as React from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as idb from "idb-keyval";
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
            gcTime: 1000 * 60 * 60 * 2, // 2h
          }
        }
      })
  );

  const [persister] = React.useState(() =>
    createAsyncStoragePersister({
      storage: {
        getItem: async (key) => {
          const val = await idb.get(key);
          return val === undefined ? null : val;
        },
        setItem: (key, value) => idb.set(key, value),
        removeItem: (key) => idb.del(key),
      },
    })
  );

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ 
        persister, 
        maxAge: 1000 * 60 * 60 * 2, // 2h
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const keyStr = JSON.stringify(query.queryKey);
            return !keyStr.includes("telemetry") && !keyStr.includes("watch");
          }
        }
      }}
    >
      {children}
      <ReminderEngine />
    </PersistQueryClientProvider>
  );
}
