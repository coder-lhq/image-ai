import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "utfs.io"
      },
      {
        protocol: "https",
        hostname: "gpxe1lh3rg.ufs.sh"
      },
      {
        protocol: "https",
        hostname: "replicate.delivery"
      }
    ]
  }
};

export default nextConfig;
