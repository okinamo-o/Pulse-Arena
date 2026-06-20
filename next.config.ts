import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "streamed.pk",
        pathname: "/api/images/**"
      },
      {
        protocol: "https",
        hostname: "embed.st",
        pathname: "/**"
      }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  }
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
});
