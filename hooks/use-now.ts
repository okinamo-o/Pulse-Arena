"use client";

import { useSyncExternalStore } from "react";

let now = Date.now();
let subscribers: (() => void)[] = [];
let timer: number | null = null;

function tick() {
  now = Date.now();
  subscribers.forEach((cb) => cb());
}

function handleVisibility() {
  if (document.hidden && timer !== null) {
    window.clearInterval(timer);
    timer = null;
  } else if (!document.hidden && timer === null) {
    tick();
    timer = window.setInterval(tick, 30000);
  }
}

function subscribe(cb: () => void) {
  subscribers.push(cb);
  if (subscribers.length === 1 && typeof window !== "undefined") {
    timer = window.setInterval(tick, 30000);
    document.addEventListener("visibilitychange", handleVisibility);
  }
  return () => {
    subscribers = subscribers.filter((fn) => fn !== cb);
    if (subscribers.length === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    }
  };
}

function getSnapshot() {
  return now;
}

function getServerSnapshot() {
  // During SSR, return 0. This ensures the initial HTML exactly matches the first client render.
  // The client will then immediately subscribe and receive the actual Date.now().
  return 0; 
}

/**
 * A highly optimized global timer that updates every 30 seconds.
 * It automatically pauses when the document is hidden to save battery/CPU.
 * Prevents hydration mismatches by returning 0 during SSR.
 */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
