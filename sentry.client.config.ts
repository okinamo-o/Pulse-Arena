import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // TODO: Replace with your actual DSN from Sentry.io project settings
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "dark",
      isEmailRequired: false,
      isNameRequired: false,
      buttonLabel: "Report Bug",
      submitButtonLabel: "Send Bug Report",
      formTitle: "Report an Issue",
      messagePlaceholder: "What went wrong or what feature would you like to see?",
      successMessageText: "Thanks! We've received your report.",
    }),
  ],
});
