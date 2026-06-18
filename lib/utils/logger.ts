/**
 * Centralized logger for Pulse Arena.
 * 
 * In MVP, this logs to console.
 * In production, this should be wired to Sentry, PostHog, or Datadog.
 */
export const logger = {
  error: (error: Error, context?: Record<string, unknown>) => {
    console.error("[PulseArena:Error]", error, context);
    // TODO: Add Sentry integration here
    // Sentry.captureException(error, { extra: context });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn("[PulseArena:Warn]", message, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info("[PulseArena:Info]", message, context);
  }
};
