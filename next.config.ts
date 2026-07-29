import type { NextConfig } from "next";

// Foundation-level config. Kept minimal on purpose — feature modules
// (image domains for book covers, redirects, etc.) will extend this
// later without altering the base structure.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
