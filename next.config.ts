import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.ppvservices.st",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "api.ppv.st",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "ppv.st",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "thumbs.poocloud.in",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**"
      }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://browser.sentry-cdn.com https://js.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https:; connect-src 'self' https://*.sentry.io;",
          },
        ],
      },
    ];
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
});
