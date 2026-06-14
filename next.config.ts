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

export default nextConfig;
